import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

const ObjectID = require('mongodb').ObjectID;

import { CreateCouponResponseType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';

import { userHasRole, userHasPermission } from 'src/domains/adspaces/utils';

import CouponModel from 'src/database/models/adspaces/coupon.model';

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

export const createCoupon: IApiHandler<Request<{}>, Response<JsonResponseType<CreateCouponResponseType>>> = async (
    req,
    res,
) => {
    try {
        console.log('User', req.user);
        if (!req.user) {
            return sendErrorResponse(res, new Error('User not found'));
        }

        if (!userHasRole(req.user.roles, 'coupons') /*|| !userHasPermission(req.user.roles, 'create.coupon')*/) {
            return sendErrorResponse(res, new Error('User not authorized'));
        }

        try {
            const coupon = await CouponModel.create(req.body);
            console.log(coupon);
            return sendSuccessResponse(res, coupon);
        } catch (e) {
            // @ts-ignore
            if (e.code === 11000) {
                return res
                    .status(400)
                    .json({ success: false, error: { message: `Coupon Code: ${req.body.code} already exists` } });
            }
            return res
                .status(500)
                .json({ success: false, error: { message: 'An error occurred while creating the coupon.' } });
        }
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
