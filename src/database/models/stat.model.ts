import mongoose from 'mongoose';
import { IStatModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IStatModel>({
    marketCap: {
        type: Number,
        default: 0,
    },
    hecPrice: {
        type: Number,
        default: 0,
    },
    hecBurned: {
        type: Number,
        default: 0,
    },
    circulatingSupply: {
        type: Number,
        default: 0,
    },
    totalSupply: {
        type: Number,
        default: 0,
    },
    treasury: {
        type: Number,
        default: 0,
    },
    currentIndex: {
        type: Number,
        default: 0,
    },
});

const StatModel = mongoose.model('generalStat', schema);

export default StatModel;
