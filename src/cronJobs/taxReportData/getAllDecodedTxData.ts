import { sleep } from 'src/utils/util';
import { IDecodedTxModel } from 'src/interfaces/taxreportModels';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import { COVALENT_API_KEY, ITxnConvertModel, ITxnModel, TokenModel } from 'src/constants/tax';
import { ETHTokenList } from 'src/tokens/ethereum';
import Decimal from 'decimal.js';
import { Ticket } from './getTaxData';
import axios from 'axios';
import TaxBucketNumberModel from 'src/database/models/taxreport/taxbucketnumber.model';
import { toAddress } from './utils/transform';
import { categorizeTransaction } from './utils/categorize';
import getLPTokenPriceData from '../priceData/getLPTokenPriceData';
import getTokenPriceData from '../priceData/getTokenPriceData';
import { getTokenIdNameLogo } from './utils/exchangeUtils';

export default async function (ticket: Ticket, chainId: string, nativeToken: TokenModel, chainName: string) {
    try {
        const walletAddress = ticket.walletAddress;
        const address = ticket.address;

        if (!!walletAddress && !!chainId) {
            ///--- one time method ---///
            // const fetchURL = `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&page-size=100000&key=${COVALENT_API_KEY}`;
            // const resp = await axios.get(fetchURL);
            // sleep(1000);
            // if (resp.data.data.items.length > 0) {
            //     txnsRawData.push(...resp.data.data.items);
            // }

            ///--- bucket number method ---///
            // let bucketId = 0;
            // const bucketInfo = await TaxBucketNumberModel.findOne({
            //     address: address.toLowerCase(),
            //     wallet_address: walletAddress?.toLowerCase(),
            //     chain_id: chainId,
            // });
            // if (bucketInfo) {
            //     bucketId = bucketInfo.bucket_number;
            // }

            // let fetchURL = `https://api.covalenthq.com/v1/${chainId}/bulk/transactions/${walletAddress}/${bucketId}/?key=${COVALENT_API_KEY}`;
            // for (;;) {
            //     try {
            //         const resp = await axios.get(fetchURL);
            //         await decodingTransactions(resp.data.data.items, walletAddress, chainId, nativeToken, chainName);
            //         if (resp.data.data.links.next) {
            //             fetchURL = resp.data.data.links.next + `?key=${COVALENT_API_KEY}`;
            //         } else {
            //             const parseBucketId = fetchURL.split('/');
            //             bucketId = parseInt(parseBucketId[parseBucketId.length - 2]);
            //             await TaxBucketNumberModel.updateOne(
            //                 {
            //                     address: address.toLowerCase(),
            //                     wallet_address: walletAddress.toLowerCase(),
            //                     chain_id: chainId,
            //                 },
            //                 { bucket_number: bucketId },
            //                 { upsert: true },
            //             );
            //             sleep(1000);
            //             break;
            //         }
            //     } catch (error) {
            //         break;
            //     }
            // }

            ///--- Pagination method ---///
            let page_number = 0;
            const pageInfo = await TaxBucketNumberModel.findOne({
                address: address.toLowerCase(),
                wallet_address: walletAddress?.toLowerCase(),
                chain_id: chainId,
            });

            if (pageInfo) {
                page_number = pageInfo.bucket_number;
            }

            // Set the URL for the first page of results
            let next_url = `https://api.covalenthq.com/v1/${chainId}/address/${walletAddress}/transactions_v3/page/${page_number}/`;

            let transactions: ITxnModel[] = [];

            for (;;) {
                if (next_url) {
                    const url = `${next_url}?key=${COVALENT_API_KEY}`;
                    const resp = await axios.get(url);
                    const respdata = resp.data;
                    transactions = transactions.concat(respdata.data.items);
                    next_url = respdata.data.links.next;
                    if (next_url) {
                        const parse_url = next_url.split('/?')[0].split('/');
                        page_number = parseInt(parse_url[parse_url.length - 2]);
                    }

                    if (page_number % 2 === 0) {
                        await decodingTransactions(transactions, walletAddress, chainId, nativeToken, chainName);
                        transactions = [];
                    }
                } else {
                    if (transactions.length > 0) {
                        await decodingTransactions(transactions, walletAddress, chainId, nativeToken, chainName);
                    }
                    await TaxBucketNumberModel.updateOne(
                        {
                            address: address.toLowerCase(),
                            wallet_address: walletAddress.toLowerCase(),
                            chain_id: chainId,
                        },
                        { bucket_number: page_number },
                        { upsert: true },
                    );
                    await sleep(1000);
                    break;
                }
            }
        }
    } catch (error) {}
}

async function decodingTransactions(
    txnsRawData: ITxnModel[],
    walletAddress: string,
    chainId: string,
    nativeToken: TokenModel,
    chainName: string,
) {
    let decodedTxData: IDecodedTxModel[] = [];

    const txnsData = txnsRawData.filter(
        (txn) =>
            (txn.log_events === undefined ||
                txn.log_events === null ||
                (txn.log_events && txn.log_events.length < 20)) &&
            txn.block_height > 0,
    );

    const categorizedTransactions: ITxnConvertModel[] = txnsData.map((txn) => {
        return categorizeTransaction(txn, walletAddress);
    });

    for (let i = 0; i < categorizedTransactions.length; i++) {
        const tx = categorizedTransactions[i];
        const txDate = tx.block_signed_at.slice(0, -1).split('T').join(' ');

        if (tx.category === 'ethTransfer') {
            const txAmount = new Decimal(tx.value).div(10 ** nativeToken.decimals).toFixed();

            let tokenPrice = 0;
            try {
                tokenPrice = await getTokenPriceData(parseInt(chainId), nativeToken.address, tx.block_height);
                await sleep(2000);
            } catch (error) {
                try {
                    tokenPrice = await getLPTokenPriceData(parseInt(chainId), nativeToken.address, tx.block_height);
                    await sleep(2000);
                } catch (err) {}
            }

            decodedTxData.push({
                address: walletAddress.toLowerCase(),
                from: tx.from_address,
                to: toAddress(tx),
                txdate: txDate,
                timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                txtype: tx.flow,
                token_address: nativeToken.address,
                token_name: nativeToken.name,
                token_price: tokenPrice.toString(),
                symbol: nativeToken.symbol,
                amount: txAmount,
                feeAmount:
                    new Decimal(tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0))
                        .div(10 ** nativeToken.decimals)
                        .toFixed() +
                    ' ' +
                    nativeToken.symbol,
                feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                chain_id: chainId,
                chain_name: chainName,
                block_number: tx.block_height.toString(),
                txhash: tx.tx_hash,
                token_logo: nativeToken.logo,
            });
        } else if (tx.category === 'erc20') {
            const tokenLogItem = tx.log_events.find((item) => item.decoded?.name === 'Transfer')!;
            const tokenValueItem = tokenLogItem.decoded?.params?.filter((item) => item.name === 'value');
            const tokenIdItem = tokenLogItem.decoded?.params?.filter((item) => item.name === 'tokenId');

            let tokenPrice = 0;
            try {
                tokenPrice = await getTokenPriceData(parseInt(chainId), tokenLogItem.sender_address, tx.block_height);
                await sleep(2000);
            } catch (error) {
                try {
                    tokenPrice = await getLPTokenPriceData(
                        parseInt(chainId),
                        tokenLogItem.sender_address,
                        tx.block_height,
                    );
                    await sleep(2000);
                } catch (err) {}
            }

            if (
                tokenLogItem.sender_logo_url &&
                tokenValueItem &&
                tokenValueItem.length > 0 &&
                tokenLogItem.sender_contract_decimals
            ) {
                const txAmount = new Decimal(tokenValueItem[0].value)
                    .div(10 ** (tokenLogItem.sender_contract_decimals ?? 0))
                    .toFixed();
                const tokenData = await getTokenIdNameLogo(
                    tokenLogItem.sender_contract_ticker_symbol ?? '',
                    tokenLogItem.sender_name ?? '',
                );

                decodedTxData.push({
                    address: walletAddress.toLowerCase(),
                    from: tx.from_address,
                    to: toAddress(tx),
                    txdate: txDate,
                    timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                    txtype: tx.flow,
                    token_address: tokenLogItem.sender_address,
                    token_name: tokenLogItem.sender_name ?? '',
                    token_price: tokenPrice.toString(),
                    symbol: tokenLogItem.sender_contract_ticker_symbol ?? '',
                    amount: txAmount,
                    feeAmount:
                        new Decimal(tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0))
                            .div(10 ** nativeToken.decimals)
                            .toFixed() +
                        ' ' +
                        nativeToken.symbol,
                    feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                    chain_id: chainId,
                    chain_name: chainName,
                    block_number: tx.block_height.toString(),
                    txhash: tx.tx_hash,
                    token_logo: tokenData.tokenLogo,
                });
            } else if (tokenIdItem && tokenIdItem.length > 0 && tx.log_events[0].sender_logo_url) {
                const txAmount = tokenIdItem[0].value.toString();
                const tokenData = await getTokenIdNameLogo(
                    tx.log_events[0].sender_contract_ticker_symbol ?? '',
                    tx.log_events[0].sender_name ?? '',
                );

                decodedTxData.push({
                    address: walletAddress.toLowerCase(),
                    from: tx.from_address,
                    to: toAddress(tx),
                    txdate: txDate,
                    timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                    txtype: tx.flow,
                    token_address: tx.to_address,
                    token_name: tx.log_events[0].sender_name ?? '',
                    token_price: tokenPrice.toString(),
                    symbol: tx.log_events[0].sender_contract_ticker_symbol ?? '',
                    amount: txAmount,
                    feeAmount:
                        new Decimal(tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0))
                            .div(10 ** nativeToken.decimals)
                            .toFixed() +
                        ' ' +
                        nativeToken.symbol,
                    feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                    chain_id: chainId,
                    chain_name: chainName,
                    block_number: tx.block_height.toString(),
                    txhash: tx.tx_hash,
                    token_logo: tokenData.tokenLogo,
                });
            }
        } else if (tx.category === 'swap') {
            const sendTransfer = tx.log_events.find((logEvent) => {
                if (logEvent) {
                    const fromAddress = logEvent.decoded?.params?.find(
                        (item) => item.name === 'from' && item.value.toLowerCase() === tx.from_address.toLowerCase(),
                    );
                    return logEvent.decoded?.name === 'Transfer' && fromAddress;
                }
            });
            const receiveTransfer = tx.log_events.find((logEvent) => {
                if (logEvent) {
                    const toAddress = logEvent.decoded?.params?.find(
                        (item) => item.name === 'to' && item.value.toLowerCase() === tx.from_address.toLowerCase(),
                    );
                    return logEvent.decoded?.name === 'Transfer' && toAddress;
                }
            });
            if (sendTransfer) {
                const tokenValueItem = sendTransfer.decoded?.params?.find((item) => item.name === 'value');
                if (sendTransfer.sender_logo_url && tokenValueItem && sendTransfer.sender_contract_decimals) {
                    const txAmount = new Decimal(tokenValueItem.value)
                        .div(10 ** (sendTransfer.sender_contract_decimals ?? 0))
                        .toFixed();
                    const sendTokenData = await getTokenIdNameLogo(
                        sendTransfer.sender_contract_ticker_symbol ?? '',
                        sendTransfer.sender_name ?? '',
                    );

                    let tokenPrice = 0;
                    try {
                        tokenPrice = await getTokenPriceData(
                            parseInt(chainId),
                            sendTransfer.sender_address,
                            tx.block_height,
                        );
                        await sleep(2000);
                    } catch (error) {
                        try {
                            tokenPrice = await getLPTokenPriceData(
                                parseInt(chainId),
                                sendTransfer.sender_address,
                                tx.block_height,
                            );
                            await sleep(2000);
                        } catch (err) {}
                    }

                    let receiveTokenPrice = 0;
                    let receiveTokenAmount = '';

                    if (receiveTransfer) {
                        const tokenReceiveValueItem = receiveTransfer.decoded?.params?.find(
                            (item) => item.name === 'value',
                        );
                        if (
                            receiveTransfer.sender_logo_url &&
                            tokenReceiveValueItem &&
                            receiveTransfer.sender_contract_decimals
                        ) {
                            receiveTokenAmount = new Decimal(tokenReceiveValueItem.value)
                                .div(10 ** (receiveTransfer.sender_contract_decimals ?? 0))
                                .toFixed();

                            try {
                                receiveTokenPrice = await getTokenPriceData(
                                    parseInt(chainId),
                                    receiveTransfer?.sender_address,
                                    tx.block_height,
                                );
                                await sleep(2000);
                            } catch (error) {
                                try {
                                    receiveTokenPrice = await getLPTokenPriceData(
                                        parseInt(chainId),
                                        receiveTransfer?.sender_address,
                                        tx.block_height,
                                    );
                                    await sleep(2000);
                                } catch (err) {}
                            }
                        }
                    }
                    const receiveTokenData = await getTokenIdNameLogo(
                        receiveTransfer?.sender_contract_ticker_symbol ?? '',
                        receiveTransfer?.sender_name ?? '',
                    );

                    decodedTxData.push({
                        address: walletAddress.toLowerCase(),
                        from: tx.from_address,
                        to: tx.from_address,
                        txdate: txDate,
                        timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                        txtype: tx.flow,
                        token_address: sendTransfer.sender_address ?? '',
                        token_name: sendTransfer.sender_name ?? '',
                        token_price: tokenPrice.toString(),
                        symbol: sendTransfer.sender_contract_ticker_symbol ?? '',
                        amount: txAmount,
                        receive_token_address: receiveTransfer?.sender_address ?? '',
                        receive_token_name: receiveTransfer?.sender_name ?? '',
                        receive_token_price: receiveTokenPrice.toString(),
                        receive_symbol: receiveTransfer?.sender_contract_ticker_symbol ?? '',
                        receive_amount: receiveTokenAmount,
                        feeAmount:
                            new Decimal(
                                tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0),
                            )
                                .div(10 ** nativeToken.decimals)
                                .toFixed() +
                            ' ' +
                            nativeToken.symbol,
                        feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                        chain_id: chainId,
                        chain_name: chainName,
                        block_number: tx.block_height.toString(),
                        txhash: tx.tx_hash,
                        token_logo: sendTokenData.tokenLogo,
                        receive_token_logo: receiveTokenData.tokenLogo,
                    });
                } else {
                    decodedTxData.push({
                        address: walletAddress.toLowerCase(),
                        from: tx.from_address,
                        to: toAddress(tx),
                        txdate: txDate,
                        timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                        txtype: tx.flow,
                        token_address: '',
                        token_name: '',
                        token_price: '0',
                        symbol: '',
                        amount: '0',
                        feeAmount:
                            new Decimal(
                                tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0),
                            )
                                .div(10 ** nativeToken.decimals)
                                .toFixed() +
                            ' ' +
                            nativeToken.symbol,
                        feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                        chain_id: chainId,
                        chain_name: chainName,
                        block_number: tx.block_height.toString(),
                        txhash: tx.tx_hash,
                        token_logo: '',
                    });
                }
            } else {
                decodedTxData.push({
                    address: walletAddress.toLowerCase(),
                    from: tx.from_address,
                    to: toAddress(tx),
                    txdate: txDate,
                    timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                    txtype: tx.flow,
                    token_address: '',
                    token_name: '',
                    token_price: '0',
                    symbol: '',
                    amount: '0',
                    feeAmount:
                        new Decimal(tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0))
                            .div(10 ** nativeToken.decimals)
                            .toFixed() +
                        ' ' +
                        nativeToken.symbol,
                    feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                    chain_id: chainId,
                    chain_name: chainName,
                    block_number: tx.block_height.toString(),
                    txhash: tx.tx_hash,
                    token_logo: '',
                });
            }
        } else {
            decodedTxData.push({
                address: walletAddress.toLowerCase(),
                from: tx.from_address,
                to: toAddress(tx),
                txdate: txDate,
                timestamp: new Date(tx.block_signed_at).getTime() / 1000,
                txtype: tx.flow,
                token_address: '',
                token_name: '',
                token_price: '0',
                symbol: '',
                amount: '0',
                feeAmount:
                    new Decimal(tx.fees_paid ?? (tx.gas_price && tx.gas_spent ? tx.gas_spent * tx.gas_price : 0))
                        .div(10 ** nativeToken.decimals)
                        .toFixed() +
                    ' ' +
                    nativeToken.symbol,
                feePrice: tx.gas_quote ? tx.gas_quote.toString() : '',
                chain_id: chainId,
                chain_name: chainName,
                block_number: tx.block_height.toString(),
                txhash: tx.tx_hash,
                token_logo: '',
            });
            // const decodedData = tx.log_events[0].decoded;

            // if (
            //     decodedData &&
            //     decodedData.name === 'Transfer' &&
            //     decodedData.params &&
            //     (decodedData.params[2].name === 'value' || decodedData.params[2].name === 'tokenId')
            // ) {
            //     const txToken = ETHTokenList.filter(
            //         (item) => item.address.toLowerCase() === tx.to_address.toLowerCase(),
            //     );
            //     const txTokenSymbol = txToken.length > 0 ? txToken[0].symbol : '';
            //     const txTokenName = txToken.length > 0 ? txToken[0].name : '';
            //     const txAmount = new Decimal(decodedData.params ? decodedData.params[2].value : 0)
            //         .div(10 ** (tx.log_events[0].sender_contract_decimals ?? 0))
            //         .toFixed();
            //     const txLogo = txToken.length > 0 ? txToken[0].logo : '';

            //     decodedTxData.push({
            //         address: walletAddress.toLowerCase(),
            //         from: tx.from_address,
            //         to: decodedData.params ? decodedData.params[1].value : '',
            //         txdate: txDate,
            //         timestamp: new Date(tx.block_signed_at).getTime() / 1000,
            //         txtype: 'Transfer',
            //         token_address: tx.to_address,
            //         token_name: tx.log_events[0].sender_name ?? '',
            //         token_price: '',
            //         symbol: tx.log_events[0].sender_contract_ticker_symbol ?? '',
            //         amount: txAmount,
            //         feeAmount: '',
            //         feePrice: '',
            //         chain_id: chainId,
            //         chain_name: chainName,
            //         block_number: tx.block_height.toString(),
            //         txhash: tx.tx_hash,
            //         token_logo: txLogo,
            //     });
            // }
        }
    }

    if (decodedTxData.length > 0) {
        const updateIds = decodedTxData.map((item) => {
            return item.txhash;
        });

        await DecodedTxModel.deleteMany({
            $and: [{ txhash: { $in: updateIds } }, { address: walletAddress.toLowerCase() }, { chain_id: chainId }],
        });

        await DecodedTxModel.insertMany(decodedTxData);
    }
    await sleep(1000);
}
