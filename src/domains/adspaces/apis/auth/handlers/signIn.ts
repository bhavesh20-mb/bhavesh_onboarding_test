import { ethers } from 'ethers';
import { Request, Response } from 'express';
import AdSpacesUserModel from 'src/database/models/adspaces/user.model';
import { v4 as uuidv4 } from 'uuid';
import { IApiHandler, JsonResponseType, SignInRequestType, SignInResponseType } from 'src/domains/adspaces/types/api';
import { getMessageForSignIn } from '../../../utils';
import { generateJWT } from '../utils/generateJWT';

export const signIn: IApiHandler<
    Request<{ walletAddress: string }, {}, SignInRequestType>,
    Response<JsonResponseType<SignInResponseType>>
> = async (req, res) => {
    try {
        const user = await AdSpacesUserModel.findOne({ walletAddress: req.params.walletAddress });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                },
            });
        }

        const addressSigned = ethers.utils.verifyMessage(
            getMessageForSignIn(req.params.walletAddress, user.nonce),
            req.body.signature,
        );

        if (addressSigned.toLowerCase() === user.walletAddress.toLowerCase()) {
            user.nonce = uuidv4();
            await user.save();
            const userInfo = {
                _id: user._id.toString(),
                walletAddress: user.walletAddress,
                verified: user.verified,
                email: user.email,
                emailVerified: user.emailVerified,
                name: user.name,
                roles: user.roles,
                permissions: user.permissions,
                credit: user.credit,
                totalSpent: user.totalSpent,
            };
            return res.json({
                success: true,
                data: {
                    token: generateJWT({
                        _id: user._id.toString(),
                        walletAddress: user.walletAddress,
                    }),
                    user: userInfo,
                },
            });
        } else {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Different address detected',
                },
            });
        }
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
