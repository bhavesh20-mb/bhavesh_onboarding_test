import BondingFarmInfoModel from 'src/database/models/bondingfarminfo.model';
import ContractModel from 'src/database/models/contract.model';
import { IBondingFarmInfoModel } from 'src/interfaces/dbModels';
import { FANTOM } from 'src/utils/chain';
import { getAutoStakingStatus, getBondingFarmName } from 'src/utils/contracts/bondV3';
import { sleep } from 'src/utils/util';

export default async function () {
    try {
        const docsInactive = await ContractModel.find({ type: 'Bonding', status: 'inactive' }, { _id: 0, __v: 0 });
        const bondingInactiveFarms = docsInactive.filter((item) => item.contract.chainId === FANTOM.id);

        if (bondingInactiveFarms.length > 0) {
            const updateIds = bondingInactiveFarms.map((item) => {
                return item.contract;
            });
            await BondingFarmInfoModel.deleteMany({
                $and: [{ contract: { $in: updateIds } }],
            });
        }

        const docs = await ContractModel.find({ type: 'Bonding', status: 'active' }, { _id: 0, __v: 0 });
        const bondingFarms = docs.filter((item) => item.contract.chainId === FANTOM.id);

        if (bondingFarms.length > 0) {
            const bondingfarmInfos: IBondingFarmInfoModel[] = [];
            for (let i = 0; i < bondingFarms.length; i++) {
                const currentBondingFarm = bondingFarms[i];

                const bondingFarmName = await getBondingFarmName(FANTOM, currentBondingFarm.contract.address);
                await sleep(100);

                const autoStaking = await getAutoStakingStatus(FANTOM, currentBondingFarm.contract.address);
                await sleep(100);

                bondingfarmInfos.push({
                    contract: currentBondingFarm.contract,
                    type: currentBondingFarm.type,
                    status: currentBondingFarm.status,
                    dateAdded: currentBondingFarm.dateAdded,
                    name: bondingFarmName.isOk ? bondingFarmName.value : '',
                    autoStaking: autoStaking.isOk ? autoStaking.value : false,
                });
            }

            if (bondingfarmInfos.length > 0) {
                const updateIds = bondingfarmInfos.map((item) => {
                    return item.contract;
                });
                await BondingFarmInfoModel.deleteMany({
                    $and: [{ contract: { $in: updateIds } }],
                });
                await BondingFarmInfoModel.insertMany(bondingfarmInfos);
            }
        }
    } catch (error) {}
}
