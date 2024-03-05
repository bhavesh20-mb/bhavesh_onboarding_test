import { Request, Response } from 'express';
import StreamV2Model from 'src/database/models/multipay-v2/stream.model';
import {
    CreateStreamRequestType,
    CreateStreamResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/multipay-v2/types/api';

export const createStream: IApiHandler<
    Request<{}, {}, CreateStreamRequestType>,
    Response<JsonResponseType<CreateStreamResponseType>>
> = async (req, res) => {
    try {
        const newStream = await StreamV2Model.create({
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
