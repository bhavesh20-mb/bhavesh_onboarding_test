import { Request, Response } from 'express';
import AddressGroupModel from 'src/database/models/addressgroup.model';
import { ethers } from 'ethers';
import UserModel from 'src/database/models/user.model';
import AddressBookModel from 'src/database/models/addressbook.model';

export const createGroup = async (req: Request, res: Response) => {
    try {
        const {userWalletAddress, label, description, color} = req.body;

        const user = await UserModel.findOne({ walletAddress: userWalletAddress })

        if (!user) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This User does not exist',
                },
            });
        }

        if(!ethers.utils.isAddress(userWalletAddress))  
            return res.status(400).json({
                message: 'Invalid wallet address',
            });

        if(!label){
            return res.status(400).json({
                message: 'Must need name',
            });
        }

        const group = await AddressGroupModel.findOne({ createdById: user._id,  label: label });

        if (group) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This group already exist',
                },
            });
        }

        const newGroup = new AddressGroupModel({
            label: label,
            color: color,
            description: description,
            createdById: user._id
        })

        const savedGroup = await newGroup.save()
        if(savedGroup)
            return res.json({
                success: true,
                data: savedGroup!.toObject(),
            });

    }catch(e){
        console.log(e)
        return res.status(500).json({
            message: 'Something went wrong...', 
        });
    }
    
};
