import { Request, Response } from 'express';
import AdSpacesAnnouncementModel from 'src/database/models/adspaces/announce.model';
import { IAdSpacesAnnouncementModel } from 'src/interfaces/adSpacesModels';
import { CreateAdRequestType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';

export const updateAnnouncement: IApiHandler<
    Request<{ id: string }, {}, CreateAdRequestType>,
    Response<JsonResponseType<IAdSpacesAnnouncementModel>>
> = async (req, res) => {
    try {
        const announcement = await AdSpacesAnnouncementModel.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
        });

        if (!announcement) {
            return res.status(404).json({ success: false, error: { message: 'Announcement not found' } });
        }

        return res.json({
            success: true,
            data: announcement.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
