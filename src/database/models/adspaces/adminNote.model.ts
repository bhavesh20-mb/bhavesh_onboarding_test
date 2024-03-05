import mongoose from 'mongoose';

import { IAdSpacesAdminNoteModel } from 'src/interfaces/adSpacesModels';

const schema = new mongoose.Schema<IAdSpacesAdminNoteModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'adspaces_user',
        },
        note: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AdSpacesAdminNoteModel = mongoose.model( 'adspaces_admin_note', schema );

export default AdSpacesAdminNoteModel;