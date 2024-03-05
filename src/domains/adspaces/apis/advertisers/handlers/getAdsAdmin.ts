import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

const ObjectID = require('mongodb').ObjectID;

import AdSpacesAdModel from 'src/database/models/adspaces/ad.model';

import { GetAdResponseType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';
import {
    IAdSpacesAdModel,
    IAdSpacesAdStatusModel,
    IAdSpacesAdSettingsModel,
    IAdSpacesBannersModel,
} from 'src/interfaces/adSpacesModels';

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

export const getAdsAdmin: IApiHandler<Request<{}>, Response<JsonResponseType<GetAdResponseType>>> = async (
    req,
    res,
) => {
    try {
        const ads = await AdSpacesAdModel.find();
        return sendSuccessResponse(res, { ads });
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
