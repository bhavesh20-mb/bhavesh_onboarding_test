import mongoose from 'mongoose';
import { IPriceModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IPriceModel>({
    chainName: {
        type: String,
        default: '',
    },
    tokenAddress: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        default: 0,
    },
    priceUnit: {
        type: String,
        default: 'USD',
    },
    blockNumber: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Number,
        default: 0,
    },
});

schema.index(
    {
        chainName: 1,
        tokenAddress: 1,
        blockNumber: 1,
        timestamp: 1,
    },
    { unique: true },
);

const PriceModel = mongoose.model('taxreport_tokenprice', schema);

export default PriceModel;
