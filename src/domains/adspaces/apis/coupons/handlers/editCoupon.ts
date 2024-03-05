import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

const ObjectID = require('mongodb').ObjectID;

import { EditCouponResponseType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';
import { userHasRole, userHasPermission } from 'src/domains/adspaces/utils';

function sendErrorResponse(res: Response, error: Error): Response {
    return res.status(500).json({
        success: false,
        error: {
            message: error.message,
        },
    });
}

function sendSuccessResponse(res: Response, data: unknown): Response {
    return res.json({
        success: true,
        data,
    });
}

export const editCoupon: IApiHandler<
    Request<{ dimension: string }>,
    Response<JsonResponseType<EditCouponResponseType>>
> = async (req, res) => {
    try {
        console.log('User', req.user);
        if (!req.user) {
            return sendErrorResponse(res, new Error('User not found'));
        }
        console.log(req.user)
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
