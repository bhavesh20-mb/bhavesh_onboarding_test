import mongoose from 'mongoose';
import { AccountStatus, IAccountModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IAccountModel>(
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
        status: {
            type: Number,
            default: AccountStatus.Active,
        },
        nonce: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const AccountModel = mongoose.model('accounts', schema);

export default AccountModel;
