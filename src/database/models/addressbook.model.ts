import mongoose from 'mongoose';
import { IAddressBookModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IAddressBookModel>(
    {
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        walletAddress: {
            type: String,
            required: true
        },
        email: {
            type: String,
        },
        description: {
            type: String,
        },
        classificationIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'addressgroup',
            },
        ],

    }
);

const AddressBookModel = mongoose.model('addressbook', schema);

export default AddressBookModel;
