import { handleGateioDeposit, handleGateioHistory, handleGateioWithdraw } from '../utils/exchangeUtils';
import { sleep } from 'src/utils/util';
import { Trade as GateioTrade, ApiClient, SpotApi, WalletApi, LedgerRecord } from 'gate-api';
import TaxBucketNumberModel from 'src/database/models/taxreport/taxbucketnumber.model';

export async function getGateioTxnData({
    address, // wallet address
    apiKey,
    secretKey,
}: {
    address: string;
    apiKey: string;
    secretKey: string;
}) {
    const client = new ApiClient();
    client.setApiKeySecret(apiKey, secretKey);
    const spotApi = new SpotApi(client);
    const walletApi = new WalletApi(client);
    let originalTime = 1356998400; // 2013-01-01 00:00:00
    const fetchedTimeInfo = await TaxBucketNumberModel.findOne({
        address: address.toLowerCase(),
        wallet_address: (apiKey + secretKey).toLowerCase(),
        chain_id: 'Gate.io',
    });
    if (fetchedTimeInfo) {
        originalTime = fetchedTimeInfo.bucket_number;
    }
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const interval = 86400 * 30;
    const monthCount = Math.ceil((currentTime - originalTime) / interval);
    let depositArray: LedgerRecord[] = [];
    let withdrawArray: LedgerRecord[] = [];
    let historyArray: GateioTrade[] = [];
    for (let i = 0; i < monthCount; i++) {
        const startTime = originalTime + interval * i;
        const endTime = originalTime + interval * (i + 1);

        /** Gateio Trade */
        const gateioTrade = await spotApi.listMyTrades({
            from: startTime,
            to: endTime,
            limit: 1000,
        });
        historyArray.push(...gateioTrade.body);
        if (gateioTrade.body.length === 1000) {
            let hendTime = gateioTrade.body[gateioTrade.body.length - 1].createTime;
            for (;;) {
                if (hendTime !== undefined) {
                    if (parseInt(hendTime) <= startTime) {
                        break;
                    }
                    const hgateioTrade = await spotApi.listMyTrades({
                        from: startTime,
                        to: parseInt(hendTime),
                        limit: 1000,
                    });
                    if (hgateioTrade.body.length > 0) {
                        historyArray.push(...hgateioTrade.body);
                        hendTime = hgateioTrade.body[hgateioTrade.body.length - 1].createTime;
                    }
                    if (hgateioTrade.body.length < 1000) {
                        break;
                    }
                }
            }
        }

        if (historyArray.length > 0) {
            await handleGateioHistory((apiKey + secretKey).toLowerCase(), historyArray);
            historyArray = [];
        }

        /** Gateio Deposit */
        const deposit = await walletApi.listDeposits({
            from: startTime,
            to: endTime,
            limit: 1000,
        });
        depositArray.push(...deposit.body);
        if (deposit.body.length === 1000) {
            let dendTime = deposit.body[deposit.body.length - 1].timestamp;
            for (;;) {
                if (dendTime !== undefined) {
                    if (parseInt(dendTime) <= startTime) {
                        break;
                    }
                    const dgateioDeposit = await walletApi.listDeposits({
                        from: startTime,
                        to: parseInt(dendTime),
                        limit: 1000,
                    });
                    if (dgateioDeposit.body.length > 0) {
                        depositArray.push(...dgateioDeposit.body);
                        dendTime = dgateioDeposit.body[dgateioDeposit.body.length - 1].timestamp;
                    }
                    if (dgateioDeposit.body.length < 1000) {
                        break;
                    }
                }
            }
        }

        if (depositArray.length > 0) {
            await handleGateioDeposit((apiKey + secretKey).toLowerCase(), depositArray);
            depositArray = [];
        }

        /** Gateio Withdraw */
        const withdraw = await walletApi.listWithdrawals({
            from: startTime,
            to: endTime,
            limit: 1000,
        });
        withdrawArray.push(...withdraw.body);
        if (withdraw.body.length === 1000) {
            let wendTime = withdraw.body[withdraw.body.length - 1].timestamp;
            for (;;) {
                if (wendTime !== undefined) {
                    if (parseInt(wendTime) <= startTime) {
                        break;
                    }
                    const dgateioWithdraw = await walletApi.listWithdrawals({
                        from: startTime,
                        to: parseInt(wendTime),
                        limit: 1000,
                    });
                    if (dgateioWithdraw.body.length > 0) {
                        withdrawArray.push(...dgateioWithdraw.body);
                        wendTime = dgateioWithdraw.body[dgateioWithdraw.body.length - 1].timestamp;
                    }
                    if (dgateioWithdraw.body.length < 1000) {
                        break;
                    }
                }
            }
        }

        if (withdrawArray.length > 0) {
            await handleGateioWithdraw((apiKey + secretKey).toLowerCase(), withdrawArray);
            withdrawArray = [];
        }

        await TaxBucketNumberModel.updateOne(
            {
                address: address.toLowerCase(),
                wallet_address: (apiKey + secretKey).toLowerCase(),
                chain_id: 'Gateio',
            },
            { bucket_number: endTime < currentTime ? endTime : currentTime },
            { upsert: true },
        );

        await sleep(1000);
    }
    historyArray.sort((a, b) => {
        return parseInt(a.createTimeMs!) - parseInt(b.createTimeMs!);
    });
    return;
}
