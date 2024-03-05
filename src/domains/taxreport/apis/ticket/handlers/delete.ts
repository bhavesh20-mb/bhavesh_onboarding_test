import { Request, Response } from 'express';
import TaxReportReqModel from 'src/database/models/taxreport/taxreportreq.model';
import { DeleteTicketsResponseType, IApiHandler, JsonResponseType } from 'src/domains/taxreport/types/api';

export const deleteTickets: IApiHandler<Request<{}>, Response<JsonResponseType<DeleteTicketsResponseType>>> = async (
    req,
    res,
) => {
    try {
        try {
            await TaxReportReqModel.deleteMany({
                _id: { $in: req.body.ids },
            }).then((response) => {
                return res.json({
                    success: true,
                    data: { message: 'Tickets deleted successfully' },
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
