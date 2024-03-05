import axios from 'axios';
import Decimal from 'decimal.js';
import { Request, Response } from 'express';
import { COVALENT_API_KEY, TokenModel } from 'src/constants/tax';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import TaxReporterModel from 'src/database/models/taxreport/taxreporter.model';
import { GetTokensResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';
import { getTokenLists, getTxnGainWithPeriod } from 'src/domains/taxreport/utils';
import { ICovalentAssetModel, IDecodedTxModel, ITaxAssetModel } from 'src/interfaces/taxreportModels';

interface reqInfo {
    address: string;
    startDate?: string;
    endDate?: string;
    wallets?: string[];
}

export const getTokens: IApiHandler<Request<{}>, Response<JsonResponseType<GetTokensResponseType>>> = async (
    req,
    res,
) => {
    try {
        const inputData: reqInfo = { ...req.body };

        if (inputData && inputData.address) {
            const docs = await TaxReporterModel.find(
                { address: inputData.address.toString().toLowerCase() },
                { __v: 0 },
            );
            const result: ITaxAssetModel[] = [];

            const tokenGainData = await getTxnGain(
                inputData.address.toString(),
                inputData.wallets,
                inputData.startDate?.toString(),
                inputData.endDate?.toString(),
            );

            const filteredDocs =
                inputData.wallets && inputData.wallets.length > 0
                    ? docs.filter((item) => inputData.wallets!.includes(item.wallet_address))
                    : docs;

            if (filteredDocs.length > 0) {
                for (let i = 0; i < filteredDocs.length; i++) {
                    const chainIds = filteredDocs[i].chain_ids?.filter((item) => item !== '0');

                    if (chainIds) {
                        for (let j = 0; j < chainIds.length; j++) {
                            const tokenFetchURL = `https://api.covalenthq.com/v1/${chainIds[j]}/address/${filteredDocs[i].wallet_address}/balances_v2/?key=${COVALENT_API_KEY}`;
                            const resp = await axios.get(tokenFetchURL);

                            if (resp.data.data.items) {
                                const tokenList: ICovalentAssetModel[] = resp.data.data.items.filter(
                                    (item: ICovalentAssetModel) => item.quote > 0,
                                );

                                for (let k = 0; k < tokenList.length; k++) {
                                    let indexToUpdate = result.findIndex(
                                        (obj) =>
                                            obj.tokenAddress.toLowerCase() ===
                                                tokenList[k].contract_address.toLowerCase() &&
                                            chainIds[j] === obj.chainId,
                                    );

                                    let costBasic = new Decimal(0);
                                    let costAmount = new Decimal(0);
                                    let realGain = new Decimal(0);
                                    let unrealGain = new Decimal(0);

                                    let tokenGain = tokenGainData.find(
                                        (item) =>
                                            item.tokenAddress.toLowerCase() ===
                                                tokenList[k].contract_address.toLowerCase() &&
                                            item.walletAddress.toLowerCase() ===
                                                filteredDocs[i].wallet_address.toLowerCase(),
                                    );
                                    if (tokenGain) {
                                        unrealGain = new Decimal(tokenList[k].quote_rate).mul(
                                            new Decimal(tokenList[k].balance),
                                        );
                                        if (new Decimal(tokenGain.tokenAmount).gt(0)) {
                                            unrealGain = new Decimal(tokenList[k].quote_rate)
                                                .sub(
                                                    new Decimal(tokenGain.tokenCost).div(
                                                        new Decimal(tokenGain.tokenAmount),
                                                    ),
                                                )
                                                .mul(new Decimal(tokenList[k].balance));
                                        }
                                        unrealGain = unrealGain.div(new Decimal(10 ** tokenList[k].contract_decimals));
                                        costAmount = new Decimal(tokenGain.tokenAmount);
                                        costBasic = new Decimal(tokenGain.tokenCost);
                                        realGain = new Decimal(tokenGain.realGain);
                                    }

                                    if (indexToUpdate !== -1) {
                                        result[indexToUpdate].quote += tokenList[k].quote;
                                        result[indexToUpdate].balance = new Decimal(result[indexToUpdate].balance)
                                            .add(new Decimal(tokenList[k].balance))
                                            .toString();

                                        let costBasisPrice = new Decimal(0);
                                        if (new Decimal(result[indexToUpdate].costAmount).add(costAmount).gt(0)) {
                                            costBasisPrice = new Decimal(result[indexToUpdate].costBasis)
                                                .add(costBasic)
                                                .div(new Decimal(result[indexToUpdate].costAmount).add(costAmount));
                                        }

                                        result[indexToUpdate].costBasis = new Decimal(result[indexToUpdate].costBasis)
                                            .add(costBasic)
                                            .toFixed();
                                        result[indexToUpdate].costAmount = new Decimal(result[indexToUpdate].costAmount)
                                            .add(costAmount)
                                            .toFixed();
                                        result[indexToUpdate].costBasisPrice = costBasisPrice.toFixed();
                                        result[indexToUpdate].realGain = new Decimal(result[indexToUpdate].realGain)
                                            .add(realGain)
                                            .toFixed();
                                        result[indexToUpdate].unrealGain = new Decimal(result[indexToUpdate].unrealGain)
                                            .add(unrealGain)
                                            .toFixed();
                                    } else {
                                        const tokenItem = getTokenLists(chainIds[j]).find(
                                            (item: TokenModel) => item.symbol === tokenList[k].contract_ticker_symbol,
                                        );

                                        let costBasisPrice = new Decimal(0);
                                        if (costAmount.gt(0)) {
                                            costBasisPrice = costBasic.div(costAmount);
                                        }

                                        result.push({
                                            chainId: chainIds[j],
                                            contractDecimals: tokenList[k].contract_decimals,
                                            contractName: tokenList[k].contract_name,
                                            contractTickerSymbol: tokenList[k].contract_ticker_symbol,
                                            logoUrl: tokenItem ? tokenItem.logo : '',
                                            balance: tokenList[k].balance,
                                            quoteRate: tokenList[k].quote_rate,
                                            quote: tokenList[k].quote,
                                            tokenAddress: tokenList[k].contract_address,
                                            costBasis: costBasic.toFixed(),
                                            costAmount: costAmount.toFixed(),
                                            costBasisPrice: costBasisPrice.toFixed(),
                                            realGain: realGain.toFixed(),
                                            unrealGain: unrealGain.toFixed(),
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
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

const getTxnGain = async (address: string, filteredWallets?: string[], startDate?: string, endDate?: string) => {
    const respData: IDecodedTxModel[] = [];

    const docs = await TaxReporterModel.find({ address: address.toLowerCase() }, { __v: 0 });

    const filteredDocs =
        filteredWallets && filteredWallets.length > 0
            ? docs.filter((item) => filteredWallets.includes(item.wallet_address))
            : docs;

    if (filteredDocs.length > 0) {
        for (let i = 0; i < filteredDocs.length; i++) {
            const txns = await DecodedTxModel.find(
                { address: filteredDocs[i].wallet_address.toString().toLowerCase() },
                { _id: 0, __v: 0 },
            );
            const result = txns.filter((item) => filteredDocs[i].chain_ids?.includes(item.chain_id));
            respData.push(...(result as IDecodedTxModel[]));
        }
    }
    let txnData = respData.sort((a, b) => b.timestamp - a.timestamp).filter((item) => item.txtype !== 'Transact');

    if (startDate && endDate) {
        const startTimestamp = new Date(startDate.toString()).getTime() / 1000;
        const endTimestamp = new Date(endDate.toString()).getTime() / 1000;
        txnData = txnData.filter((item) => item.timestamp >= startTimestamp && item.timestamp <= endTimestamp);
    }

    const tokenGain = getTxnGainWithPeriod(txnData);

    return tokenGain;
};
