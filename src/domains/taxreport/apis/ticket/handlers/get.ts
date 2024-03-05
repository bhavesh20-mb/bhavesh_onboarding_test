import { Request, Response } from 'express';
import DecodedTxModel from 'src/database/models/taxreport/decodedtx.model';
import TaxReportReqModel from 'src/database/models/taxreport/taxreportreq.model';
import {
    GetTicketsResponseType,
    GetWalletHistoriesResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/taxreport/types/api';
import { ITaxReportResModel } from 'src/interfaces/taxreportModels';

export const getTickets: IApiHandler<
    Request<{ address: string }>,
    Response<JsonResponseType<GetTicketsResponseType>>
> = async (req, res) => {
    try {
        const params = req.query;
        if (params && params.address) {
            const docs = await TaxReportReqModel.find({ address: params.address.toString().toLowerCase() }, { __v: 0 });
            const result: ITaxReportResModel[] = [];
            for (let i = 0; i < docs.length; i++) {
                const txns = await DecodedTxModel.find(
                    { address: docs[i].walletAddress.toString().toLowerCase() },
                    { _id: 0, __v: 0 },
                );
                result.push({
                    userId: docs[i].userId,
                    start: docs[i].start,
                    end: docs[i].end,
                    chainIds: docs[i].chainIds,
                    walletAddress: docs[i].walletAddress,
                    address: params.address.toString().toLowerCase(),
                    createdOn: docs[i].createdOn,
                    status: docs[i].status,
                    completedBy: docs[i].completedBy,
                    txns: txns,
                    _id: docs[i]._id.toString(),
                    enableEmail: docs[i].enableEmail,
                    enablePush: docs[i].enablePush,
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
