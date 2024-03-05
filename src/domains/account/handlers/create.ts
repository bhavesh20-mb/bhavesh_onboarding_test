import { ethers } from 'ethers';
import { Request, Response } from 'express';
import AccountModel from 'src/database/models/account.model';
import { JsonResponseType, SignUpRequestType, SignUpResponseType } from '../types';
import { getMessageForCreateAccount } from '../utils';

type IApiHandler<T extends Request, Q extends Response> = (req: T, res: Q) => Promise<unknown> | unknown;
export const ObjectID = require('mongodb').ObjectID;

export const createAccount: IApiHandler<
    Request<{ walletAddress: string }, {}, SignUpRequestType>,
    Response<JsonResponseType<SignUpResponseType>>
> = async (req, res) => {

    const { signature } = req.body;
    const { walletAddress } = req.params;
    try {

        const account = await AccountModel.findOne({ walletAddress: walletAddress });

        if (!account) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Account not found',
                },
            });
        }

        const addressSigned = ethers.utils.verifyMessage(
            getMessageForCreateAccount(walletAddress, account.nonce),
            signature,
        );

        if (addressSigned.toLowerCase() === walletAddress.toLowerCase()) {

            const updateAccount = await AccountModel.findOneAndUpdate(
                { _id: ObjectID(account._id) },
                req.body,
            );

            if (!updateAccount) {
                return res.status(404).json({ success: false, error: { message: 'Account not found' } });
            }

            const updatedAccount = await AccountModel.findById(account._id);

            return res.json({
                success: true,
                data: updatedAccount!.toObject(),
            });
        } else {
            return res.json({
                success: false,
                error: { message: 'Failed diSecurity signature mismatch detected' },
            });
        }
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
