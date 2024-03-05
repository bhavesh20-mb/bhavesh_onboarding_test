import mongoose from 'mongoose';
import { IFnftModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IFnftModel>({
    id: {
        type: Number,
        default: 0,
    },
    amount: {
        type: Number,
        default: 0,
    },
    secs: {
        type: Number,
        default: 0,
    },
    startTime: {
        type: Number,
        default: 0,
    },
    multiplier: {
        type: Number,
        default: 0,
    },
    rewardDebt: {
        type: Number,
        default: 0,
    },
    pendingReward: {
        type: Number,
        default: 0,
    },
    fnftAddress: {
        type: String,
        default: '',
    },
    farmAddress: {
        type: String,
        default: '',
    },
    blockNumber: {
        type: String,
        default: '',
    },
});

schema.index(
    {
        id: 1,
        fnftAddress: 1,
        farmAddress: 1,
    },
    { unique: true },
);

const FnftModel = mongoose.model('fnfts', schema);

export default FnftModel;
