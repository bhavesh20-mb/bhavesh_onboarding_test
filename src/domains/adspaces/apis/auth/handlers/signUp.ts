import { ethers } from 'ethers';
import { Request, Response } from 'express';
import AdSpacesUserModel from 'src/database/models/adspaces/user.model';
import { IApiHandler, JsonResponseType, SignUpRequestType, SignUpResponseType } from 'src/domains/adspaces/types/api';
import { getMessageForSignUp } from 'src/domains/adspaces/utils';
import { generateJWT } from 'src/domains/adspaces/apis/auth/utils/generateJWT';

export const signUp: IApiHandler<
    Request<{ walletAddress: string }, {}, SignUpRequestType>,
    Response<JsonResponseType<SignUpResponseType>>
> = async (req, res) => {
    try {
        const user = await AdSpacesUserModel.findOne({
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

        if (user.verified) {
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

        user.verified = true;

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
                user: userInfo,
                token: generateJWT({ _id: user._id.toString(), walletAddress: user.walletAddress }),
            },
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
