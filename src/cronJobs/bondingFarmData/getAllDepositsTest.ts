import Decimal from 'decimal.js';
import { BONDING_FARM_FUNC, ftmscanApiKey } from 'src/constants';
import { BondingFarmType, BONDING_FARMS_TESTNET } from 'src/constants/bondingFarm';
import BondingDepositModel from 'src/database/models/bondingdeposit.model';
import ContractModel from 'src/database/models/contract.model';
import { EventHistory } from 'src/interfaces/apiDataModels';
import { IBondingDepositModel } from 'src/interfaces/dbModels';
import { FANTOM_TESTNET } from 'src/utils/chain';
import { sleep } from 'src/utils/util';
import fetch from 'node-fetch';

export default async function () {
    try {
        const docs = await ContractModel.find({ type: 'Bonding', status: 'active' }, { _id: 0, __v: 0 });
        const bondingFarms = docs.filter((item) => item.contract.chainId === FANTOM_TESTNET.id);

        if (bondingFarms.length > 0) {
            for (let i = 0; i < bondingFarms.length; i++) {
                const bondingFarm = BONDING_FARMS_TESTNET.filter(
                    (item: BondingFarmType) =>
                        item.address.toLowerCase() === bondingFarms[i].contract.address.toLowerCase(),
                );

                let startBlockNumber = bondingFarm[0].startBlockNumber;

                const lastDepositData = (
                    await BondingDepositModel.find({}, { _id: 0, __v: 0 }).sort({ timeStamp: -1 })
                ).filter((item) => item.farmAddress.toLowerCase() === bondingFarms[i].contract.address.toLowerCase());

                if (lastDepositData.length > 0 && lastDepositData[0].blockNumber !== '') {
                    startBlockNumber = (parseInt(lastDepositData[0].blockNumber) + 1).toString();
                }

                try {
                    while (true) {
                        const eventHistories = await fetch(
                            `https://api-testnet.ftmscan.com/api?module=logs&action=getLogs&address=${bondingFarms[i].contract.address}&fromblock=${startBlockNumber}&toblock=99999999&sort=asc&apikey=${ftmscanApiKey}`,
                        ).then((res: any) => res.json());

                        if (eventHistories.message === 'OK') {
                            startBlockNumber = (
                                parseInt(eventHistories.result[eventHistories.result.length - 1].blockNumber, 16) + 1
                            ).toString();

                            const depositHistories = eventHistories.result.filter(
                                (history: EventHistory) =>
                                    history.topics[0].toLowerCase() === BONDING_FARM_FUNC.BondCreated.toLowerCase() ||
                                    history.topics[0].toLowerCase() === BONDING_FARM_FUNC.BondCreatedV3.toLowerCase(),
                            );

                            const depositLists: IBondingDepositModel[] = [];
                            for (let i = 0; i < depositHistories.length; i++) {
                                const history = depositHistories[i];

                                const payout = new Decimal(history.topics[1]);
                                const expires = parseInt(history.topics[2], 16);
                                const priceInUSD = new Decimal(history.topics[3]);
                                const depositId = parseInt(history.data.slice(0, 66), 16);
                                const principal = '0x' + history.data.slice(90, 130);
                                const deposit = new Decimal('0x' + history.data.slice(130, 194));
                                let stakeStatus = false;
                                if (history.data.length > 194) {
                                    const stake = new Decimal('0x' + history.data.slice(194, 258));
                                    if (stake.toNumber() === 1) {
                                        stakeStatus = true;
                                    }
                                }
                                const timeStamp = parseInt(history.timeStamp, 16);
                                const farmAddress = history.address;
                                const blockNumber = parseInt(history.blockNumber, 16).toString();
                                const principalToken = bondingFarm[0].deposit.filter(
                                    (item) => item.address.toLowerCase() === principal.toLowerCase(),
                                );
                                const rewardToken = bondingFarm[0].reward;

                                const depositData = {
                                    depositId: depositId,
                                    principal: principal,
                                    deposit: deposit.div(principalToken[0].wei).toNumber(),
                                    payout: payout.div(rewardToken.wei).toNumber(),
                                    expires: expires,
                                    priceInUSD: priceInUSD.div(10 ** 8).toNumber(),
                                    stake: stakeStatus,
                                    timeStamp: timeStamp,
                                    farmAddress: farmAddress,
                                    blockNumber: blockNumber,
                                };

                                depositLists.push(depositData);
                            }

                            const dataToInsert = depositLists.filter((item: IBondingDepositModel) => item.payout > 0);

                            if (dataToInsert.length > 0) {
                                const updateIds = dataToInsert.map((item) => {
                                    return item.depositId;
                                });

                                await BondingDepositModel.deleteMany({
                                    $and: [
                                        { depositId: { $in: updateIds } },
                                        { farmAddress: bondingFarms[i].contract.address.toLowerCase() },
                                    ],
                                });

                                await BondingDepositModel.insertMany(dataToInsert);
                            }

                            await sleep(1000);

                            const redeemHistories = eventHistories.result.filter(
                                (history: EventHistory) => history.topics[0] === BONDING_FARM_FUNC.BondRedeemed,
                            );

                            const removeIds = redeemHistories.map((history: EventHistory) => {
                                return parseInt(history.data.slice(0, 66), 16);
                            });

                            await BondingDepositModel.deleteMany({
                                $and: [
                                    { depositId: { $in: removeIds } },
                                    { farmAddress: bondingFarms[i].contract.address.toLowerCase() },
                                ],
                            });

                            await sleep(1000);
                        } else {
                            break;
                        }
                    }
                } catch (error) {
                    console.log('testnet bonding farm fetch error =>', error);
                }

                await sleep(10000);
            }
        }
    } catch (error) {}
}
