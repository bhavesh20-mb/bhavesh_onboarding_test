import { ethers } from 'ethers';
import { Request, Response } from 'express';
import { IApiHandler, JsonResponseType, SignUpRequestType, SignUpResponseType } from '../types/api';
import UserModel from 'src/database/models/user.model';
import { enmUserStatus } from 'src/interfaces/dbModels';
import { getMessageForSignUp } from '../utils/messages';
import { generateJWT } from '../utils/generateJWT';

export const signUp: IApiHandler<
    Request<{ walletAddress: string }, {}, SignUpRequestType>,
    Response<JsonResponseType<SignUpResponseType>>
> = async (req, res) => {
    try {
        const user = await UserModel.findOne({
            walletAddress: req.params.walletAddress,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid signature - nonce does not exist',
                },
            });
        }

        if (user.status !== enmUserStatus.Unverified) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'User already exists',
                },
            });
        }

        const addressSigned = ethers.utils.verifyMessage(
            getMessageForSignUp(req.params.walletAddress, user.nonce),
            req.body.signature,
        );

        if (addressSigned.toLowerCase() !== req.params.walletAddress.toLowerCase()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Different address detected',
                },
            });
        }

        const { name, email } = req.body;

        user.name = name;
        user.email = email;
        user.status = enmUserStatus.Active;

        await user.save();

        return res.json({
            success: true,
            data: {
                user: user.toObject(),
                token: generateJWT({ _id: user._id.toString(), walletAddress: user.walletAddress }),
            },
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
