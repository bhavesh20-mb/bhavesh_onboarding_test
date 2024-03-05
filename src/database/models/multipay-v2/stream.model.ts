import mongoose from 'mongoose';
import { UNIT_OF_AMOUNT_LIST, UNIT_OF_PERIOD_LIST } from 'src/domains/multipay-v2/constants';
import { IStreamV2Model } from 'src/interfaces/multipayV2Models';

const schema = new mongoose.Schema<IStreamV2Model>(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hectorpay_recipient',
            required: true,
        },
        chainId: {
            type: Number,
            required: true,
        },
        tokenAddress: {
            type: String,
            required: true,
        },
        amountInUnit: {
            type: Number,
            required: true,
        },
        unitOfAmount: {
            type: String,
            enum: UNIT_OF_AMOUNT_LIST,
            required: true,
        },
        startAt: {
            type: Date,
            required: true,
        },
        periodInUnit: {
            type: Number,
            required: true,
        },
        unitOfPeriod: {
            type: String,
            enum: UNIT_OF_PERIOD_LIST,
            required: true,
        },
        description: {
            type: String,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'multipay_v2_project',
            required: true,
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const StreamV2Model = mongoose.model('multipay_v2_stream', schema);

export default StreamV2Model;
