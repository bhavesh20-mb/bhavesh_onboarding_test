import { Request, Response } from 'express';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import { DeleteRecipientResponseType, IApiHandler, JsonResponseType } from 'src/domains/hectorpay/types/api';

export const deleteRecipient: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteRecipientResponseType>>
> = async (req, res) => {
    try {
        const recipient = await RecipientModel.findOneAndDelete({ _id: req.params.id, createdById: req.user!._id });

        return res.json({
            success: true,
            data: recipient?.toObject() ?? null,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
