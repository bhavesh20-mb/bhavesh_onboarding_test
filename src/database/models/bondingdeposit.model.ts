import mongoose from 'mongoose';
import { IBondingDepositModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IBondingDepositModel>({
    depositId: {
        type: Number,
        default: 0,
    },
    principal: {
        type: String,
        default: '',
    },
    deposit: {
        type: Number,
        default: 0,
    },
    payout: {
        type: Number,
        default: 0,
    },
    expires: {
        type: Number,
        default: 0,
    },
    priceInUSD: {
        type: Number,
        default: 0,
    },
    stake: {
        type: Boolean,
        default: false,
    },
    timeStamp: {
        type: Number,
        default: 0,
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
        depositId: 1,
        farmAddress: 1,
    },
    { unique: true },
);

const BondingDepositModel = mongoose.model('bondingdeposit', schema);

export default BondingDepositModel;
