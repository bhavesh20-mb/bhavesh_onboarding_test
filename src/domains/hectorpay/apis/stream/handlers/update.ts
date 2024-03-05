import { Request, Response } from 'express';
import StreamModel from 'src/database/models/hectorpay/stream.model';
import {
    IApiHandler,
    JsonResponseType,
    UpdateStreamRequestType,
    UpdateStreamResponseType,
} from 'src/domains/hectorpay/types/api';

export const updateStream: IApiHandler<
    Request<{ id: string }, {}, UpdateStreamRequestType>,
    Response<JsonResponseType<UpdateStreamResponseType>>
> = async (req, res) => {
    try {
        const stream = await StreamModel.findOneAndUpdate({ _id: req.params.id, createdById: req.user!._id }, req.body);

        if (!stream) {
            return res.status(404).json({ success: false, error: { message: 'Stream not found' } });
        }

        const updatedStream = await StreamModel.findById(req.params.id);

        return res.json({
            success: true,
            data: updatedStream!.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
