import axios from 'axios';
import Decimal from 'decimal.js';
import { COVALENT_API_KEY, TokenModel } from 'src/constants/tax';
import { IDecodedTxModel, IGainModel, ILatestBlockModel } from 'src/interfaces/taxreportModels';
import { ArbitrumTokenList } from 'src/tokens/arbitrum';
import { AvalancheTokenList } from 'src/tokens/avalanche';
import { BSCTokenList } from 'src/tokens/binance';
import { ETHTokenList } from 'src/tokens/ethereum';
import { FTMTokenList } from 'src/tokens/fantom';
import { PolygonTokenList } from 'src/tokens/polygon';

export const getTokenLists = (chainId: string): TokenModel[] => {
    switch (chainId) {
        case '1':
            return ETHTokenList;
            break;
        case '250':
            return FTMTokenList;
            break;
        case '42161':
            return ArbitrumTokenList;
            break;
        case '56':
            return BSCTokenList;
            break;
        case '137':
            return PolygonTokenList;
            break;
        case '43114':
            return AvalancheTokenList;
            break;

        default:
            return ETHTokenList;
            break;
    }
};

export const getLatestBlockNumber = async () => {
    const chainIds = ['1', '10', '250', '137', '56', '42161', '43114'];
    const latestBlockNumber: ILatestBlockModel[] = [];
    for (let i = 0; i < chainIds.length; i++) {
        const latestTokenUrl = `https://api.covalenthq.com/v1/${chainIds[i]}/block_v2/latest/?key=${COVALENT_API_KEY}`;
        const resp = await axios.get(latestTokenUrl);
        const respdata = resp.data;
        latestBlockNumber.push({ chainId: chainIds[i], blocknumber: respdata.data?.items[0].height ?? 0 });
    }

    return latestBlockNumber;
};

export const getTxnGainWithPeriod = (txnData: IDecodedTxModel[]) => {
    const tokenGainList: IGainModel[] = [];

    for (let i = 0; i < txnData.length; i++) {
        const tx = txnData[i];

        let indexToUpdate = tokenGainList.findIndex(
            (item) =>
                item.tokenAddress.toLowerCase() === tx.token_address.toLowerCase() &&
                item.walletAddress.toLowerCase() === tx.address.toLowerCase() &&
                item.chainId === tx.chain_id,
        );

        if (tx.txtype === 'Receive') {
            if (indexToUpdate !== -1) {
                tokenGainList[indexToUpdate].tokenAmount = new Decimal(tokenGainList[indexToUpdate].tokenAmount)
                    .add(new Decimal(tx.amount))
                    .toFixed();
                tokenGainList[indexToUpdate].tokenCost = new Decimal(tokenGainList[indexToUpdate].tokenCost)
                    .add(new Decimal(tx.token_price).mul(new Decimal(tx.amount)))
                    .toFixed();
                tokenGainList[indexToUpdate].lastTokenPrice = tx.token_price;
            } else {
                tokenGainList.push({
                    tokenAddress: tx.token_address,
                    chainId: tx.chain_id,
                    walletAddress: tx.address,
                    tokenSymbol: tx.symbol,
                    tokenAmount: tx.amount,
                    tokenCost: new Decimal(tx.token_price).mul(new Decimal(tx.amount)).toFixed(),
                    soldTokenAmount: '0',
                    lastTokenPrice: tx.token_price,
                    realGain: '0',
                });
            }
        } else if (tx.txtype === 'Exchange') {
            let indexRtUpdate = tokenGainList.findIndex(
                (item) =>
                    item.tokenAddress.toLowerCase() === tx.receive_token_address?.toLowerCase() &&
                    item.walletAddress.toLowerCase() === tx.address.toLowerCase() &&
                    item.chainId === tx.chain_id,
            );

            const receiveAmount = tx.receive_amount !== '' ? tx.receive_amount : '0';
            const receiveTokenPrice = tx.receive_token_price !== '' ? tx.receive_token_price : '0';

            if (indexRtUpdate !== -1) {
                tokenGainList[indexRtUpdate].tokenAmount = new Decimal(tokenGainList[indexRtUpdate].tokenAmount)
                    .add(new Decimal(receiveAmount ?? '0'))
                    .toFixed();
                tokenGainList[indexRtUpdate].tokenCost = new Decimal(tokenGainList[indexRtUpdate].tokenCost)
                    .add(new Decimal(receiveTokenPrice ?? '0').mul(new Decimal(receiveAmount ?? '0')))
                    .toFixed();
                tokenGainList[indexRtUpdate].lastTokenPrice = new Decimal(receiveTokenPrice ?? '0').toFixed();
            } else {
                tokenGainList.push({
                    tokenAddress: tx.receive_token_address ?? '',
                    chainId: tx.chain_id,
                    walletAddress: tx.address,
                    tokenSymbol: tx.receive_symbol ?? '',
                    tokenAmount: receiveAmount ?? '0',
                    tokenCost: new Decimal(receiveTokenPrice ?? '0').mul(new Decimal(receiveAmount ?? '0')).toFixed(),
                    soldTokenAmount: '0',
                    lastTokenPrice: new Decimal(receiveTokenPrice ?? '0').toFixed(),
                    realGain: '0',
                });
            }
        }

        if (tx.txtype === 'Send' || tx.txtype === 'Exchange') {
            let realGainAmount = new Decimal(tx.token_price).mul(new Decimal(tx.amount));

            if (indexToUpdate !== -1) {
                if (new Decimal(tokenGainList[indexToUpdate].tokenAmount).gt(0)) {
                    realGainAmount = new Decimal(tx.token_price)
                        .sub(
                            new Decimal(tokenGainList[indexToUpdate].tokenCost).div(
                                new Decimal(tokenGainList[indexToUpdate].tokenAmount),
                            ),
                        )
                        .mul(new Decimal(tx.amount));
                }

                tokenGainList[indexToUpdate].realGain = new Decimal(tokenGainList[indexToUpdate].realGain)
                    .add(realGainAmount)
                    .toFixed();
                tokenGainList[indexToUpdate].lastTokenPrice = tx.token_price;
                tokenGainList[indexToUpdate].soldTokenAmount = new Decimal(tokenGainList[indexToUpdate].soldTokenAmount)
                    .add(tx.amount)
                    .toFixed();
            } else {
                tokenGainList.push({
                    tokenAddress: tx.token_address,
                    chainId: tx.chain_id,
                    walletAddress: tx.address,
                    tokenSymbol: tx.symbol,
                    tokenAmount: '0',
                    tokenCost: '0',
                    soldTokenAmount: tx.amount,
                    lastTokenPrice: tx.token_price,
                    realGain: realGainAmount.toFixed(),
                });
            }
        }
    }

    return tokenGainList;
};
