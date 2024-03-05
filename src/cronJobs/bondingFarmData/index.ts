import getAllDeposits from './getAllDeposits';
import getAllDepositsTest from './getAllDepositsTest';
import getBondingFarmInfos from './getBondingFarmInfos';
import getBondingFarmTestInfos from './getBondingFarmTestInfos';

export default async function () {
    try {
        await getAllDeposits();
        await getAllDepositsTest();
        await getBondingFarmInfos();
        await getBondingFarmTestInfos();
    } catch {}
}
