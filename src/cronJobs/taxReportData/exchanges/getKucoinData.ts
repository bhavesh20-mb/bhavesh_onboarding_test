import { sleep } from 'src/utils/util';
import { handleKuCoinDeposit, handleKuCoinTrade, handleKuCoinWithdraw } from '../utils/exchangeUtils';
import TaxBucketNumberModel from 'src/database/models/taxreport/taxbucketnumber.model';

const API = require('kucoin-node-sdk');

// const config = {
//     apiKey: '6409df250bea5b000183f58e',
//     secretKey: '0e95cddc-0737-4124-9ca0-a25701c4d519',
//     passphrase: 'KHGkhg1016!',
//     environment: 'live'
// }
export interface IKucoinDeposit {
    currency: string;
    chain: string;
    status: string; // Available value: PROCESSING, SUCCESS, and FAILURE
    address: string;
    memo: string;
    isInner: boolean;
    amount: number;
    fee: number;
    walletTxId: string;
    createdAt: number;
    updatedAt: number;
    remark: string;
    arrears: boolean;
}

export interface IKucoinWithdraw {
    id: string;
    currency: string;
    chain: string;
    status: string;
    address: string;
    memo: string;
    isInner: boolean;
    amount: number;
    fee: number;
    walletTxId: string;
    createdAt: number;
    updatedAt: number;
    remark: string;
}

export interface IKucoinOrderHistory {
    symbol: string; //symbol
    tradeId: string; //trade id
    orderId: string; //order id
    counterOrderId: string; //counter order id
    side: string; //transaction direction,include buy and sell
    liquidity: string; //include taker and maker
    forceTaker: boolean; //forced to become taker
    price: number; //order price
    size: number; //order quantity
    funds: number; //order funds
    fee: number; //fee
    feeRate: number; //fee rate
    feeCurrency: string; // charge fee currency
    stop: string; // stop type
    type: string; // order type,e.g. limit,market,stop_limit.
    createdAt: number; //time
    tradeType: string;
}

export async function getKuCoinTxnData({
    address, // wallet address
    apiKey,
    secretKey,
    passphrase,
}: {
    address: string;
    apiKey: string;
    secretKey: string;
    passphrase: string;
}) {
    const config = {
        baseUrl: 'https://api.kucoin.com',
        apiAuth: {
            key: apiKey,
            secret: secretKey,
            passphrase: passphrase,
        },
        authVersion: 2,
    };

    try {
        API.init(config);
        let originalTime = 1505433600000; // 2017-09-15
        const fetchedTimeInfo = await TaxBucketNumberModel.findOne({
            address: address.toLowerCase(),
            wallet_address: (apiKey + secretKey).toLowerCase(),
            chain_id: 'KuCoin',
        });
        if (fetchedTimeInfo) {
            originalTime = fetchedTimeInfo.bucket_number;
        }
        const currentTime = new Date().getTime();
        const interval = 86400 * 30 * 1000;
        const monthCount = Math.ceil((currentTime - originalTime) / interval);

        let depositArray: IKucoinDeposit[] = [];
        let withdrawArray: IKucoinWithdraw[] = [];
        let historyArray: IKucoinOrderHistory[] = [];

        for (let i = 0; i < monthCount; i++) {
            const startTime = originalTime + interval * i;
            const endTime = originalTime + interval * (i + 1);

            let depositList = await API.rest.User.Deposit.getDepositList({
                startAt: startTime,
                endAt: endTime,
            });
            if (depositList.code === '200000') {
                const depositItems = depositList.data.items;
                if (depositItems.length > 0) {
                    depositArray.push(...depositItems);
                    if (depositItems.length === 50) {
                        let sendTime = depositItems[depositItems.length - 1].updatedAt;
                        for (;;) {
                            if (sendTime !== undefined) {
                                if (parseInt(sendTime) <= startTime) {
                                    break;
                                }
                                const sdepositList = await API.rest.User.Deposit.getDepositList({
                                    startAt: startTime,
                                    endAt: sendTime,
                                });

                                if (sdepositList.status === '200000') {
                                    const sdepositItems = sdepositList.data.items;
                                    if (sdepositItems.length > 0) {
                                        depositArray.push(...sdepositItems);
                                        sendTime = sdepositItems[sdepositItems.length - 1].updatedAt;
                                    }
                                    if (sdepositItems.length < 50) {
                                        break;
                                    }
                                }

                                await sleep(500);
                            }
                        }
                    }
                }
            }

            if (depositArray.length > 0) {
                await handleKuCoinDeposit((apiKey + secretKey).toLowerCase(), depositArray);
                depositArray = [];
            }

            await sleep(500);

            let withdrawList = await API.rest.User.Withdrawals.getWithdrawalsList({
                startAt: startTime,
                endAt: endTime,
            });
            if (withdrawList.code === '200000') {
                const withdrawItems = withdrawList.data.items;
                if (withdrawItems.length > 0) {
                    withdrawArray.push(...withdrawItems);
                    if (withdrawItems.length === 50) {
                        let sendTime = withdrawItems[withdrawItems.length - 1].updatedAt;
                        for (;;) {
                            if (sendTime !== undefined) {
                                if (parseInt(sendTime) <= startTime) {
                                    break;
                                }
                                const swithdrawList = await API.rest.User.Withdrawals.getWithdrawalsList({
                                    startAt: startTime,
                                    endAt: sendTime,
                                });
                                if (swithdrawList.code === '200000') {
                                    const swithdrawItems = swithdrawList.data.items;
                                    if (swithdrawItems.length > 0) {
                                        withdrawArray.push(...swithdrawItems);
                                        sendTime = swithdrawItems[swithdrawItems.length - 1].updatedAt;
                                    }
                                    if (swithdrawItems.length < 50) {
                                        break;
                                    }
                                }

                                await sleep(500);
                            }
                        }
                    }
                }
            }

            if (withdrawArray.length > 0) {
                await handleKuCoinWithdraw((apiKey + secretKey).toLowerCase(), withdrawArray);
                withdrawArray = [];
            }

            await TaxBucketNumberModel.updateOne(
                {
                    address: address.toLowerCase(),
                    wallet_address: (apiKey + secretKey).toLowerCase(),
                    chain_id: 'KuCoin',
                },
                { bucket_number: endTime < currentTime ? endTime : currentTime },
                { upsert: true },
            );

            await sleep(500);
        }

        const trades = await API.rest.Trade.Fills.getFillsList();

        if (trades.code === '200000') {
            const tradeList = trades.data.items;
            if (tradeList.length > 0) {
                await handleKuCoinTrade((apiKey + secretKey).toLowerCase(), tradeList);
            }
        }

        await sleep(500);

        return trades;
    } catch (error) {
        console.log(error);
    }
}
