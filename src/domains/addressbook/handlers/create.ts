import { ethers } from 'ethers';
import { Request, Response } from 'express';
import AddressBookModel from 'src/database/models/addressbook.model';
import { validateEmail } from '../utils/validateEmail';
import AddressGroupModel from 'src/database/models/addressgroup.model';
import UserModel from 'src/database/models/user.model';

export const createAccount = async (req: Request, res: Response) => {
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

        const account = await AddressBookModel.findOne({ createdById: user._id , walletAddress: walletAddress});

        if (account) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'This wallet Address already exist',
                },
            });
        }

        if(!name){
            return res.status(400).json({
                message: 'Must need name',
            });
        }

        if(!validateEmail(email)){
            return res.status(400).json({
                message: 'Email is wrong..',
            });
        }

        if(groupIds == "" || groupIds){
            const newAccount = new AddressBookModel({
                createdById: user._id,
                userWalletAddress: userWalletAddress,
                name: name, 
                email: email,
                walletAddress: walletAddress,
                description: description,
                classificationIds:[]
            })
    
            const savedAccount = await newAccount.save()
            if(savedAccount)
                return res.json({
                    success: true,
                    data: savedAccount!.toObject(),
                });
            
        }else{
            const newAccount = new AddressBookModel({
                createdById: user._id,
                userWalletAddress: userWalletAddress,
                email: email,
                name: name, 
                walletAddress: walletAddress,
                description: description,
                classificationIds:[]
            })
            console.log("alsdgkjalskj", groupIds.split(','))
            for(let i = 0 ; i < groupIds.split(',').length; i++){
                const group = await AddressGroupModel.findById(groupIds.split(',')[i])
                if(group)
                    newAccount.classificationIds.push(groupIds.split(',')[i])
                else    
                    return res.status(409).json({
                        success: false,
                        error: {
                            message: 'None exist group ID',
                        },
                    });
            }
            
            const savedAccount = await newAccount.save()
            if(savedAccount)
                return res.json({
                    success: true,
                    data: savedAccount!.toObject(),
                });
        }

    }catch(e){
        console.log(e)
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
    
};
