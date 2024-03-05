import getEPFarmInfos from './getEPFarmInfos';
import getEPFarmTestInfos from './getEPFarmTestInfos';

export default async function () {
    try {
        await getEPFarmInfos();
        await getEPFarmTestInfos();
    } catch {}
}
