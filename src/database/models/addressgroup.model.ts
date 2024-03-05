import { getNativeBalancesForAddressesOperation } from '@moralisweb3/common-evm-utils';
import mongoose from 'mongoose';
import { IAddressGroupModel } from 'src/interfaces/dbModels';

const schema = new mongoose.Schema<IAddressGroupModel>(
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

const AddressGroupModel = mongoose.model('addressgroup', schema);

export default AddressGroupModel;
