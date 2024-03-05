import mongoose from 'mongoose';

import { IAdSpacesAnnouncementModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesAnnouncementModel>(
    {
        type: {
            type: String,
            required: true,
        },
        targets: {
            type: [Object],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        url: {
            type: String,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        timerInMinutes: {
            type: Number,
        },
        buildId: {
            type: String,
            required: true,
        },
        buildLocked: {
            type: Boolean,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

const AdSpacesAnnouncementModel = mongoose.model('adspaces_announcements', schema);

export default AdSpacesAnnouncementModel;
