import { Request, Response } from 'express';
import FnftModel from 'src/database/models/fnft.model';

export default async function (req: Request, res: Response) {
    try {
        const params = req.query;
        if (params && params.fnft && params.farm) {
            const docs = await FnftModel.find(
                { fnftAddress: params.fnft, farmAddress: params.farm },
                { _id: 0, __v: 0, fnftAddress: 0, farmAddress: 0, blockNumber: 0 },
            ).sort({ secs: 1 });

            return res.json({
                data: docs,
            });
        } else {
            return res.json({
                data: [],
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
