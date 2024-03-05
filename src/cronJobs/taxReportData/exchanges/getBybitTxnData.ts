import { RestClientV5, WithdrawalRecordV5, DepositRecordV5, SpotClientV3 } from 'bybit-api';
import { ITaxBybitHistoryModel } from 'src/interfaces/taxreportModels';
import { handleBybitDeposit, handleBybitHistory, handleBybitWithdraw } from '../utils/exchangeUtils';
import { sleep } from 'src/utils/util';
import TaxBucketNumberModel from 'src/database/models/taxreport/taxbucketnumber.model';

export async function getBybitTxnData({
    address, // wallet address
    apiKey,
    secretKey,
}: {
    address: string;
    apiKey: string;
    secretKey: string;
}) {
    const bybitClient = new RestClientV5({
        key: apiKey,
        secret: secretKey,
        testnet: false,
    });

    const bybitV3 = new SpotClientV3({ key: apiKey, secret: secretKey });

    let originalTime = 1519862400000; // 2018-03-01 00:00:00
    const fetchedTimeInfo = await TaxBucketNumberModel.findOne({
        address: address.toLowerCase(),
        wallet_address: (apiKey + secretKey).toLowerCase(),
        chain_id: 'Bybit',
    });
    if (fetchedTimeInfo) {
        originalTime = fetchedTimeInfo.bucket_number;
    }
    const currentTime = new Date().getTime();

    const interval = 86400 * 30 * 1000;
    const monthCount = Math.ceil((currentTime - originalTime) / interval);

    let depositArray: DepositRecordV5[] = [];
    let withdrawArray: WithdrawalRecordV5[] = [];
    let historyArray: ITaxBybitHistoryModel[] = [];

    for (let i = 0; i < monthCount; i++) {
        const startTime = originalTime + interval * i;
        const endTime = originalTime + interval * (i + 1);

        const history = await bybitV3.getMyTrades({
            startTime: startTime,
            endTime: endTime,
        });

        if (history.result.list.length > 0) {
            historyArray.push(...history.result.list);
        }

        const deposit = await bybitClient.getDepositRecords({
            startTime: startTime,
            endTime: endTime,
        });

        if (deposit.result.rows.length > 0) {
            depositArray.push(...deposit.result.rows);
        }

        const withdraw = await bybitClient.getWithdrawalRecords({
            startTime: startTime,
            endTime: endTime,
        });

        if (withdraw.result.rows.length > 0) {
            withdrawArray.push(...withdraw.result.rows);
        }

        if (i % 2 === 0 || i === monthCount - 1) {
            if (depositArray.length > 0) {
                await handleBybitDeposit((apiKey + secretKey).toLowerCase(), depositArray);
                depositArray = [];
            }
            if (withdrawArray.length > 0) {
                await handleBybitWithdraw((apiKey + secretKey).toLowerCase(), withdrawArray);
                withdrawArray = [];
            }

            if (historyArray.length > 0) {
                await handleBybitHistory((apiKey + secretKey).toLowerCase(), historyArray);
                historyArray = [];
            }

            await TaxBucketNumberModel.updateOne(
                {
                    address: address.toLowerCase(),
                    wallet_address: (apiKey + secretKey).toLowerCase(),
                    chain_id: 'Bybit',
                },
                { bucket_number: endTime < currentTime ? endTime : currentTime },
                { upsert: true },
            );

            await sleep(1000);
        }
    }

    return { status: true };
}
