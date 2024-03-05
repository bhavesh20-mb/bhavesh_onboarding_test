import { Request, Response } from 'express';
import UserModel from 'src/database/models/user.model';
import { GetUserInfoResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';

export const getUserInfo: IApiHandler<
    Request<{ address: string }>,
    Response<JsonResponseType<GetUserInfoResponseType>>
> = async (req, res) => {
    try {
        const params = req.query;
        if (params && params.address) {
            const docs = await UserModel.find({ walletAddress: params.address.toString() }, { __v: 0 });
            return res.json({
                success: true,
                data: docs,
            });
        } else {
            return res.json({
                success: true,
                data: [],
            });
        }
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
