import mongoose from 'mongoose';
import { IClassificationModel } from 'src/interfaces/hectorpayModels';

const schema = new mongoose.Schema<IClassificationModel>(
    {
        label: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
    },
    { timestamps: true, collation: { locale: 'en_US', strength: 2 } },
);

schema.index(
    {
        label: 1,
        createdById: 1,
    },
    {
        unique: true,
    },
);

const ClassificationModel = mongoose.model('hectorpay_classification', schema);

export default ClassificationModel;
