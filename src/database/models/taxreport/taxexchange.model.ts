import mongoose from 'mongoose';
import { ITaxExchangeDecodeModel } from 'src/interfaces/taxreportModels';

const Schema = mongoose.Schema;

const schema = new Schema<ITaxExchangeDecodeModel>({
    platform: {
        type: String,
        default: '',
    },
    txType: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Number,
        default: 0,
    },
    updatedAt: {
        type: Number,
        default: '',
    },
    amount: {
        type: Number,
        default: 0,
    },
    fee: {
        type: Number,
        default: 0,
    },
    chainId: {
        type: Number,
        default: 0,
    },
    chainName: {
        type: String,
        default: '',
    },
    txhash: {
        type: String,
        default: '',
    },
    tokenLogo: {
        type: String,
        default: '',
    },
    isInner: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: '',
    },
    remark: {
        type: String,
        default: '',
    },
    memo: {
        type: String,
        default: '',
    },
    arrears: {
        type: Boolean,
        default: false,
    }
});

schema.index(
    {
        address: 1,
        chain_id: 1,
    },
);

const ExchangeDecodedTxModel = mongoose.model('exchangetx', schema);

export default ExchangeDecodedTxModel;
