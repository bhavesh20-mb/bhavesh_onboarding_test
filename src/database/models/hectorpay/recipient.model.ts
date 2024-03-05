import mongoose from 'mongoose';
import { IRecipientModel } from 'src/interfaces/hectorpayModels';

const schema = new mongoose.Schema<IRecipientModel>(
    {
        walletAddress: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        classificationIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'hectorpay_classification',
            },
        ],
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

schema.index(
    {
        walletAddress: 1,
        createdById: 1,
    },
    {
        unique: true,
    },
);

const RecipientModel = mongoose.model('hectorpay_recipient', schema);

export default RecipientModel;
