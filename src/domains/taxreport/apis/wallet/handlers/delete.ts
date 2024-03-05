import { Request, Response } from 'express';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { DeleteWalletResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';

export const deleteWallet: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteWalletResponseType>>
> = async (req, res) => {
    try {
        try {
            await TaxReporterModel.findOneAndDelete({
                _id: req.params.id,
            }).then((response) => {
                return res.json({
                    success: true,
                    data: { message: 'Wallet deleted successfully' },
                });
            });
        } catch (error: any) {
            return res.status(400).json({
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
