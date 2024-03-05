import { FANTOM_HEC, INVESTMENT_CONTRACT } from 'src/constants';
import { FANTOM } from 'src/utils/chain';
import { getMarketPrice } from 'src/utils/contracts/uniswapV2';
import GraphStatModel from 'src/database/models/graphstat.model';
import { IGraphStatModel, IStatModel } from 'src/interfaces/dbModels';
import Decimal from 'decimal.js';
import { getHecBurned } from 'src/utils/contracts/hecBurnContract';
import { getTotalSupply } from 'src/utils/contracts/erc20';
import { getStakingIndex } from 'src/utils/contracts/stakingContract';
import StatModel from 'src/database/models/stat.model';
import { getHECCirculatingSupply } from 'src/utils/contracts/investment';

export default async function () {
    const marketPrice = await getMarketPrice(FANTOM);

    const graphData = await GraphStatModel.aggregate<IGraphStatModel>([{ $sort: { timestamp: -1 } }]).limit(1);

    if (marketPrice.isOk && graphData.length) {
        const circSupply = await getHECCirculatingSupply(FANTOM, INVESTMENT_CONTRACT);
        const hecPrice = marketPrice.value.div(FANTOM_HEC.wei).toNumber();
        const marketCap = marketPrice.value.times(circSupply?.isOk ? circSupply.value : 0).div(FANTOM_HEC.wei);
        const hecBurnedRes = await getHecBurned(FANTOM);
        let hecBurned: number = 0;

        if (hecBurnedRes.isOk) {
            hecBurned = hecBurnedRes.value.toNumber();
        }

        const totalSupplyRes = await getTotalSupply(FANTOM, FANTOM_HEC);
        let totalSupply: number = 0;

        if (totalSupplyRes.isOk) {
            totalSupply = totalSupplyRes.value.toNumber();
        }

        const currentIndexRes = await getStakingIndex(FANTOM);
        let currentIndex: number = 0;

        if (currentIndexRes.isOk) {
            currentIndex = new Decimal(currentIndexRes.value).div(FANTOM_HEC.wei).toNumber();
        }

        const oldStat = await StatModel.findOne({});

        const newStat: IStatModel = {
            marketCap: marketCap.toNumber(),
            hecPrice,
            hecBurned,
            circulatingSupply: circSupply?.isOk ? circSupply.value.toNumber() : 0,
            totalSupply,
            treasury: oldStat ? oldStat.treasury : 0,
            currentIndex,
        };

        await StatModel.deleteMany({});
        StatModel.create(newStat);
    }
}
