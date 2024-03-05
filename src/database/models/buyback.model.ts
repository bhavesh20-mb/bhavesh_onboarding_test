import mongoose from 'mongoose';
import { IBuybackModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IBuybackModel>({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    investments: {
        type: Object,
        required: true,
    },
    blockNumber: {
        type: String,
    },
    timeStamp: {
        type: Date,
        required: true,
    },
});

const BuybackModel = mongoose.model('buyback', schema);

export default BuybackModel;
