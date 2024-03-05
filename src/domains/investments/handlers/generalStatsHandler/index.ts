import { Request, Response } from 'express';
import StatModel from 'src/database/models/stat.model';

export default async function (req: Request, res: Response) {
    try {
        const doc = await StatModel.findOne({}, { _id: 0, __v: 0 });

        return res.json({
            data: doc,
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
