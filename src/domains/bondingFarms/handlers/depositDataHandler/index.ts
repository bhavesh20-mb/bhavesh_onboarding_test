import { Request, Response } from 'express';
import BondingDepositModel from 'src/database/models/bondingdeposit.model';

export default async function (req: Request, res: Response) {
    try {
        const params = req.query;
        if (params && params.farm) {
            const docs = (
                await BondingDepositModel.find({}, { _id: 0, __v: 0, blockNumber: 0 }).sort({ secs: 1 })
            ).filter((item) => item.farmAddress.toLowerCase() === params.farm?.toString().toLowerCase());

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
