import mongoose from 'mongoose';

import { IAdSpacesCountryModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesCountryModel>(
    {
        code: {
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

const AdSpacesCountryModel = mongoose.model('adspaces_country', schema);

export default AdSpacesCountryModel;