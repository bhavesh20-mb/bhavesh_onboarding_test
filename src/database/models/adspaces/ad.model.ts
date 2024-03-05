import mongoose from 'mongoose';

import { IAdSpacesAdModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesAdModel>(
    {
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'adspaces_campaign',
        },
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        url: {
            type: String,
        },
        banners: {
            type: Object,
        },
        status: {
            type: Object,
        },
        settings: {
            type: Object,
        },
        results: {
            type: Object,
        },
    },
    {
        timestamps: true,
    },
);

const AdSpacesAdModel = mongoose.model('adspaces_ad', schema);
  
export default AdSpacesAdModel;