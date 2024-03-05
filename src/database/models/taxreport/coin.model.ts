import mongoose from 'mongoose';
import { ITaxCoinModel } from 'src/interfaces/taxreportModels';

const schema = new mongoose.Schema<ITaxCoinModel>({
    id: {
        type: String,
        default: '',
    },
    symbol: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    logo: {
        type: String,
        default: '',
    },
});

schema.index(
    {
        id: 1,
        symbol: 1,
        name: 1,
    },
    { unique: true },
);

const TaxCoinModel = mongoose.model('taxreport_coin', schema);

export default TaxCoinModel;
