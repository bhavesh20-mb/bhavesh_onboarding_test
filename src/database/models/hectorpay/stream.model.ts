import mongoose from 'mongoose';
import { UNIT_OF_AMOUNT_LIST, UNIT_OF_PERIOD_LIST } from 'src/domains/hectorpay/constants';
import { IStreamModel } from 'src/interfaces/hectorpayModels';

const schema = new mongoose.Schema<IStreamModel>(
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
        onchainStreamId: {
            type: String,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hectorpay_project',
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

const StreamModel = mongoose.model('hectorpay_stream', schema);

export default StreamModel;
