import { Request, Response } from 'express';
import StreamModel from 'src/database/models/hectorpay/stream.model';
import {
    CreateStreamRequestType,
    CreateStreamResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const createStream: IApiHandler<
    Request<{}, {}, CreateStreamRequestType>,
    Response<JsonResponseType<CreateStreamResponseType>>
> = async (req, res) => {
    try {
        const newStream = await StreamModel.create({
            ...req.body,
            createdById: req.user!._id,
        });

        return res.json({
            success: true,
            data: newStream.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
