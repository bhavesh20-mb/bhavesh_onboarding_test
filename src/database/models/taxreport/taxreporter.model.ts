import mongoose from 'mongoose';
import { ITaxReporterModel } from 'src/interfaces/taxreportModels';

const schema = new mongoose.Schema<ITaxReporterModel>({
    email: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    wallet_address: {
        type: String,
        default: '',
    },
    wallet_name: {
        type: String,
        default: '',
    },
    user_type: {
        type: Number,
        default: 0,
    },
    wallet_type: {
        type: String,
        default: '',
    },
    chain_ids: {
        type: [String],
        default: [],
    },
    api_key: {
        type: String,
        default: '',
    },
    security_key: {
        type: String,
        default: '',
    },
    passphrase: {
        type: String,
        default: '',
    },
    timestamp: {
        type: Number,
        default: 0,
    },
});

schema.index(
    {
        address: 1,
        wallet_address: 1,
    },
    { unique: true },
);

const TaxReporterModel = mongoose.model('taxreport_reporter', schema);

export default TaxReporterModel;
