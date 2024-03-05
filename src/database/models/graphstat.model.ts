import mongoose from 'mongoose';
import { IGraphStatModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IGraphStatModel>({
    totalValueLocked: {
        type: String,
        required: true,
    },
    bankTotal: {
        type: String,
        required: true,
    },
    torTVL: {
        type: String,
        required: true,
    },
    hecCirculatingSupply: {
        type: String,
        required: true,
    },
    staked: {
        type: String,
        required: true,
    },
    runwayCurrent: {
        type: String,
        required: true,
    },
    treasuryHecDaiPOL: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
    fullData: {
        type: Object,
        required: true,
    },
});

const GraphStatModel = mongoose.model('graphStat', schema);

export default GraphStatModel;
