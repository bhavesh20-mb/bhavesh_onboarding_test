import mongoose from 'mongoose';
import { ITaxReportReqModel } from 'src/interfaces/taxreportModels';

const Schema = mongoose.Schema;

const schema = new Schema<ITaxReportReqModel>({
    start: {
        type: Number,
        default: 0,
    },
    end: {
        type: Number,
        default: 999999999999999,
    },
    chainIds: {
        type: [String],
        default: [],
        require: true,
    },
    walletAddress: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        ref: 'taxreport_users',
        default: '',
        require: true,
    },
    createdOn: {
        type: Number,
        default: 0,
        require: true,
    },
    status: {
        type: String,
        default: 'N', // C: Completed; I: InProgress; N: Not Started
        require: true,
    },
    enableEmail: {
        type: Boolean,
        default: true,
        require: true,
    },
    enablePush: {
        type: Boolean,
        default: true,
        require: true,
    },
    completedBy: {
        type: Number,
        default: 0,
        require: true,
    },
});

const TaxReportReqModel = mongoose.model('taxreport_req', schema);

export default TaxReportReqModel;
