import { Request, Response } from 'express';
import StatModel from 'src/database/models/stat.model';
import { IStatModel } from 'src/interfaces/dbModels';
import mcache from 'memory-cache';
import { CACHE_KEY_INVESTMENTS_GENERAL_STATS } from 'src/constants';

type SupplyType = 'totalSupply' | 'circulatingSupply';

export default async function (req: Request, res: Response) {
    const supplyType: SupplyType = req.params.type as SupplyType;

    if (!['totalSupply', 'circulatingSupply'].includes(supplyType)) {
        return res.status(400).json({
            message: 'bad request - endpoint should end with /totalSupply or /circulatingSupply',
        });
    }

    const cachedGeneralStats = mcache.get(CACHE_KEY_INVESTMENTS_GENERAL_STATS);

    let doc: IStatModel | null = cachedGeneralStats ? cachedGeneralStats.data : null;

    try {
        if (!doc) {
            doc = await StatModel.findOne({}, { _id: 0, __v: 0 });
        }

        return res.status(200).send(!doc ? '0' : doc[supplyType].toString());
    } catch (e) {
        return res.status(200).send('0');
    }
}
