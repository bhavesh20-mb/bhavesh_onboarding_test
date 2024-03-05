import mongoose from 'mongoose';
import { enmUserStatus, IUserModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IUserModel>(
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
        status: {
            type: Number,
            required: true,
            default: enmUserStatus.Unverified,
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

const UserModel = mongoose.model('user', schema);

export default UserModel;
