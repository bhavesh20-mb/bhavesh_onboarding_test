import { Request, Response } from 'express';
import ContractModel from 'src/database/models/contract.model';

export default async function (req: Request, res: Response) {
    try {
        const params = req.query;
        if (params && params.type) {
            const docs = await ContractModel.find({ type: params.type }, { _id: 0, __v: 0 });

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
