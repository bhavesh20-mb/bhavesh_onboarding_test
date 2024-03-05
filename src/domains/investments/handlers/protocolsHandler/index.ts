import { Request, Response } from 'express';
import ProtocolModel from 'src/database/models/protocol.model';

export default async function (req: Request, res: Response) {
    try {
        const docs = await ProtocolModel.find({});

        return res.json({
            data: docs,
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
