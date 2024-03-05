import mongoose from 'mongoose';
import { IProjectModel } from 'src/interfaces/hectorpayModels';

const schema = new mongoose.Schema<IProjectModel>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        chainId: {
            type: Number,
            required: true,
        },
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
        title: 1,
        createdById: 1,
        chainId: 1,
    },
    {
        unique: true,
    },
);

schema.post('save', function (error: any, doc: any, next: any) {
    if (error.code === 11000 && error.keyPattern.title !== undefined) {
        next(new Error('Title already exists'));
    } else {
        next();
    }
});

const ProjectModel = mongoose.model('hectorpay_project', schema);

export default ProjectModel;
