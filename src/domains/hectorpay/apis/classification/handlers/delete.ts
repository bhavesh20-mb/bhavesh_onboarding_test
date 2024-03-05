import { Request, Response } from 'express';
import ClassificationModel from 'src/database/models/hectorpay/classification.model';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import { DeleteClassificationResponseType, IApiHandler, JsonResponseType } from 'src/domains/hectorpay/types/api';

export const deleteClassification: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteClassificationResponseType>>
> = async (req, res) => {
    try {
        const classification = await ClassificationModel.findOneAndDelete({
            _id: req.params.id,
            createdById: req.user!._id,
        });

        await RecipientModel.updateMany(
            {
                classificationIds: { $in: [req.params.id] },
            },
            {
                $pull: { classificationIds: req.params.id },
            },
        );

        return res.json({
            success: true,
            data: classification?.toObject() ?? null,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
