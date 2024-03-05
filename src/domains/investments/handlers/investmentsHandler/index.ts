import { Request, Response } from 'express';
import InvestmentModel from 'src/database/models/investment.model';

export default async function (req: Request, res: Response) {
    try {
        const docs = await InvestmentModel.find({});

        return res.json({
            data: docs,
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
