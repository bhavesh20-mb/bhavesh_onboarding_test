import { Request, Response } from 'express';
import StreamV2Model from 'src/database/models/multipay-v2/stream.model';
import {
    IApiHandler,
    JsonResponseType,
    UpdateStreamRequestType,
    UpdateStreamResponseType,
} from 'src/domains/multipay-v2/types/api';

export const updateStream: IApiHandler<
    Request<{ id: string }, {}, UpdateStreamRequestType>,
    Response<JsonResponseType<UpdateStreamResponseType>>
> = async (req, res) => {
    try {
        const stream = await StreamV2Model.findOneAndUpdate(
            { _id: req.params.id, createdById: req.user!._id },
            req.body,
        );

        if (!stream) {
            return res.status(404).json({ success: false, error: { message: 'Stream not found' } });
        }

        const updatedStream = await StreamV2Model.findById(req.params.id);

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
