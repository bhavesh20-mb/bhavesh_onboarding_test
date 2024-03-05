import mongoose from 'mongoose';

import { IAdSpacesCouponModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesCouponModel>(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['fixed', 'percent'],
            required: true,
        },
        discountAmount: {
            type: String,
            required: true,
        },
        product: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        maxUses: {
            type: Number,
            required: true,
        },
        maxUsesPerUser: {
            type: Number,
            required: true,
        },
        startDate: {
            type: String,
            required: true,
        },
        endDate: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        results: {
            voucherGenerated: {
                type: Number,
                default: 0,
            },
            voucherRedeemed: {
                type: Number,
                default: 0,
            },
            redeemers: [
                {
                    address: {
                        type: String,
                        required: true,
                    },
                    redeemedAt: {
                        type: Date,
                        required: true,
                    },
                    voucherUsed: {
                        type: String,
                        required: true,
                    },
                    planId: {
                        type: String,
                        required: true,
                    },
                    userPaid: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },
    },
    {
        timestamps: true,
    },
);

const CouponModel = mongoose.model<IAdSpacesCouponModel>('adspaces_coupons', schema);

export default CouponModel;
