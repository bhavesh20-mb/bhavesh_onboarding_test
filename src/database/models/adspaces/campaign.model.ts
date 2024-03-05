import mongoose from 'mongoose';

import { IAdSpacesCampaignModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesCampaignModel>(
    {
        advertiserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'adspaces_advertiser',
        },
        name: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const AdSpacesCampaignModel = mongoose.model('adspaces_campaign', schema);

export default AdSpacesCampaignModel;
