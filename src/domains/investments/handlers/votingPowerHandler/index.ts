import { Interface } from 'ethers/lib/utils';
import { Request, Response } from 'express';
import FnftModel from 'src/database/models/fnft.model';

const blockedFnftStarterId = 10065;

export default async function (req: Request, res: Response) {
    try {
        const params = req.query;
        if (params && params.fnft) {
            const docs = await FnftModel.find(
                { fnftAddress: params.fnft },
                {
                    _id: 0,
                    __v: 0,
                    fnftAddress: 0,
                    farmAddress: 0,
                    secs: 0,
                    startTime: 0,
                    multiplier: 0,
                    rewardDebt: 0,
                    pendingReward: 0,
                },
            ).sort({ id: 1 });

            if (docs?.length > 0) {
                const result: Array<{ [id: string]: number | string }> = [];
                const lastId = docs.slice(-1).pop();
                const validIds: { [id: string]: number | string } = {};
                docs.map((doc) => {
                    const amount = Math.round(doc?.amount * 100) / 100;
                    validIds[doc?.id] = amount ? amount : '0';
                });
                for (let i: number = 0; i < parseInt(lastId?.id); i++) {
                    if (i < blockedFnftStarterId) {
                        const validId = validIds[i];
                        result.push({ [i]: validId ? validId : '0' });
                    } else {
                        result.push({ [i]: '0' });
                    }
                }
                return res.json(result);
            } else {
                return res.json([]);
            }
        } else {
            return res.json([]);
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
