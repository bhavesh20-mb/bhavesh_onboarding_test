import mongoose from 'mongoose';
import { AccountStatus } from 'src/interfaces/dbModels';
import { ITaxUserModel } from 'src/interfaces/taxreportModels';

const schema = new mongoose.Schema<ITaxUserModel>(
    {
        name: {
            type: String,
        },
        walletAddress: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
        },
        nonce: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        isRegister: {
            type: Boolean,
            default: false,
        },
        status: {
            type: Number,
            default: AccountStatus.Active,
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const TaxUserModel = mongoose.model('taxreport_user', schema);

export default TaxUserModel;
