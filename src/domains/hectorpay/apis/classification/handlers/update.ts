import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ClassificationModel from 'src/database/models/hectorpay/classification.model';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import {
    IApiHandler,
    JsonResponseType,
    UpdateClassificationRequestType,
    UpdateClassificationResponseType,
} from 'src/domains/hectorpay/types/api';

export const updateClassification: IApiHandler<
    Request<{ id: string }, {}, UpdateClassificationRequestType>,
    Response<JsonResponseType<UpdateClassificationResponseType>>
> = async (req, res) => {
    const { dataToUpdate, userIdsToAdd, userIdsToRemove } = req.body;

    try {
        const classification = await ClassificationModel.findOneAndUpdate(
            { _id: req.params.id, createdById: req.user!._id },
            dataToUpdate,
        );

        if (!classification) {
            return res.status(404).json({ success: false, error: { message: 'Classification not found' } });
        }

        const updatedClassification = await ClassificationModel.findById(req.params.id);

        await RecipientModel.updateMany(
            {
                _id: { $in: userIdsToAdd.map((id) => new mongoose.Types.ObjectId(id)) },
            },
            {
                $addToSet: { classificationIds: classification._id.toString() },
            },
        );

        await RecipientModel.updateMany(
            {
                _id: { $in: userIdsToRemove.map((id) => new mongoose.Types.ObjectId(id)) },
            },
            {
                $pull: { classificationIds: classification._id.toString() },
            },
        );

        return res.json({
            success: true,
            data: updatedClassification!.toObject(),
        });
    } catch (e) {
        console.log(e);
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
