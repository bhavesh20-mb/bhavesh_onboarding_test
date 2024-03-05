import mongoose from 'mongoose';
import { IDecodedTxModel } from 'src/interfaces/taxreportModels';

const schema = new mongoose.Schema<IDecodedTxModel>({
    address: {
        type: String,
        default: '',
    },
    from: {
        type: String,
        default: '',
    },
    to: {
        type: String,
        default: '',
    },
    txdate: {
        type: String,
        default: '',
    },
    timestamp: {
        type: Number,
        default: 0,
    },
    txtype: {
        type: String,
        default: '',
    },
    token_address: {
        type: String,
        default: '',
    },
    token_name: {
        type: String,
        default: '',
    },
    token_price: {
        type: String,
        default: '',
    },
    symbol: {
        type: String,
        default: '',
    },
    amount: {
        type: String,
        default: '',
    },
    receive_token_address: {
        type: String,
        default: '',
    },
    receive_token_name: {
        type: String,
        default: '',
    },
    receive_token_price: {
        type: String,
        default: '',
    },
    receive_symbol: {
        type: String,
        default: '',
    },
    receive_amount: {
        type: String,
        default: '',
    },
    feeAmount: {
        type: String,
        default: '',
    },
    feePrice: {
        type: String,
        default: '',
    },
    chain_id: {
        type: String,
        default: '',
    },
    chain_name: {
        type: String,
        default: '',
    },
    block_number: {
        type: String,
        default: '',
    },
    txhash: {
        type: String,
        default: '',
    },
    token_logo: {
        type: String,
        default: '',
    },
    receive_token_logo: {
        type: String,
        default: '',
    },
});

schema.index(
    {
        address: 1,
        chain_id: 1,
        block_number: 1,
        txhash: 1,
        timestamp: 1,
    },
    { unique: true },
);

const DecodedTxModel = mongoose.model('taxreport_decodedtx', schema);

export default DecodedTxModel;
