import mongoose from 'mongoose';

import { IAdSpacesUserModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesUserModel>(
    {
        walletAddress: {
            type: String,
            required: true,
            unique: true,
        },
        nonce: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        signature: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            required: false,
        },

        roles: [
            {
                type: String,
                enum: ['user', 'coupons', 'advertiser', 'staff', 'admin', 'master'],
            },
        ],
        permissions: [
            {
                type: String,
            },
        ],
        credit: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
        adminNotes: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'adspaces_user',
                },
                note: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const AdSpacesUserModel = mongoose.model('adspaces_user', schema);

export default AdSpacesUserModel;
