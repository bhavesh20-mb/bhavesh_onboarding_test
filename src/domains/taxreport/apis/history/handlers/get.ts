import { Request, Response } from 'express';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { GetWalletHistoriesResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';
import { IDecodedTxModel } from 'src/interfaces/taxreportModels';

export const getWalletHistories: IApiHandler<
    Request<{ address: string; wallet_address?: string }>,
    Response<JsonResponseType<GetWalletHistoriesResponseType>>
> = async (req, res) => {
    try {
        const params = req.query;
        if (params && params.address) {
            const respData: IDecodedTxModel[] = [];

            if (params.wallet_address) {
                const currentWallet = await TaxReporterModel.find(
                    {
                        address: params.address.toString().toLowerCase(),
                        wallet_address: params.wallet_address.toString().toLowerCase(),
                    },
                    { _id: 0, __v: 0 },
                );
                const docs = await DecodedTxModel.find(
                    { address: params.wallet_address.toString().toLowerCase() },
                    { _id: 0, __v: 0 },
                );

                let result = docs;

                if (currentWallet.length > 0 && currentWallet[0].user_type === 0) {
                    result = docs.filter((item) => currentWallet[0].chain_ids?.includes(item.chain_id));
                }

                return res.json({
                    success: true,
                    data: result,
                });
            } else {
                const docs = await TaxReporterModel.find(
                    { address: params.address.toString().toLowerCase() },
                    { __v: 0 },
                );

                if (docs.length > 0) {
                    for (let i = 0; i < docs.length; i++) {
                        const txns = await DecodedTxModel.find(
                            { address: docs[i].wallet_address.toString().toLowerCase() },
                            { _id: 0, __v: 0 },
                        );

                        let result = txns;

                        if (docs[i].user_type === 0) {
                            result = txns.filter((item) => docs[i].chain_ids?.includes(item.chain_id));
                        }

                        respData.push(...(result as IDecodedTxModel[]));
                    }
                }

                return res.json({
                    success: true,
                    data: respData,
                });
            }
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
