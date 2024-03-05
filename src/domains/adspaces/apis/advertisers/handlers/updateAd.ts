import { Request, Response } from 'express';
import AdSpacesAdModel from 'src/database/models/adspaces/ad.model';
import { IAdSpacesAdModel } from 'src/interfaces/adSpacesModels';
import { CreateAdRequestType, IApiHandler, JsonResponseType } from 'src/domains/adspaces/types/api';

export const updateAd: IApiHandler<
    Request<{ id: string }, {}, CreateAdRequestType>,
    Response<JsonResponseType<IAdSpacesAdModel>>
> = async (req, res) => {
    try {
      console.log(req.params.id)
      console.log(req.body)

        const ad = await AdSpacesAdModel.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

        if (!ad) {
            return res.status(404).json({ success: false, error: { message: 'Ad not found' } });
        }

        return res.json({
            success: true,
            data: ad.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
