import mongoose from 'mongoose';
import { ITaxExchangeTradeDecodeModel } from 'src/interfaces/taxreportModels';

const Schema = mongoose.Schema;

const schema = new Schema<ITaxExchangeTradeDecodeModel>({
    platform: {
        type: String,
        default: '',
    },
    txType: {
        type: String,
        default: '',
    },
    symbol: {
        type: String,
        default: '',
    },
    tradeId: {
        type: String,
        default: '',
    },
    orderId: {
        type: String,
        default: '',
    },
    counterOrderId: {
        type: String,
        default: '',
    },
    liquidity: {
        type: String,
        default: '',
    },
    forceTaker: {
        type: Boolean,
        default: false,
    },
    price: {
        type: Number,
        default: 0,
    },
    size: {
        type: Number,
        default: 0,
    },
    funds: {
        type: Number,
        default: 0,
    },
    fee: {
        type: Number,
        default: 0,
    },
    feeRate: {
        type: Number,
        default: 0,
    },
    feeCurrency: {
        type: String,
        default: '',
    },
    stop: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Number,
        default: 0,
    },
    tradeType: {
        type: String,
        default: '',
    }
});

schema.index(
    {
        address: 1,
        chain_id: 1,
    },
);

const ExchangeDecodedTxModel = mongoose.model('exchangetradetx', schema);

export default ExchangeDecodedTxModel;
