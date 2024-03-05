import { Request, Response } from 'express';
import ClassificationModel from 'src/database/models/hectorpay/classification.model';
import {
    GetClassificationResponseType,
    GetClassificationsResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const getClassification: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<GetClassificationResponseType>>
> = async (req, res) => {
    try {
        const classification = await ClassificationModel.findOne({ _id: req.params.id, createdById: req.user!._id });

        if (!classification) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Classification not found',
                },
            });
        }

        return res.json({
            success: true,
            data: classification,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getClassifications: IApiHandler<
    Request,
    Response<JsonResponseType<GetClassificationsResponseType>>
> = async (req, res) => {
    try {
        const classifications = await ClassificationModel.find({ createdById: req.user?._id });

        return res.json({
            success: true,
            data: classifications,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
