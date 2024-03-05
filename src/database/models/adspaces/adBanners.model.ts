import mongoose from 'mongoose';

import { IAdSpacesBannersModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesBannersModel>(
    {
        mediumRectangle: {
            type: String,
        },
        largeRectangle: {
            type: String,
        },
        largeBoard: {
            type: String,
        },
        mobileLeaderboard: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const AdSpacesBannersModel = mongoose.model('adspaces_banners', schema);

export default AdSpacesBannersModel;
