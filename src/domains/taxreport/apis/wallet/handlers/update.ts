import { Request, Response } from 'express';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { IApiHandler, JsonResponseType, UpdateWalletResponseType } from 'src/domains/taxreport/types/api';

interface reqInfo {
    wallet_name: string;
}

const isVaild = (data: reqInfo) => {
    if (!data.wallet_name) {
        return false;
    }
    return true;
};

export const updateWallet: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<UpdateWalletResponseType>>
> = async (req, res) => {
    try {
        const inputData = req.body;
        if (!isVaild(inputData)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Wrong input data...' },
            });
        }

        try {
            await TaxReporterModel.findOneAndUpdate(
                { _id: req.params.id },
                { wallet_name: inputData.wallet_name, chain_ids: inputData.chain_ids },
            ).then((response) => {
                return res.json({
                    success: true,
                    data: { message: 'Wallet name updated successfully' },
                });
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                error: { message: error.message },
            });
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: { message: 'Something went wrong...' },
        });
    }
};
