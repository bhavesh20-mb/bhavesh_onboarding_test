import mongoose from 'mongoose';
import { IProtocolModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IProtocolModel>({
    id: {
        type: String,
        required: true,
    },
    chain: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    site_url: {
        type: String,
        required: true,
    },
    logo_url: {
        type: String,
        required: true,
    },
    has_supported_portfolio: {
        type: Boolean,
        required: true,
    },
    tvl: {
        type: Number,
        required: true,
    },
    portfolio_item_list: {
        type: [Object],
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
});

const ProtocolModel = mongoose.model('protocol', schema);

export default ProtocolModel;
