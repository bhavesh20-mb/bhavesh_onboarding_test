import { DepositRecordV5, WithdrawalRecordV5 } from 'bybit-api';
import Decimal from 'decimal.js';
import { Trade as GateioTrade, LedgerRecord } from 'gate-api';
import { COINGECKO_API_KEY } from 'src/constants';
import PriceModel from 'src/database/models/price.model';
import TaxCoinModel from 'src/database/models/taxreport/coin.model';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import { CoinGeckoInfo } from 'src/interfaces/apiDataModels';
import { IDecodedTxModel, ITaxBybitHistoryModel } from 'src/interfaces/taxreportModels';
import { CoinList } from 'src/tokens/coinlist';
import { sleep } from 'src/utils/util';
import { IKucoinDeposit, IKucoinOrderHistory, IKucoinWithdraw } from '../exchanges/getKucoinData';

/**
 * Fetch token price from DB
 * @param chainName (string)
 * @param tokenAddress (string)
 * @param timestamp (number)
 * @returns { result, price, priceUnit } ({ bool, number, string })
 */
export async function getTokenPriceFromDB(chainName: string, tokenAddress: string, timestamp: number) {
    try {
        const result = await PriceModel.findOne({
            $and: [{ chainName: chainName.toLowerCase() }, { tokenAddress: tokenAddress }, { timestamp: timestamp }],
        });

        if (result == undefined) {
            return {
                result: false,
                price: 0,
                priceUnit: 'USD',
            };
        }

        return {
            result: true,
            price: result.price,
            priceUnit: result.priceUnit,
        };
    } catch (e) {
        // console.log(e);

        return {
            result: false,
            price: 0,
            priceUnit: 'USD',
        };
    }
}

/**
 * Handle bybit history decoding
 * @param address (string)
 * @param histories (ITaxBybitHistoryModel[])
 * @returns null
 */
export async function handleBybitHistory(address: string, histories: ITaxBybitHistoryModel[]) {
    if (histories.length === 0) {
        return;
    }

    let decodedTxData: IDecodedTxModel[] = [];

    for (let i = 0; i < histories.length; i++) {
        const historyTx = histories[i];
        const timestamp = Math.floor(parseInt(historyTx.executionTime) / 1000);
        const txdate = new Date(parseInt(historyTx.executionTime));

        const rcvToken = await getTokenIdNameLogo(historyTx.feeTokenId);
        const sendTokenSymbol = historyTx.symbol.replace(historyTx.feeTokenId, '');
        const sendToken = await getTokenIdNameLogo(sendTokenSymbol);
        const sendTokenPrice = await getTokenPrice('trade', sendToken.tokenId, txdate);

        let feePrice = '';
        try {
            feePrice = new Decimal(historyTx.execFee).mul(historyTx.orderPrice).toFixed();
        } catch (error) {}

        let sendAmount = '0';
        try {
            sendAmount = new Decimal(historyTx.orderQty).mul(historyTx.orderPrice).div(sendTokenPrice).toFixed();
        } catch (error) {}

        decodedTxData.push({
            address: address,
            from: '',
            to: '',
            txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
            timestamp: timestamp,
            txtype: 'Exchange',
            token_address: '',
            token_name: sendToken.tokenName,
            token_price: sendTokenPrice,
            symbol: sendTokenSymbol,
            amount: sendAmount,
            receive_token_address: '',
            receive_token_name: rcvToken.tokenName,
            receive_token_price: historyTx.orderPrice,
            receive_symbol: historyTx.feeTokenId,
            receive_amount: historyTx.orderQty,
            feeAmount: historyTx.execFee + ' ' + historyTx.feeTokenId,
            feePrice: feePrice,
            chain_id: '',
            chain_name: '',
            block_number: historyTx.id,
            txhash: historyTx.tradeId,
            token_logo: sendToken.tokenLogo,
            receive_token_logo: rcvToken.tokenLogo,
        });
    }

    await insertDecodedData(address, decodedTxData);
    await sleep(1000);
}

export const handleBybitDeposit = async (address: string, depositArray: DepositRecordV5[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (depositArray.length > 0) {
        for (let j = 0; j < depositArray.length; j++) {
            const depositTx = depositArray[j];
            const timestamp = Math.floor(parseInt(depositTx.successAt) / 1000);
            const txdate = new Date(parseInt(depositTx.successAt));
            const token = await getTokenIdNameLogo(depositTx.coin);
            const tokenPrice = await getTokenPrice(depositTx.chain, token.tokenId, txdate);

            let feePrice = '';
            try {
                feePrice = new Decimal(depositTx.depositFee).mul(tokenPrice).toFixed();
            } catch (error) {}

            decodedTxData.push({
                address: address,
                from: '',
                to: depositTx.toAddress,
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Deposit',
                token_address: '',
                token_name: token.tokenName,
                token_price: tokenPrice,
                symbol: depositTx.coin,
                amount: depositTx.amount,
                feeAmount: depositTx.depositFee + ' ' + depositTx.coin,
                feePrice: feePrice,
                chain_id: '',
                chain_name: depositTx.chain,
                block_number: '0',
                txhash: depositTx.txID,
                token_logo: token.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};

export const handleBybitWithdraw = async (address: string, withdrawArray: WithdrawalRecordV5[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (withdrawArray.length > 0) {
        for (let j = 0; j < withdrawArray.length; j++) {
            const withdrawTx = withdrawArray[j];
            const timestamp = Math.floor(parseInt(withdrawTx.updateTime) / 1000);
            const txdate = new Date(parseInt(withdrawTx.updateTime));
            const token = await getTokenIdNameLogo(withdrawTx.coin);
            const tokenPrice = await getTokenPrice(withdrawTx.chain, token.tokenId, txdate);

            let feePrice = '';
            try {
                feePrice = new Decimal(withdrawTx.withdrawFee).mul(tokenPrice).toFixed();
            } catch (error) {}

            decodedTxData.push({
                address: address,
                from: '',
                to: withdrawTx.toAddress,
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Withdraw',
                token_address: '',
                token_name: token.tokenName,
                token_price: tokenPrice,
                symbol: withdrawTx.coin,
                amount: withdrawTx.amount,
                feeAmount: withdrawTx.withdrawFee + ' ' + withdrawTx.coin,
                feePrice: feePrice,
                chain_id: '',
                chain_name: withdrawTx.chain,
                block_number: '0',
                txhash: withdrawTx.txID,
                token_logo: token.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};

export async function insertDecodedData(address: string, decodedTxData: IDecodedTxModel[]) {
    if (decodedTxData.length > 0) {
        const updateIds = decodedTxData.map((item) => {
            return item.txhash;
        });

        await DecodedTxModel.deleteMany({
            $and: [{ txhash: { $in: updateIds } }, { address: address }],
        });

        await DecodedTxModel.insertMany(decodedTxData);
    }
}

export const getTokenIdNameLogo = async (
    symbol: string,
    name?: string,
): Promise<{ tokenId: string; tokenName: string; tokenLogo: string }> => {
    let tokenLogo = '';
    let tokenId = '';
    let tokenName = '';

    if (symbol !== '') {
        try {
            const coin = CoinList.find(
                (coin) =>
                    coin.symbol.toLowerCase() === symbol.toLowerCase() &&
                    (name && name !== '' ? coin.name.toLowerCase() === name.toLowerCase() : true),
            );
            const coindata = await TaxCoinModel.findOne({ symbol: symbol.toLowerCase(), name: name });
            if (!!coindata) {
                tokenLogo = coindata.logo;
                tokenId = coindata.id;
                tokenName = coindata.name;
            } else {
                if (coin) {
                    tokenId = coin.id;
                    tokenName = coin.name;
                    const coinInfo: CoinGeckoInfo = await fetch(
                        `https://pro-api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
                    ).then((res) => res.json());
                    tokenLogo = coinInfo.image?.thumb ?? '';
                    await TaxCoinModel.insertMany([
                        {
                            id: coin.id,
                            symbol: coin.symbol.toLowerCase(),
                            name: coin.name,
                            logo: tokenLogo,
                        },
                    ]);
                }
            }
        } catch (error) {}
    }

    return { tokenId, tokenName, tokenLogo };
};

export const getTokenPrice = async (chainName: string, tokenId: string, txdate: Date): Promise<string> => {
    let tokenPrice = '0';
    if (tokenId !== '') {
        const day = txdate.getDate().toString().padStart(2, '0');
        const month = (txdate.getMonth() + 1).toString().padStart(2, '0');
        const year = txdate.getFullYear().toString();

        // Create the formatted date string
        const formattedDate = `${day}-${month}-${year}`;
        const tokenTimestamp = Math.floor(new Date(`${year}-${month}-${day}`).getTime() / 1000);
        const priceData = await getTokenPriceFromDB(chainName.toLowerCase(), tokenId, tokenTimestamp);
        if (priceData.result) {
            tokenPrice = priceData.price.toString();
        } else {
            const price = await fetch(
                `https://pro-api.coingecko.com/api/v3/coins/${tokenId}?date=${formattedDate}&x_cg_pro_api_key=${COINGECKO_API_KEY}`,
            ).then((res) => res.json());

            try {
                tokenPrice = price.market_data.current_price.usd.toString();
            } catch (error) {}

            if (parseFloat(tokenPrice) !== 0) {
                await PriceModel.insertMany([
                    {
                        chainName: chainName.toLowerCase(),
                        tokenAddress: tokenId,
                        price: parseFloat(tokenPrice),
                        priceUnit: 'USD',
                        blockNumber: 0,
                        timestamp: tokenTimestamp,
                    },
                ]);
            }
        }
    }
    return tokenPrice;
};

// Gate.io
export const handleGateioHistory = async (address: string, historyArray: GateioTrade[]) => {
    if (historyArray.length === 0) {
        return;
    }

    let decodedTxData: IDecodedTxModel[] = [];

    for (let i = 0; i < historyArray.length; i++) {
        const historyTx = historyArray[i];
        const timestamp = parseInt(historyTx.createTime ?? '0');
        const txdate = new Date(parseInt(historyTx.createTimeMs ?? '0'));

        let rcvToken = { tokenId: '', tokenName: '', tokenLogo: '' };
        if (historyTx.feeCurrency) {
            rcvToken = await getTokenIdNameLogo(historyTx.feeCurrency);
        }

        const sendTokenSymbol = historyTx.currencyPair?.replace(historyTx.feeCurrency ?? '', '').replace('_', '');
        let sendToken = { tokenId: '', tokenName: '', tokenLogo: '' };
        if (sendTokenSymbol) {
            sendToken = await getTokenIdNameLogo(sendTokenSymbol);
        }
        let sendTokenPrice = '0';
        if (sendToken.tokenId !== '') {
            sendTokenPrice = await getTokenPrice('trade', sendToken.tokenId, txdate);
        }

        let feePrice = '0';
        try {
            feePrice = new Decimal(historyTx.fee ?? '0').mul(historyTx.price ?? '0').toFixed();
        } catch (error) {}

        let sendAmount = '0';
        try {
            sendAmount = new Decimal(historyTx.amount ?? '0')
                .mul(historyTx.price ?? '0')
                .div(sendTokenPrice)
                .toFixed();
        } catch (error) {}

        decodedTxData.push({
            address: address,
            from: '',
            to: '',
            txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
            timestamp: timestamp,
            txtype: 'Exchange',
            token_address: '',
            token_name: sendToken.tokenName,
            token_price: sendTokenPrice,
            symbol: sendTokenSymbol ?? '',
            amount: sendAmount,
            receive_token_address: '',
            receive_token_name: rcvToken.tokenName,
            receive_token_price: historyTx.price ?? '0',
            receive_symbol: historyTx.feeCurrency ?? '',
            receive_amount: historyTx.amount ?? '0',
            feeAmount: (historyTx.fee ?? '0') + ' ' + (historyTx.feeCurrency ?? ''),
            feePrice: feePrice,
            chain_id: '',
            chain_name: '',
            block_number: historyTx.orderId ?? '',
            txhash: historyTx.id ?? '',
            token_logo: sendToken.tokenLogo,
            receive_token_logo: rcvToken.tokenLogo,
        });
    }

    await insertDecodedData(address, decodedTxData);
    await sleep(1000);
};

export const handleGateioDeposit = async (address: string, depositArray: LedgerRecord[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (depositArray.length > 0) {
        for (let j = 0; j < depositArray.length; j++) {
            const depositTx = depositArray[j];
            const timestamp = parseInt(depositTx.timestamp ?? '0');
            const txdate = new Date(timestamp * 1000);
            let token = { tokenId: '', tokenName: '', tokenLogo: '' };
            if (depositTx.currency) {
                token = await getTokenIdNameLogo(depositTx.currency);
            }
            let tokenPrice = '0';
            if (token.tokenId !== '') {
                tokenPrice = await getTokenPrice(depositTx.chain, token.tokenId, txdate);
            }

            let feePrice = '0';

            decodedTxData.push({
                address: address,
                from: '',
                to: depositTx.address ?? '',
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Deposit',
                token_address: '',
                token_name: token.tokenName,
                token_price: tokenPrice,
                symbol: depositTx.currency ?? '',
                amount: depositTx.amount,
                feeAmount: '0 ' + (depositTx.currency ?? ''),
                feePrice: feePrice,
                chain_id: '',
                chain_name: depositTx.chain,
                block_number: depositTx.id ?? '',
                txhash: depositTx.txid ?? '',
                token_logo: token.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};

export const handleGateioWithdraw = async (address: string, withdrawArray: LedgerRecord[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (withdrawArray.length > 0) {
        for (let j = 0; j < withdrawArray.length; j++) {
            const withdrawTx = withdrawArray[j];
            const timestamp = parseInt(withdrawTx.timestamp ?? '0');
            const txdate = new Date(timestamp * 1000);
            let token = { tokenId: '', tokenName: '', tokenLogo: '' };
            if (withdrawTx.currency) {
                token = await getTokenIdNameLogo(withdrawTx.currency);
            }
            let tokenPrice = '0';
            if (token.tokenId !== '') {
                tokenPrice = await getTokenPrice(withdrawTx.chain, token.tokenId, txdate);
            }

            let feePrice = '0';
            try {
                feePrice = new Decimal(withdrawTx.fee ?? '0').mul(tokenPrice).toFixed();
            } catch (error) {}

            decodedTxData.push({
                address: address,
                from: '',
                to: withdrawTx.address ?? '',
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Withdraw',
                token_address: '',
                token_name: token.tokenName,
                token_price: tokenPrice,
                symbol: withdrawTx.currency ?? '',
                amount: withdrawTx.amount,
                feeAmount: (withdrawTx.fee ?? '0') + ' ' + (withdrawTx.currency ?? ''),
                feePrice: feePrice,
                chain_id: '',
                chain_name: withdrawTx.chain,
                block_number: withdrawTx.id ?? '',
                txhash: withdrawTx.txid ?? '',
                token_logo: token.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};

// KuCoin
export const handleKuCoinDeposit = async (address: string, depositArray: IKucoinDeposit[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (depositArray.length > 0) {
        for (let i = 0; i < depositArray.length; i++) {
            const depositTx = depositArray[i];
            const timestamp = Math.floor(depositTx.updatedAt / 1000);
            const txdate = new Date(depositTx.updatedAt);

            const token = await getTokenIdNameLogo(depositTx.currency);
            const tokenPrice = await getTokenPrice(depositTx.chain, token.tokenId, txdate);

            const feePrice = new Decimal(depositTx.fee).mul(tokenPrice).toFixed();

            decodedTxData.push({
                address: address,
                from: '',
                to: depositTx.address ?? '',
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Deposit',
                token_address: '',
                token_name: token.tokenName,
                token_price: tokenPrice,
                symbol: depositTx.currency ?? '',
                amount: depositTx.amount.toString(),
                feeAmount: depositTx.fee + ' ' + (depositTx.currency ?? ''),
                feePrice: feePrice,
                chain_id: '',
                chain_name: depositTx.chain,
                block_number: '',
                txhash: depositTx.walletTxId ?? '',
                token_logo: token.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};

export const handleKuCoinWithdraw = async (address: string, withdrawArray: IKucoinWithdraw[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (withdrawArray.length > 0) {
        for (let i = 0; i < withdrawArray.length; i++) {
            const withdrawTx = withdrawArray[i];
            const timestamp = Math.floor(withdrawTx.updatedAt / 1000);
            const txdate = new Date(withdrawTx.updatedAt);

            const token = await getTokenIdNameLogo(withdrawTx.currency);
            const tokenPrice = await getTokenPrice(withdrawTx.chain, token.tokenId, txdate);

            const feePrice = new Decimal(withdrawTx.fee).mul(tokenPrice).toFixed();

            decodedTxData.push({
                address: address,
                from: '',
                to: withdrawTx.address ?? '',
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Withdraw',
                token_address: '',
                token_name: token.tokenName,
                token_price: tokenPrice,
                symbol: withdrawTx.currency ?? '',
                amount: withdrawTx.amount.toString(),
                feeAmount: withdrawTx.fee + ' ' + (withdrawTx.currency ?? ''),
                feePrice: feePrice,
                chain_id: '',
                chain_name: withdrawTx.chain,
                block_number: '',
                txhash: withdrawTx.walletTxId ?? '',
                token_logo: token.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};

export const handleKuCoinTrade = async (address: string, historyArray: IKucoinOrderHistory[]) => {
    let decodedTxData: IDecodedTxModel[] = [];
    if (historyArray.length > 0) {
        for (let i = 0; i < historyArray.length; i++) {
            const historyTx = historyArray[i];
            const timestamp = Math.floor(historyTx.createdAt / 1000);
            const txdate = new Date(historyTx.createdAt);

            let rcvToken = await getTokenIdNameLogo(historyTx.feeCurrency);
            let receiveTokenSymbol = historyTx.feeCurrency;
            let sendTokenSymbol = historyTx.symbol.replace('-', '').replace(historyTx.feeCurrency, '');
            let sendToken = await getTokenIdNameLogo(sendTokenSymbol);
            let sendTokenPrice = '';
            let receiveTokenPrice = '';
            let sendAmount = '';
            let receiveAmount = '';
            let feeAmount = '';
            if (historyTx.side === 'buy') {
                const temp = rcvToken;
                rcvToken = sendToken;
                sendToken = temp;
                receiveTokenPrice = historyTx.price.toString();
                sendTokenPrice = await getTokenPrice('trade', sendToken.tokenId, txdate);
                receiveAmount = historyTx.size.toString();
                sendAmount = new Decimal(historyTx.funds).div(sendTokenPrice).toFixed();
                feeAmount = new Decimal(historyTx.fee).div(sendTokenPrice).toFixed();
                const tempSymbol = receiveTokenSymbol;
                receiveTokenSymbol = sendTokenSymbol;
                sendTokenSymbol = tempSymbol;
            }
            if (historyTx.side === 'sell') {
                sendTokenPrice = historyTx.price.toString();
                receiveTokenPrice = await getTokenPrice('trade', rcvToken.tokenId, txdate);
                sendAmount = historyTx.size.toString();
                receiveAmount = new Decimal(historyTx.funds).div(receiveTokenPrice).toFixed();
                feeAmount = new Decimal(historyTx.fee).div(receiveTokenPrice).toFixed();
            }

            decodedTxData.push({
                address: address,
                from: '',
                to: '',
                txdate: txdate.toISOString().slice(0, -1).replace('T', ' '),
                timestamp: timestamp,
                txtype: 'Exchange',
                token_address: '',
                token_name: sendToken.tokenName,
                token_price: sendTokenPrice,
                symbol: sendTokenSymbol,
                amount: sendAmount,
                receive_token_address: '',
                receive_token_name: rcvToken.tokenName,
                receive_token_price: receiveTokenPrice,
                receive_symbol: receiveTokenSymbol,
                receive_amount: receiveAmount,
                feeAmount: feeAmount + ' ' + historyTx.feeCurrency,
                feePrice: historyTx.fee.toString(),
                chain_id: '',
                chain_name: '',
                block_number: historyTx.orderId,
                txhash: historyTx.tradeId,
                token_logo: sendToken.tokenLogo,
                receive_token_logo: rcvToken.tokenLogo,
            });
        }

        await insertDecodedData(address, decodedTxData);
        await sleep(1000);
    }
};
