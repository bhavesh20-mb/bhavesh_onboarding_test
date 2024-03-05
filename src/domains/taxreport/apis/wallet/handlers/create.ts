import { Request, Response } from 'express';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { CreateWalletResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';

interface reqInfo {
    email?: string;
    type: number;
    address: string;
    wallet_address: string;
    wallet_name: string;
    wallet_type: string;
    chain_ids?: string[];
    api_key?: string;
    security_key?: string;
}

const isVaild = (data: reqInfo) => {
    if (!data.wallet_address || data.type === undefined || !data.address || !data.wallet_name || !data.wallet_type) {
        return false;
    }
    return true;
};

export const createWallet: IApiHandler<Request<{}>, Response<JsonResponseType<CreateWalletResponseType>>> = async (
    req,
    res,
) => {
    try {
        const inputData = req.body;
        if (!isVaild(inputData)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Wrong input data...' },
            });
        }

        const dataToInsert = [
            {
                email: inputData.email ? inputData.email : '',
                address: inputData.address.toLowerCase(),
                wallet_address: inputData.wallet_address.toLowerCase(),
                wallet_name: inputData.wallet_name,
                user_type: inputData.type,
                wallet_type: inputData.wallet_type,
                chain_ids: inputData.chain_ids ?? [],
                api_key: inputData.api_key ?? '',
                security_key: inputData.security_key ?? '',
                passphrase: inputData.passphrase ?? '',
                timestamp: Math.floor(new Date().getTime() / 1000),
            },
        ];

        try {
            await TaxReporterModel.insertMany(dataToInsert).then((response) => {
                return res.json({
                    success: true,
                    data: { message: 'New wallet address added successfully' },
                });
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: { message: error.message },
            });
        }
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            error: { message: e.message },
        });
    }
};
