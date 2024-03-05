import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import { ADSPACES_ALLOWED_ORIGINS } from 'src/constants';

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

const allowedOrigins = ADSPACES_ALLOWED_ORIGINS;

function isValidOrigin(origin: string): boolean {
    return allowedOrigins.includes(origin) || true;
}

async function getPageOrigin(req: Request): Promise<string | undefined> {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const pagePath = req.headers['x-page-path'];
    let extractedOrigin: string | undefined;

    if (origin) {
        extractedOrigin = origin;
    } else if (referer) {
        try {
            const url = new URL(referer);
            extractedOrigin = `${url.protocol}//${url.host}`;
        } catch (error) {
            console.error('Invalid Referer URL:', referer);
        }
    }
    if (extractedOrigin && isValidOrigin(extractedOrigin)) {
        return `${extractedOrigin}${pagePath}`;
    } else {
        return undefined;
    }
}

function cutRoute(urlString: string): string {
    try {
        const url = new URL(urlString);
        return url.pathname.slice(1);
    } catch (error) {
        console.error('Invalid URL:', urlString);
        return '';
    }
}

export const getAnnouncement: IApiHandler<
    Request<{ buildId: string }>,
    Response<JsonResponseType<GetAnnouncementResponseType>>
> = async (req, res) => {
    try {
        const pageOrigin = await getPageOrigin(req);

        if (!pageOrigin) {
            throw new Error('Invalid or not allowed origin.');
        }

        const { buildId } = req.params;

        const announcement = await AdSpacesAnnouncementModel.findOne({
            buildId: buildId,
            targets: {
                $elemMatch: {
                    code: 'global',
                },
            },
            isActive: true,
        }).sort({ createdAt: -1 });

        if (!announcement) {
            //throw new Error('No announcement found.');
            return res.status(200).json({
                success: false,
                error: {
                    message: 'No announcement found.',
                },
            });
        }

        return sendSuccessResponse(res, announcement);
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
