import { Request, Response } from 'express';
import AdSpacesAdModel from 'src/database/models/adspaces/ad.model';
import { IAdSpacesAdModel } from 'src/interfaces/adSpacesModels';
import { CreateAdRequestType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';

export const createAd: IApiHandler<
    Request<{}, {}, CreateAdRequestType>,
    Response<JsonResponseType<IAdSpacesAdModel>>
> = async (req, res) => {
    try {
        const newAd = await AdSpacesAdModel.create({
            ...req.body,
            createdById: req.user!._id,
        });

        return res.json({
            success: true,
            data: newAd.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
