import Decimal from 'decimal.js';
import { Request, Response } from 'express';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { GetDashboardGainDataResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';
import { getTxnGainWithPeriod } from 'src/domains/taxreport/utils';
import { IDashboardGainDataModel, IDecodedTxModel } from 'src/interfaces/taxreportModels';

export const getDashboardGainData: IApiHandler<
    Request<{ address: string; year?: string }>,
    Response<JsonResponseType<GetDashboardGainDataResponseType>>
> = async (req, res) => {
    try {
        const params = req.query;
        if (params && params.address) {
            const wallets = await TaxReporterModel.find(
                { address: params.address.toString().toLowerCase() },
                { __v: 0 },
            );
            const result: IDashboardGainDataModel[] = [];
            const respData: IDecodedTxModel[] = [];

            if (wallets.length > 0) {
                for (let i = 0; i < wallets.length; i++) {
                    const txns = await DecodedTxModel.find(
                        { address: wallets[i].wallet_address.toString().toLowerCase() },
                        { _id: 0, __v: 0 },
                    );
                    const result = txns.filter((item) => wallets[i].chain_ids?.includes(item.chain_id));
                    respData.push(...(result as IDecodedTxModel[]));
                }
            }
            const txnData = respData
                .sort((a, b) => b.timestamp - a.timestamp)
                .filter((item) => item.txtype !== 'Transact');

            result.push(getGainPortfolio(txnData, 86400 * 90, '3 months'));
            result.push(getGainPortfolio(txnData, 86400 * 180, '6 months'));
            result.push(getGainPortfolio(txnData, 86400 * 365, '1 year'));

            return res.json({
                success: true,
                data: result,
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

const getGainPortfolio = (txnData: IDecodedTxModel[], period: number, label: string) => {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    const txnFilteredData = txnData.filter((item) => item.timestamp >= currentTimestamp - period);
    const tokenGainData = getTxnGainWithPeriod(txnFilteredData);
    let gainAmount = new Decimal(0);
    let currentMarketValue = new Decimal(0);

    for (let i = 0; i < tokenGainData.length; i++) {
        const remainTokenAmount = new Decimal(tokenGainData[i].tokenAmount).sub(
            new Decimal(tokenGainData[i].soldTokenAmount),
        );
        gainAmount = gainAmount.add(new Decimal(tokenGainData[i].realGain));
        if (remainTokenAmount.gt(0)) {
            currentMarketValue = currentMarketValue.add(
                new Decimal(tokenGainData[i].lastTokenPrice).mul(remainTokenAmount),
            );
        }
    }

    return {
        period: label,
        gainAmount: gainAmount.toFixed(),
        portfolioAmount: currentMarketValue.add(gainAmount).toFixed(),
    };
};
