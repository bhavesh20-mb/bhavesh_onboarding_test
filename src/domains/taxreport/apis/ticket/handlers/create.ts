import { Request, Response } from 'express';
import TaxReportReqModel from 'src/database/models/taxreport/taxreportreq.model';
import { CreateTicketResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';
import { getCurrentTimeInSecond } from 'src/utils/util';

interface reqInfo {
    start: number;
    end: number;
    chainIds: string[];
    walletAddress: string;
    address: string;
    enableEmail: boolean;
    enablePush: boolean;
}

const isVaild = (data: reqInfo) => {
    if (!data.chainIds || !data.walletAddress || !data.address) {
        return false;
    }
    return true;
};

export const createTicket: IApiHandler<Request<{}>, Response<JsonResponseType<CreateTicketResponseType>>> = async (
    req,
    res,
) => {
    try {
        // get current timestamp
        const currentTime = await getCurrentTimeInSecond();
        const inputData: reqInfo = { ...req.body };

        if (!isVaild(inputData)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Wrong input data...',
                },
            });
        }

        const dataToInsert = [
            {
                start: inputData.start,
                end: inputData.end,
                chainIds: inputData.chainIds,
                walletAddress: inputData.walletAddress.toLowerCase(),
                createdOn: currentTime,
                address: inputData.address.toLowerCase(),
                enableEmail: inputData.enableEmail,
                enablePush: inputData.enablePush,
            },
        ];

        try {
            console.log('Start insert mongo');
            await TaxReportReqModel.insertMany(dataToInsert).then((response) => {
                return res.json({
                    success: true,
                    data: { message: 'Tax report request added successfully' },
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
