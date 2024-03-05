import { Request, Response } from 'express';
import AddressGroupModel from 'src/database/models/addressgroup.model';

export const deleteGroup = async (req: Request, res: Response) => {
    try{
        const {  groupId } = req.params

        const result = await AddressGroupModel.deleteOne({ _id: groupId });
        if (result.deletedCount > 0) {
            res.json({
                success: true,
                });
        }
    }catch(e){
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    } 
}