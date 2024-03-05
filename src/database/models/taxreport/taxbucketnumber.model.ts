import mongoose from 'mongoose';
import { ITaxBucketNumberModel } from 'src/interfaces/taxreportModels';

const schema = new mongoose.Schema<ITaxBucketNumberModel>({
    address: {
        type: String,
        required: true,
    },
    wallet_address: {
        type: String,
        required: true,
    },
    chain_id: {
        type: String,
        required: true,
    },
    bucket_number: {
        type: Number,
        default: 0,
    },
});

schema.index(
    {
        address: 1,
        wallet_address: 1,
        chain_id: 1,
    },
    { unique: true },
);

const TaxBucketNumberModel = mongoose.model('taxreport_bucketnumber', schema);

export default TaxBucketNumberModel;
