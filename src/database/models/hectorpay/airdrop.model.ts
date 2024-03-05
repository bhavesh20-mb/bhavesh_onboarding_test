import mongoose from 'mongoose';
import { IAirdropModel } from 'src/interfaces/hectorpayModels';

const schema = new mongoose.Schema<IAirdropModel>(
    {
        recipientIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hectorpay_recipient',
        }],
        chainId: {
            type: Number,
            required: true,
        },
        tokenAddress: {
            type: String,
            required: true,
        },
        tokenType: {
            type: String,
            enum: ['erc20', 'erc721'],
        },
        amount: {
            type: Number,
            required: true,
        },
        releaseAt: {
            type: Date,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        onchainAirdropId: {
            type: String,
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const AirdropModel = mongoose.model('hectorpay_airdrop', schema);

export default AirdropModel;
