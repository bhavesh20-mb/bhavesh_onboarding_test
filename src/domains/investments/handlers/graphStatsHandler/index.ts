import { Request, Response } from 'express';
import GraphStatModel from 'src/database/models/graphstat.model';

export default async function (req: Request, res: Response) {
    try {
        const docs = await GraphStatModel.find({}, { fullData: 1 });

        return res.json({
            data: docs.map((doc) => doc.fullData),
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
