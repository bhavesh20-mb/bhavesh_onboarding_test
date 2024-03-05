import mongoose from 'mongoose';
import { AccountStatus } from 'src/interfaces/dbModels';
import { IPayerModel } from 'src/interfaces/hectorpayModels';

const schema = new mongoose.Schema<IPayerModel>(
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
        status: {
            type: Number,
            default: AccountStatus.Active,
        },
        
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const PayerModel = mongoose.model('hectorpay_payer', schema);

export default PayerModel;
