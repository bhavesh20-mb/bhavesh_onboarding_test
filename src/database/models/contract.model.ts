import mongoose from 'mongoose';
import { IContractModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IContractModel>({
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
});

schema.index(
    {
        contract: 1,
        type: 1,
    },
    { unique: true },
);

const ContractModel = mongoose.model('contracts', schema);

export default ContractModel;
