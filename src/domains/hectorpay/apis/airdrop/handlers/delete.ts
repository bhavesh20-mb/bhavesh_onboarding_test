import { Request, Response } from 'express';
import AirdropModel from 'src/database/models/hectorpay/airdrop.model';
import { DeleteAirdropResponseType, IApiHandler, JsonResponseType } from 'src/domains/hectorpay/types/api';

export const deleteAirdrop: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteAirdropResponseType>>
> = async (req, res) => {
    try {
        const airdrop = await AirdropModel.findOneAndDelete({ _id: req.params.id, createdById: req.user!._id });

        return res.json({
            success: true,
            data: airdrop?.toObject() ?? null,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
