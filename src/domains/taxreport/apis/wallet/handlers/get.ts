import axios from 'axios';
import Decimal from 'decimal.js';
import { Request, Response } from 'express';
import { start } from 'repl';
import { COVALENT_API_KEY } from 'src/constants/tax';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import {
    GetWalletListResponseType,
    GetWalletResponseType,
    GetWalletsResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/taxreport/types/api';
import { getTxnGainWithPeriod } from 'src/domains/taxreport/utils';
import { ICovalentAssetModel, ITaxWalletModel } from 'src/interfaces/taxreportModels';

interface reqInfo {
    address: string;
    startDate?: string;
    endDate?: string;
    tokens?: string[];
}

export const getWallets: IApiHandler<Request<{}>, Response<JsonResponseType<GetWalletsResponseType>>> = async (
    req,
    res,
) => {
    try {
        // const params = req.query;
        const inputData: reqInfo = { ...req.body };

        if (inputData && inputData.address) {
            const wallets = await TaxReporterModel.find(
                { address: inputData.address.toString().toLowerCase() },
                { __v: 0 },
            );
            const result: ITaxWalletModel[] = [];

            for (let i = 0; i < wallets.length; i++) {
                let txns = await DecodedTxModel.find(
                    { address: wallets[i].wallet_address.toString().toLowerCase() },
                    { _id: 0, __v: 0 },
                );

                if (inputData.startDate && inputData.endDate) {
                    // Year's start date
                    const yearStart = new Date(inputData.startDate.toString());
                    const yearStartTimestamp = Math.floor(yearStart.getTime() / 1000);

                    // Year's end date
                    const yearEnd = new Date(inputData.endDate.toString());
                    const yearEndTimestamp = Math.floor(yearEnd.getTime() / 1000);
                    txns = await DecodedTxModel.find(
                        {
                            address: wallets[i].wallet_address.toString().toLowerCase(),
                            timestamp: { $gte: yearStartTimestamp, $lte: yearEndTimestamp },
                        },
                        { _id: 0, __v: 0 },
                    );
                }

                let txnsResp = txns;
                if (wallets[i].user_type === 0) {
                    txnsResp = txns.filter((item) => wallets[i].chain_ids?.includes(item.chain_id));
                }

                if (inputData.tokens && inputData.tokens.length > 0) {
                    const resp = txnsResp.filter(
                        (item) =>
                            inputData.tokens?.includes(item.symbol) ||
                            inputData.tokens?.includes(item.receive_symbol ?? ''),
                    );
                    txnsResp = resp;
                }

                const sentTxns = txnsResp.filter(
                    (item) => item.txtype === 'Sent' || item.txtype === 'Withdraw' || item.txtype === 'Exchange',
                );
                const receiveTxns = txnsResp.filter(
                    (item) => item.txtype === 'Receive' || item.txtype === 'Deposit' || item.txtype === 'Exchange',
                );
                const txnGainData = getTxnGainWithPeriod(txnsResp.filter((item) => item.txtype !== 'Transact'));

                let totalUnrealGain = new Decimal(0);
                let totalRealGain = new Decimal(0);

                for (let i = 0; i < txnGainData.length; i++) {
                    totalRealGain = totalRealGain.add(new Decimal(txnGainData[i].realGain));
                    const remainTokenAmount = new Decimal(txnGainData[i].tokenAmount).sub(
                        new Decimal(txnGainData[i].soldTokenAmount),
                    );
                    if (remainTokenAmount.gt(0)) {
                        const averageTokenPrice = new Decimal(txnGainData[i].tokenCost).div(
                            new Decimal(txnGainData[i].tokenAmount),
                        );
                        const unrealGain = new Decimal(txnGainData[i].lastTokenPrice)
                            .sub(averageTokenPrice)
                            .mul(remainTokenAmount);
                        txnGainData[i].unrealGain = unrealGain.toFixed();
                        totalUnrealGain = totalUnrealGain.add(unrealGain);
                    }
                }

                result.push({
                    _id: wallets[i]._id.toString(),
                    address: wallets[i].address,
                    email: wallets[i].email,
                    timestamp: wallets[i].timestamp,
                    walletAddress: wallets[i].wallet_address,
                    walletName: wallets[i].wallet_name,
                    walletType: wallets[i].wallet_type,
                    walletKind: wallets[i].user_type,
                    chainIds: wallets[i].chain_ids,
                    apiKey: wallets[i].api_key,
                    securityKey: wallets[i].security_key,
                    txnAmount: txnsResp.length,
                    txnSentCnt: sentTxns.length,
                    txnReceiveCnt: receiveTxns.length,
                    realGain: totalRealGain.toFixed(),
                    unrealGain: totalUnrealGain.toFixed(),
                    txnGainData: txnGainData,
                });
            }
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

export const getWallet: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<GetWalletResponseType>>
> = async (req, res) => {
    try {
        const wallet = await TaxReporterModel.findOne({
            _id: req.params.id,
            address: req.user!.walletAddress.toLowerCase(),
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Wallet not found',
                },
            });
        }

        const txns = await DecodedTxModel.find(
            { address: wallet.wallet_address.toString().toLowerCase() },
            { _id: 0, __v: 0 },
        );

        let txnsResp = txns;
        if (wallet.user_type === 0) {
            txnsResp = txns.filter((item) => wallet.chain_ids?.includes(item.chain_id));
        }

        const sentTxns = txnsResp.filter(
            (item) => item.txtype === 'Sent' || item.txtype === 'Withdraw' || item.txtype === 'Exchange',
        );
        const receiveTxns = txnsResp.filter(
            (item) => item.txtype === 'Receive' || item.txtype === 'Deposit' || item.txtype === 'Exchange',
        );
        const txnGainData = getTxnGainWithPeriod(txnsResp.filter((item) => item.txtype !== 'Transact'));

        let totalUnrealGain = new Decimal(0);
        let totalRealGain = new Decimal(0);

        for (let i = 0; i < txnGainData.length; i++) {
            totalRealGain = totalRealGain.add(new Decimal(txnGainData[i].realGain));
            const remainTokenAmount = new Decimal(txnGainData[i].tokenAmount).sub(
                new Decimal(txnGainData[i].soldTokenAmount),
            );
            if (remainTokenAmount.gt(0)) {
                const averageTokenPrice = new Decimal(txnGainData[i].tokenCost).div(
                    new Decimal(txnGainData[i].tokenAmount),
                );
                const unrealGain = new Decimal(txnGainData[i].lastTokenPrice)
                    .sub(averageTokenPrice)
                    .mul(remainTokenAmount);
                txnGainData[i].unrealGain = unrealGain.toFixed();
                totalUnrealGain = totalUnrealGain.add(unrealGain);
            }
        }

        const result: ITaxWalletModel = {
            _id: wallet._id.toString(),
            address: wallet.address,
            email: wallet.email,
            timestamp: wallet.timestamp,
            walletAddress: wallet.wallet_address,
            walletName: wallet.wallet_name,
            walletType: wallet.wallet_type,
            walletKind: wallet.user_type,
            chainIds: wallet.chain_ids,
            apiKey: wallet.api_key,
            securityKey: wallet.security_key,
            txnAmount: txnsResp.length,
            txnSentCnt: sentTxns.length,
            txnReceiveCnt: receiveTxns.length,
            realGain: totalRealGain.toFixed(),
            unrealGain: totalUnrealGain.toFixed(),
            txnGainData: txnGainData,
        };

        return res.json({
            success: true,
            data: result,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getWalletList: IApiHandler<
    Request<{ address: string }>,
    Response<JsonResponseType<GetWalletListResponseType>>
> = async (req, res) => {
    try {
        const params = req.query;
        if (params && params.address) {
            let wallets = await TaxReporterModel.find({ address: params.address.toString().toLowerCase() }, { __v: 0 });
            return res.json({
                success: true,
                data: wallets,
            });
        } else {
            return res.json({
                success: true,
                data: [],
            });
        }
    } catch (error) {
        // @ts-ignore
        const errorMessage = error.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
