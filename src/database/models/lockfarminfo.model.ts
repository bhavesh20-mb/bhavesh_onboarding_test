import mongoose from 'mongoose';
import { ILockFarmModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<ILockFarmModel>({
    address: {
        type: String,
        default: '',
    },
    farmName: {
        type: String,
        default: '',
    },
    farmTVL: {
        type: Number,
        default: 0,
    },
    baseAPR: {
        type: Number,
        default: 0,
    },
    boostAPR: {
        type: Number,
        default: 0,
    },
});

schema.index(
    {
        address: 1,
    },
    { unique: true },
);

const LockFarmInfoModel = mongoose.model('lockfarminfo', schema);

export default LockFarmInfoModel;
