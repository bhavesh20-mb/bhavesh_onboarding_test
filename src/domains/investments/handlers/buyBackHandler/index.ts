import { Request, Response } from 'express';
import BuybackModel from 'src/database/models/buyback.model';

export default async function (req: Request, res: Response) {
    try {
        const docs = await BuybackModel.find().sort({ timeStamp: -1 });

        return res.json({
            data: docs,
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
