import { Request, Response } from 'express';
import AddressBookModel from 'src/database/models/addressbook.model';
import UserModel from 'src/database/models/user.model';


export const getBook = async (req: Request, res: Response) => {
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
        const accounts = await AddressBookModel.find({createdById: user._id}, { _id: 0 , __v: 0})
        if(accounts.length == 0) 
            res.json({
                message:"No address"
            })
        else res.json(accounts)
    }catch(e){
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    } 
}