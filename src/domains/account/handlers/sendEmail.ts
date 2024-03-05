import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AccountModel from 'src/database/models/account.model';
import { GetAccountResponseType, JsonResponseType, SendEmailRequestType, SuccessJsonResponseType } from '../types';
import { NOVU_EMAIL_APIKEY, NOVU_MULTIPAY_EMAIL_TRIGGER, NOVU_SUBSCRIPTION_MULTIPAY_EMAIL_TRIGGER, NOVU_SUBSCRIPTION_TAXREPORT_EMAIL_TRIGGER } from 'src/constants';
import { Novu } from '@novu/node';
import UserModel from 'src/database/models/user.model';

type IApiHandler<T extends Request, Q extends Response> = (req: T, res: Q) => Promise<unknown> | unknown;

const getQuoteAccount = async (walletAddress: string, trigger: string) => {
    switch (trigger) {
        case NOVU_SUBSCRIPTION_MULTIPAY_EMAIL_TRIGGER:
            return await UserModel.findOne({ walletAddress: walletAddress });
        case NOVU_SUBSCRIPTION_TAXREPORT_EMAIL_TRIGGER:
            return await UserModel.findOne({ walletAddress: walletAddress });
        case NOVU_MULTIPAY_EMAIL_TRIGGER:
            return await UserModel.findOne({ walletAddress: walletAddress });
    }
}

export const sendEmail: IApiHandler<
    Request<{ walletAddress: string }, {}, SendEmailRequestType>,
    Response<JsonResponseType>
> = async (req, res) => {

    try {
        const account = await AccountModel.aggregate([
            {
                $match: {
                    walletAddress: req.params.walletAddress.toLocaleLowerCase(),
                },
            },
            { $limit: 1 },
        ]);

        const quoteAccount = await getQuoteAccount(req.params.walletAddress, req.body.trigger);

        const novuForEmail = new Novu(NOVU_EMAIL_APIKEY);

        let userEmail = account[0].email ? account[0].email : quoteAccount?.email;
        let userFirstName = account[0].name ? account[0].name : quoteAccount?.name;

        if (userEmail) {
            const newEmailSubscriber = await novuForEmail.subscribers.identify(req.params.walletAddress.toLocaleLowerCase(), {});
            const novuResult = await novuForEmail.trigger(req.body.trigger, {
                to: {
                    subscriberId: newEmailSubscriber.data.data.subscriberId,
                    email: userEmail,
                    firstName: userFirstName,
                },
                payload: {
                    userFirstName: userFirstName,
                },
            });
            return res.json({
                success: true,
                data: { message: "Sent Notification Successfully!" },
            });
        } else {
            return res.status(404).json({ success: false, error: { message: 'Account not found' } });
        }

    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};