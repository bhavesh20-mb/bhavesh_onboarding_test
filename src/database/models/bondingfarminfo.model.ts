import mongoose from 'mongoose';
import { IBondingFarmInfoModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IBondingFarmInfoModel>({
    contract: {
        type: Object,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        required: true,
    },
    name: {
        type: String,
        default: '',
    },
    autoStaking: {
        type: Boolean,
        default: false,
    },
});

schema.index(
    {
        contract: 1,
        type: 1,
    },
    { unique: true },
);

const BondingFarmInfoModel = mongoose.model('bondingfarminfo', schema);

export default BondingFarmInfoModel;
