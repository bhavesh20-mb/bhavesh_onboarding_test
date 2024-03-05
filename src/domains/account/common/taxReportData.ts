import TaxReportReqModel from 'src/database/models/taxreport/taxreportreq.model';

export interface IResponseData {
    status: boolean,
    reason: string,
}

export const checkActiveTicket = async (walletAddress: string): Promise<IResponseData> => {
    let responseData: IResponseData = {
        status: true,
        reason: "",
    }
    try {

        const tickets = await TaxReportReqModel.find({ address: walletAddress.toString().toLowerCase(), status: "I" }, { __v: 0 });
        if (tickets.length > 0) {
            responseData.status = false;
            responseData.reason = "TaxReport - Ongoing ticket exist";
        }
        return responseData;
    } catch (e) {
        responseData.status = false;
        responseData.reason = "Something went wrong...";
        return responseData;
    }
};