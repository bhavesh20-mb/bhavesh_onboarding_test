import { Request, Response } from 'express';
import BondingFarmInfoModel from 'src/database/models/bondingfarminfo.model';

export default async function (req: Request, res: Response) {
    try {
        const docs = await BondingFarmInfoModel.find({}, { _id: 0, __v: 0 });

        return res.json({
            data: docs,
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
