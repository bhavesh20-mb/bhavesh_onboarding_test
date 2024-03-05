import { Request, Response } from 'express';
import AirdropModel from 'src/database/models/hectorpay/airdrop.model';
import {
    CreateAirdropRequestType,
    CreateAirdropResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const createAirdrop: IApiHandler<
    Request<{}, {}, CreateAirdropRequestType>,
    Response<JsonResponseType<CreateAirdropResponseType>>
> = async (req, res) => {
    try {
        const newAirdrop = await AirdropModel.create({
            ...req.body,
            createdById: req.user!._id,
        });

        return res.json({
            success: true,
            data: newAirdrop.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
