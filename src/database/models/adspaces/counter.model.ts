import mongoose from 'mongoose';

import { IAdSpacesVoucherCounterModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesVoucherCounterModel>(
    {
        _id: {
            type: String,
            required: true,
        },
        sequence_value: {
            type: Number,
            required: true,
        },
    },
);

const AdSpacesVoucherCounterModel = mongoose.model<IAdSpacesVoucherCounterModel>('adspaces_vouchers_counter', schema);

export default AdSpacesVoucherCounterModel;