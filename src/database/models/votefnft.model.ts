import mongoose from 'mongoose';
import { IVotingFnftModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IVotingFnftModel>({
    id: {
        type: Number,
        default: 0,
    },
    fnftAddress: {
        type: String,
        default: '',
    },
    endTime: {
        type: Number,
        default: 0,
    },
    voter: {
        type: String,
        default: '',
    },
    contract: {
        type: String,
        default: '',
    },
});

schema.index(
    {
        id: 1,
        fnftAddress: 1,
        voter: 1,
    },
    { unique: true },
);

const VoteFnftModel = mongoose.model('votefnft', schema);

export default VoteFnftModel;
