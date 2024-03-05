import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import { ADSPACES_ALLOWED_ORIGINS } from 'src/constants';

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

interface IpInfo {
    status: 'success' | 'fail';
    continent: string;
    continentCode: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
    query: string;
    mobile: boolean;
    proxy: boolean;
    hosting: boolean;
}

const getIpInfo = async (ip: string): Promise<IpInfo> => {
    try {
        const response = await fetch(`https://pro.ip-api.com/json/${ip}?key=RxzFLqHseb2zyl6`);
        const ipInfos = (await response.json()) as Promise<IpInfo>;
        return ipInfos;
    } catch (error: any) {
        if (error instanceof Error) {
            throw error;
        } else {
            console.log(error);
            throw new Error('An unexpected error occurred while fetching the country by IP.');
        }
    }
};

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

const getBestAdAvaible = async (dimension: string, pageOrigin: string): Promise<IAdSpacesAdModel | undefined> => {
    try {
        const targetRouter = cutRoute(pageOrigin);

        const query = {
            [`banners.${dimension}`]: { $exists: true },
            $or: [
                { 'settings.pageTargeting': { $size: 0 } },
                { 'settings.pageTargeting.code': targetRouter },
            ],
        };

        const count = await AdSpacesAdModel.countDocuments(query);

        const randomSkip = Math.floor(Math.random() * count);

        const randomAd = await AdSpacesAdModel.findOne(query).skip(randomSkip).limit(1);

        return randomAd === null ? undefined : randomAd;
    } catch (error: any) {
        if (error instanceof Error) {
            throw error;
        } else {
            console.log(error);
            throw new Error('An unexpected error occurred while fetching the country by IP.');
        }
    }
};

export const getAd: IApiHandler<Request<{ dimension: string }>, Response<JsonResponseType<GetAdResponseType>>> = async (
    req,
    res,
) => {
    try {
        const pageOrigin = await getPageOrigin(req);

        if (!pageOrigin) {
            throw new Error('Invalid or not allowed origin.');
        }

        /*let ip: string | undefined;
        if (req.headers['x-forwarded-for']) {
            ip = (req.headers['x-forwarded-for'] as string).split(',')[0];
        } else if (req.headers['x-real-ip']) {
            ip = req.socket.remoteAddress;
        } else {
            ip = req.socket.remoteAddress;
        }
        if (!ip) {
            throw new Error('IP address not found.');
        }

        const ipData = await getIpInfo(ip);*/

        const ad = await getBestAdAvaible(req.params.dimension, pageOrigin);

        if (!ad) {
            throw new Error('No ADS avaible.');
        }

        switch (req.params.dimension) {
            case 'mediumRectangle':
                return sendSuccessResponse(res, {
                    url: ad.url,
                    image: ad.banners.mediumRectangle,
                });
            case 'mobileLeaderboard':
                return sendSuccessResponse(res, {
                    url: ad.url,
                    image: ad.banners.mobileLeaderboard,
                });
            case 'largeRectangle':
                return sendSuccessResponse(res, {
                    url: ad.url,
                    image: ad.banners.largeRectangle,
                });
            case 'largeBoard':
                return sendSuccessResponse(res, {
                    url: ad.url,
                    image: ad.banners.largeBoard,
                });
            default:
                throw new Error('Invalid dimension.');
        }
    } catch (error: any) {
        if (error instanceof Error) {
            return sendErrorResponse(res, error);
        } else {
            console.log(error);
        }
    }
};
