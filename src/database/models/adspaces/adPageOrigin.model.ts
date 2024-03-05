import mongoose from 'mongoose';

import { IAdSpacesPageOriginModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesPageOriginModel>(
    {
        url: {
            type: String,
        },
        impressions: {
            type: Number,
            default: 0,
        },
        clicks: {
            type: Number,
            default: 0,
        },
    }
);

const AdPageOrigin = mongoose.model('adspaces_page_origin', schema);

export default AdPageOrigin;