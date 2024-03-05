import { Request, Response } from 'express';
import ClassificationModel from 'src/database/models/hectorpay/classification.model';
import { IClassificationModel } from 'src/interfaces/hectorpayModels';
import { CreateClassificationRequestType, IApiHandler, JsonResponseType } from 'src/domains/hectorpay/types/api';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import mongoose from 'mongoose';

export const createClassification: IApiHandler<
    Request<{}, {}, CreateClassificationRequestType>,
    Response<JsonResponseType<IClassificationModel>>
> = async (req, res) => {
    const { classification, userIds } = req.body;

    try {
        const newClassification = await ClassificationModel.create({
            ...classification,
            createdById: req.user!._id,
        });

        if (userIds.length) {
            await RecipientModel.updateMany(
                {
                    _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
                },
                {
                    $push: { classificationIds: newClassification._id.toString() },
                },
            );
        }

        return res.json({
            success: true,
            data: newClassification.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
