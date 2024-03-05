import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AccountModel from 'src/database/models/account.model';
import { GetNonceResponseType, JsonResponseType, SignType } from '../types';
import { getMessageForActiveAccount, getMessageForCreateAccount, getMessageForDisableAccount } from '../utils';

type IApiHandler<T extends Request, Q extends Response> = (req: T, res: Q) => Promise<unknown> | unknown;

export const getNonce: IApiHandler<
    Request<{ walletAddress: string; signType: SignType }>,
    Response<JsonResponseType<GetNonceResponseType>>
> = async (req, res) => {
    const { walletAddress, signType } = req.params;

    try {
        const account = await AccountModel.findOne({
            walletAddress: walletAddress,
        });

        let nonce: string;

        if (!account) {
            nonce = uuidv4();
            await AccountModel.create({ walletAddress, nonce });
        } else {
            nonce = account.nonce;
        }

        return res.json({
            success: true,
            data: {
                nonce: nonce,
                messageToSign:
                    signType === SignType.create
                        ? getMessageForCreateAccount(walletAddress, nonce)
                        : signType === SignType.disable
                            ? getMessageForDisableAccount(walletAddress, nonce)
                            : getMessageForActiveAccount(walletAddress, nonce)

            },
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
