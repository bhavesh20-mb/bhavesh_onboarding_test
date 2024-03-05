import axios from 'axios';
import { ETH_GRAPH_URL, ETH_QUERY, THE_GRAPH_DATA_QUERY, THE_GRAPH_URL } from 'src/constants/investments';
import GraphStatModel from 'src/database/models/graphstat.model';
import { ProtocolMetrics, SubgraphData, SubgraphEthData } from 'src/interfaces/apiDataModels';
import { IGraphStatModel } from 'src/interfaces/dbModels';

export default async function () {
    const graphData: SubgraphData = (
        await axios.post(THE_GRAPH_URL, {
            query: THE_GRAPH_DATA_QUERY,
        })
    ).data.data;

    const ethData: SubgraphEthData[] = (
        await axios.post(ETH_GRAPH_URL, {
            query: ETH_QUERY,
        })
    ).data.data.ethMetrics;

    const months: string[] = [];

    const joinedGraphData = graphData.protocolMetrics.reverse().map((entry, i) => {
        const bankTotal = (+entry.bankBorrowed + +entry.bankSupplied).toString();
        const torTimeStamp = 1642857253;
        const month = new Date(parseInt(entry.timestamp) * 1000).toLocaleString('en-us', {
            month: 'short',
            year: '2-digit',
        });
        const isMonthIncluded = months.includes(month);
        if (!isMonthIncluded) {
            months.push(month);
        }
        let data: ProtocolMetrics = {
            ...entry,
            month: isMonthIncluded ? '' : month,
            bankTotal,
            torTVL: (+entry.timestamp > torTimeStamp ? graphData.tors[i]!?.torTVL : 0).toString(),
            treasuryBaseRewardPool: '0',
            staked: (
                (parseFloat(entry.sHecCirculatingSupply) / parseFloat(entry.hecCirculatingSupply)) *
                100
            ).toString(),
        };
        if (i < ethData?.length) {
            const riskFreeValue = +entry.treasuryRiskFreeValue + +ethData[i]!.treasuryBaseRewardPool;
            data = {
                ...data,
                treasuryBaseRewardPool: (+ethData[i]!.treasuryBaseRewardPool + +entry.treasuryInvestments).toString(),
                runwayCurrent: getRunway(+entry.sHecCirculatingSupply, +riskFreeValue, +entry.nextEpochRebase),
                treasuryMaticBalance: ethData[i]!.treasuryMaticBalance,
                treasuryIlluviumBalance: ethData[i]!.treasuryIlluviumBalance,
                treasuryRFMaticBalance: (+ethData[i]!.treasuryMaticBalance * 0.5).toString(),
                treasuryRFIlluviumBalance: (+ethData[i]!.treasuryIlluviumBalance * 0.5).toString(),
                illuviumTokenAmount: ethData[i]!.illuviumTokenAmount,
            };
        }
        return data as ProtocolMetrics;
    });

    await GraphStatModel.deleteMany({});

    const dataToInsert: IGraphStatModel[] = joinedGraphData.map((data) => {
        const {
            totalValueLocked,
            bankTotal,
            torTVL,
            hecCirculatingSupply,
            staked,
            runwayCurrent,
            treasuryHecDaiPOL,
            timestamp,
        } = data;

        return {
            totalValueLocked,
            bankTotal,
            torTVL,
            hecCirculatingSupply,
            staked,
            runwayCurrent,
            treasuryHecDaiPOL,
            timestamp,
            fullData: data,
        };
    });

    await GraphStatModel.insertMany(dataToInsert);
}

export const getRunway = (sHec: number, rfv: number, rebase: number) => {
    let runwayCurrent: string = '';

    if (sHec > 0 && rfv > 0 && rebase > 0) {
        let treasury_runway = parseFloat((rfv / sHec).toString());

        let nextEpochRebase_number = parseFloat(rebase.toString()) / 100;
        let runwayCurrent_num = Math.log(treasury_runway) / Math.log(1 + nextEpochRebase_number) / 3;

        runwayCurrent = runwayCurrent_num.toString();
    }

    return runwayCurrent;
};
