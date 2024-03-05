import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AccountModel from 'src/database/models/account.model';
import { GetAccountResponseType, JsonResponseType } from '../types';

type IApiHandler<T extends Request, Q extends Response> = (req: T, res: Q) => Promise<unknown> | unknown;

export const getAccount: IApiHandler<
    Request<{ walletAddress: string }>,
    Response<JsonResponseType<GetAccountResponseType>>
> = async (req, res) => {
    try {
        const account = await AccountModel.aggregate([
            {
                $match: {
                    walletAddress: req.params.walletAddress,
                },
            },
            { $limit: 1 },
        ]);

        if (!account.length) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Account not found',
                },
            });
        }

        return res.json({
            success: true,
            data: account[0],
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};