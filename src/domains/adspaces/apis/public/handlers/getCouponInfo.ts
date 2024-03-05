import { Request, Response } from 'express';

import { GetAdResponseType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';
import CouponModel from 'src/database/models/adspaces/coupon.model';
import { isValidCouponCode } from './getVoucher';

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

export const getCouponInfo: IApiHandler<Request<{}>, Response<JsonResponseType<GetAdResponseType>>> = async (
    req,
    res,
) => {
    try {
        const { couponCode } = req.query;

        if (!couponCode) {
            throw new Error('Coupon code is required');
        }

        if (!isValidCouponCode(String(couponCode))) {
            throw new Error('Invalid coupon code');
        }

        const couponInfo = await CouponModel.findOne({
            code: couponCode,
        });

        if (!couponInfo) {
            throw new Error('Coupon not found');
        }

        const { results, ...couponInfoWithoutResults } = couponInfo.toObject();

        return sendSuccessResponse(res, couponInfoWithoutResults);
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
