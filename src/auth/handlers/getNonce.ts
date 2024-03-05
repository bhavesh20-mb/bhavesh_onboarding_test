import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UserModel from 'src/database/models/user.model';
import { enmUserStatus } from 'src/interfaces/dbModels';
import { GetNonceResponseType, IApiHandler, JsonResponseType, SignType } from '../types/api';
import { getMessageForSignIn, getMessageForSignUp } from '../utils/messages';

export const getNonce: IApiHandler<
    Request<{ walletAddress: string; signType: SignType }>,
    Response<JsonResponseType<GetNonceResponseType>>
> = async (req, res) => {
    const { walletAddress, signType } = req.params;

    try {
        const user = await UserModel.findOne({
            walletAddress: walletAddress,
        });

        let nonce: string;

        if (!user) {
            if (signType === 'signup') {
                nonce = uuidv4();

                await UserModel.create({ walletAddress, nonce });
            } else {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Please sign up',
                    },
                });
            }
        } else {
            if (req.params.signType === 'signup' && user.status === enmUserStatus.Active) {
                return res.status(409).json({
                    success: false,
                    error: {
                        message: 'User already exists',
                    },
                });
            }

            if (req.params.signType !== 'signup' && user.status === enmUserStatus.Unverified) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Please sign up',
                    },
                });
            }

            nonce = user.nonce;
        }

        return res.json({
            success: true,
            data: {
                nonce: nonce,
                messageToSign:
                    signType !== 'signup'
                        ? getMessageForSignIn(walletAddress, nonce)
                        : getMessageForSignUp(walletAddress, nonce),
            },
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
