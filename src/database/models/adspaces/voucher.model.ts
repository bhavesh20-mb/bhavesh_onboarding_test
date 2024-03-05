import mongoose from 'mongoose';

import { IAdSpacesVoucherModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesVoucherModel>(
    {
        generatedForCoupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdSpacesCouponModel',
            required: true,
        },
        generatedForAddress: {
            type: String,
            required: true,
        },
        nonce: {
            type: Number,
            required: true,
        },
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        product: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        fixed: {
            type: Boolean,
            required: true,
        },
        redeemed: {
            type: Boolean,
            default: false,
        },
        signature: {
            type: String,
            required: true,
        },
        digestHex: {
            type: String,
        },
        planInfo: {
            type: Object,
        },
    },
    {
        timestamps: true,
    },
);

const AdSpacesVoucherModel = mongoose.model<IAdSpacesVoucherModel>('adspaces_vouchers', schema);

export default AdSpacesVoucherModel;
