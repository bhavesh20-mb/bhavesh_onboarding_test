import mongoose from 'mongoose';
import { IProjectV2Model } from 'src/interfaces/multipayV2Models';

const schema = new mongoose.Schema<IProjectV2Model>(
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

const ProjectV2Model = mongoose.model('multipay_v2_project', schema);

export default ProjectV2Model;
