import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

const ObjectID = require('mongodb').ObjectID;

import AdSpacesAnnouncementModel from 'src/database/models/adspaces/announce.model';

import { GetAnnouncementResponseType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';

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

export const getAnnouncementsAdmin: IApiHandler<
    Request<{}>,
    Response<JsonResponseType<GetAnnouncementResponseType>>
> = async (req, res) => {
    try {
        const announcements = await AdSpacesAnnouncementModel.find();
        return sendSuccessResponse(res, { announcements });
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
