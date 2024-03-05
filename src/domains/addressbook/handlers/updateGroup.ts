import { ethers } from 'ethers';
import { Request, Response } from 'express';
import UserModel from 'src/database/models/user.model';
import AddressGroupModel from 'src/database/models/addressgroup.model';

export const updateGroup = async (req: Request, res: Response) => {
    try {
        const {userWalletAddress, label, description, color} = req.body;

        if(!ethers.utils.isAddress(userWalletAddress))  
            return res.status(400).json({
                message: 'Invalid wallet address',
            });

        const user = await UserModel.findOne({ walletAddress: userWalletAddress })

        if (!user) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This User does not exist',
                },
            });
        }


        if(!label){
            return res.status(400).json({
                message: 'Must need name',
            });
        }

        const group = await AddressGroupModel.findOne({ createdById: user._id, label: label });

        if (!group) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This account is not exist',
                },
            });
        }

        group.label = label
        group.description = description
        group.color = color

        const savedAccount = await group.save()
        if(savedAccount)
            return res.json({
                success: true,
                data: savedAccount!.toObject(),
            });

    }catch(e){
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
    
};
