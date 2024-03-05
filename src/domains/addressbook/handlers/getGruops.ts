import { Request, Response } from 'express';
import AddressGroupModel from 'src/database/models/addressgroup.model';
import UserModel from 'src/database/models/user.model';

export const getGroup = async (req: Request, res: Response) => {
    try{
        const { walletAddress } = req.params
        const user = await UserModel.findOne({ walletAddress: walletAddress })

        if (!user) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This User does not exist',
                },
            });
        }

        const groups = await AddressGroupModel.find({createdById: user._id})
        if(groups.length == 0) 
            res.json({
                message:"No group"
            })
        else res.json(groups)
    }catch(e){
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    } 
}