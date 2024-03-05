import { Request, Response } from 'express';
import VoteFnftModel from 'src/database/models/votefnft.model';

export default async function (req: Request, res: Response) {
    try {
        const params = req.query;

        if (params && params.wallet && params.voting) {
            const docs = await VoteFnftModel.find({
                voter: params.wallet.toString().toLowerCase(),
                contract: params.voting.toString().toLowerCase(),
            }).sort({ id: 1 });

            return res.json(docs.map(({ id, endTime, fnftAddress }) => ({ id, endTime, fnftAddress })));
        } else {
            return res.json([]);
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
