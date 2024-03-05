import mongoose from 'mongoose';
import { IInvestmentModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IInvestmentModel>({
    name: {
        type: String,
        required: true,
    },
    ticker: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    tokenAmount: {
        type: Number,
        required: true,
    },
    decimal: {
        type: Number,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    chain: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
});

const InvestmentModel = mongoose.model('investment', schema);

export default InvestmentModel;
