import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import AirdropModel from 'src/database/models/hectorpay/airdrop.model';
import {
    GetAirdropResponseType,
    GetAirdropsResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const getAirdrop: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<GetAirdropResponseType>>
> = async (req, res) => {
    try {
        const airdrop = await AirdropModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.id),
                    createdById: req.user!._id,
                },
            },
            { $limit: 1 },
        ]);

        if (!airdrop.length) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Airdrop not found',
                },
            });
        }

        return res.json({
            success: true,
            data: airdrop[0],
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getAirdrops: IApiHandler<
    Request<{}, {}, {}, Partial<{ chainId: string }>>,
    Response<JsonResponseType<GetAirdropsResponseType>>
> = async (req, res) => {
    try {
        const findQuery = AirdropModel.aggregate([
            {
                $match: {
                    ...{
                        createdById: req.user!._id,
                    },
                    ...(req.query.chainId ? { chainId: parseInt(req.query.chainId) } : {}),
                },
            },
        ]);

        const airdrops = await findQuery.exec();

        return res.json({
            success: true,
            data: airdrops,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
