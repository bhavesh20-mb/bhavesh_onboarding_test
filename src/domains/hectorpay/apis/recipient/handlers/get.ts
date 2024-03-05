import { Request, Response } from 'express';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import {
    GetRecipientResponseType,
    GetRecipientsQueryParamsType,
    GetRecipientsResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const getRecipient: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<GetRecipientResponseType>>
> = async (req, res) => {
    try {
        const recipient = await RecipientModel.findOne({
            _id: req.params.id,
            createdById: req.user!._id,
        });

        if (!recipient) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Recipient not found',
                },
            });
        }

        return res.json({
            success: true,
            data: recipient,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getRecipients: IApiHandler<
    Request<{}, {}, {}, GetRecipientsQueryParamsType>,
    Response<JsonResponseType<GetRecipientsResponseType>>
> = async (req, res) => {
    const keywordRegex = req.query.keyword ? new RegExp(req.query.keyword, 'i') : null;

    try {
        const findQuery = RecipientModel.find({ createdById: req.user!._id });

        if (req.query.classifications) {
            findQuery.find({
                classificationIds: {
                    $in: req.query.classifications,
                },
            });
        }

        if (keywordRegex)
            findQuery.or([{ name: keywordRegex }, { email: keywordRegex }, { walletAddress: req.query.keyword }]);

        const recipients = await findQuery.exec();

        return res.json({
            success: true,
            data: recipients,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getRecipientsAmount: IApiHandler<
    Request<{}, {}, {}, GetRecipientsQueryParamsType>,
    Response<JsonResponseType<{ [key: string]: number }>>
> = async (req, res) => {
    try {
        const countByClassification: { [key: string]: number } = {};

        if (req.query.classifications) {
            for (const classification of req.query.classifications) {
                const count = await RecipientModel.find({
                    createdById: req.user!._id,
                    classificationIds: classification,
                }).countDocuments();

                countByClassification[classification] = count;
            }
        }

        return res.json({
            success: true,
            data: countByClassification,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
