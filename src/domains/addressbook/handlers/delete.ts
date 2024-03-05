import { ethers } from 'ethers';
import { Request, Response } from 'express';
import UserModel from 'src/database/models/user.model';
import AddressBookModel from 'src/database/models/addressbook.model'

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const {userWalletAddress, walletAddress} = req.body;

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

        const account = await AddressBookModel.findOneAndDelete({ createdById: user._id, walletAddress: walletAddress})

        if (account) {
            return res.json({
                success: true,
                data: account!.toObject(),
            });
        }

    }catch(e){
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
    
};
