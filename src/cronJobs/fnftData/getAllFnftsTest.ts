import { FANTOM_TESTNET } from 'src/utils/chain';
import Decimal from 'decimal.js';
import FnftModel from 'src/database/models/fnft.model';
import { sleep } from 'src/utils/util';
import { IFnftModel } from 'src/interfaces/dbModels';
import { ftmscanApiKey, LOCK_FARM_LIST_TESTNET, StakeFuncHex, VOTING_TESTNET, WithdrawFuncHex } from 'src/constants';
import { convertToHEC } from 'src/constants/voting';
import { EventHistory } from 'src/interfaces/apiDataModels';
import fetch from 'node-fetch';

export default async function () {
    if (LOCK_FARM_LIST_TESTNET.length > 0) {
        for (let iCnt = 0; iCnt < LOCK_FARM_LIST_TESTNET.length; iCnt++) {
            const currentFarm = LOCK_FARM_LIST_TESTNET[iCnt];
            try {
                const lastFnft = await FnftModel.find(
                    { fnftAddress: currentFarm.fnft, farmAddress: currentFarm.address },
                    { _id: 0, __v: 0 },
                ).sort({ secs: -1 });

                let startBlockNumber = currentFarm.startBlockNumber;
                if (lastFnft.length > 0) {
                    startBlockNumber =
                        lastFnft[0].blockNumber === ''
                            ? currentFarm.startBlockNumber
                            : (parseInt(lastFnft[0].blockNumber) + 1).toString();
                }

                while (true) {
                    const eventHistories = await fetch(
                        `https://api-testnet.ftmscan.com/api?module=logs&action=getLogs&address=${currentFarm.address}&fromblock=${startBlockNumber}&toblock=99999999&sort=asc&apikey=${ftmscanApiKey}`,
                    ).then((res: any) => res.json());

                    if (eventHistories.message === 'OK') {
                        const stakingHistories = eventHistories.result.filter((history: EventHistory) => {
                            return history.topics[0] === StakeFuncHex;
                        });

                        startBlockNumber = (
                            parseInt(eventHistories.result[eventHistories.result.length - 1].blockNumber, 16) + 1
                        ).toString();

                        const fnftLists: IFnftModel[] = [];
                        for (
                            let i = 0;
                            i <
                            (currentFarm.stake.symbol !== 'HEC'
                                ? 30 > stakingHistories.length
                                    ? stakingHistories.length
                                    : 30
                                : stakingHistories.length);
                            i++
                        ) {
                            const history = stakingHistories[i];
                            const fnftId = parseInt(history.topics[2], 16);
                            let amount = parseInt(history.data.slice(0, 66), 16);
                            const startTime = parseInt('0x' + history.data.slice(66), 16);
                            const secs = parseInt(history.timeStamp, 16);
                            const blockNumber = parseInt(history.blockNumber, 16).toString();
                            if (currentFarm.stake.symbol !== 'HEC') {
                                const convertedValue = await convertToHEC(
                                    FANTOM_TESTNET,
                                    VOTING_TESTNET,
                                    currentFarm.stake,
                                    new Decimal(amount).div(currentFarm.stake.wei),
                                );
                                await sleep(250);
                                if (convertedValue.isOk) {
                                    amount = convertedValue.value.toNumber();
                                } else {
                                    amount = 0;
                                }
                            }

                            const fnftData = {
                                id: fnftId,
                                amount: Number(amount / currentFarm.reward.wei.toNumber()),
                                secs: secs,
                                startTime: startTime,
                                multiplier: 0,
                                rewardDebt: 0,
                                pendingReward: 0,
                                fnftAddress: currentFarm.fnft,
                                farmAddress: currentFarm.address,
                                blockNumber: blockNumber,
                            };
                            fnftLists.push(fnftData);
                        }

                        const dataToInsert = fnftLists.filter((item: IFnftModel) => item.amount > 0);

                        if (dataToInsert.length > 0) {
                            const updateIds = dataToInsert.map((item) => {
                                return item.id;
                            });
                            await FnftModel.deleteMany({
                                $and: [{ id: { $in: updateIds } }, { farmAddress: currentFarm.address }],
                            });
                            await FnftModel.insertMany(dataToInsert);
                        }

                        await sleep(1000);

                        const withdrawHistories = eventHistories.result.filter(
                            (history: EventHistory) => history.topics[0] === WithdrawFuncHex,
                        );

                        const removeIds = withdrawHistories.map((history: EventHistory) => {
                            return parseInt(history.topics[2], 16);
                        });

                        await FnftModel.deleteMany({
                            $and: [{ id: { $in: removeIds } }, { farmAddress: currentFarm.address }],
                        });
                        await sleep(1000);
                    } else {
                        break;
                    }
                }
            } catch (error) {
                console.log('error =>', error);
            }

            await sleep(10000);
        }
    }
}
