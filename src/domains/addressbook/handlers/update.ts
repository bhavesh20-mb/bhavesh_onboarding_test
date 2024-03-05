import { ethers } from 'ethers';
import { Request, Response } from 'express';
import AddressBookModel from 'src/database/models/addressbook.model';
import { validateEmail } from '../utils/validateEmail';
import UserModel from 'src/database/models/user.model';
import AddressGroupModel from 'src/database/models/addressgroup.model';

export const updateAccount = async (req: Request, res: Response) => {
    try {
        const {userWalletAddress, walletAddress, name, email, groupIds, description} = req.body;

        if(!ethers.utils.isAddress(walletAddress) || !ethers.utils.isAddress(userWalletAddress))  
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

        if(!name){
            return res.status(400).json({
                message: 'Must need name',
            });
        }

        const account = await AddressBookModel.findOne({ createdById: user._id, walletAddress: walletAddress });

        if (!account) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This account is not exist',
                },
            });
        }

        if(!validateEmail(email)){
            return res.status(400).json({
                message: 'Email is wrong..',
            });
        }

        if(groupIds.split(',').length == 0 ){
            account.name = name
            account.walletAddress = walletAddress
            account.description = description
            account.classificationIds = []
        }else{
            account.name = name
            account.walletAddress = walletAddress
            account.description = description
            account.classificationIds = []
            for(let i = 0 ; i < groupIds.split(',').length; i ++){
                const group = await AddressGroupModel.findById(groupIds.split(',')[i])
                if(group)
                    account.classificationIds.push(groupIds.split(',')[i])
                else    
                    return res.status(409).json({
                        success: false,
                        error: {
                            message: 'None exist group ID',
                        },
                    });
            }

        }

        const savedAccount = await account.save()
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
