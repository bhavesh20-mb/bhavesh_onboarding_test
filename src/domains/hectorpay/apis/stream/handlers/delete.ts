import { Request, Response } from 'express';
import StreamModel from 'src/database/models/hectorpay/stream.model';
import { DeleteStreamResponseType, IApiHandler, JsonResponseType } from 'src/domains/hectorpay/types/api';

export const deleteStream: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteStreamResponseType>>
> = async (req, res) => {
    try {
        const stream = await StreamModel.findOneAndDelete({ _id: req.params.id, createdById: req.user!._id });

        return res.json({
            success: true,
            data: stream?.toObject() ?? null,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
