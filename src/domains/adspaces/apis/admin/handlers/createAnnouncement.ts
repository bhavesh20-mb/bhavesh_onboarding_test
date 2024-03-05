import { Request, Response } from 'express';
import AdSpacesAnnouncementModel from 'src/database/models/adspaces/announce.model';
import { IAdSpacesAnnouncementModel } from 'src/interfaces/adSpacesModels';
import { CreateAdRequestType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';

export const createAnnouncement: IApiHandler<
    Request<{}, {}, CreateAdRequestType>,
    Response<JsonResponseType<IAdSpacesAnnouncementModel>>
> = async (req, res) => {
    try {
        const newAnnouncement = await AdSpacesAnnouncementModel.create({
            ...req.body,
            createdById: req.user!._id,
        });

        return res.json({
            success: true,
            data: newAnnouncement.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
