import mongoose from 'mongoose';

import { IAdSpacesAdResultsModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesAdResultsModel>(
    {
        impressions: {
            type: Number,
            default: 0,
        },
        clicks: {
            type: Number,
            default: 0,
        },
        byCountry: [
            {
                code: {
                    type: String,
                },
                views: {
                    type: Number,
                    default: 0,
                },
                clicks: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        byPageOrigin: [
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
            },
        ],
    },
    {
        timestamps: true,
    },
);

const AdSpacesAdResultsModel = mongoose.model('adspaces_ad_results', schema);

export default AdSpacesAdResultsModel;