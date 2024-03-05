import { Request, Response } from 'express';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import {
    IApiHandler,
    JsonResponseType,
    UpdateRecipientRequestType,
    UpdateRecipientResponseType,
} from 'src/domains/hectorpay/types/api';

export const updateRecipient: IApiHandler<
    Request<{ id: string }, {}, UpdateRecipientRequestType>,
    Response<JsonResponseType<UpdateRecipientResponseType>>
> = async (req, res) => {
    try {
        const recipient = await RecipientModel.findOneAndUpdate(
            { _id: req.params.id, createdById: req.user!._id },
            req.body,
        );

        if (!recipient) {
            return res.status(404).json({ success: false, error: { message: 'Recipient not found' } });
        }

        const updatedRecipient = await RecipientModel.findById(req.params.id);

        return res.json({
            success: true,
            data: updatedRecipient!.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
