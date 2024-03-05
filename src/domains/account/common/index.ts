import { FANTOM } from 'src/utils/chain';
import { Request, Response } from 'express';
import { checkSubscriptionData } from './subcriptionData';
import { checkAirdrops, checkProjects, checkStreams, checkStreamsByPayeeAddress } from './multiPayData';
import { checkActiveTicket } from './taxReportData';
import AccountModel from 'src/database/models/account.model';
import UserModel from 'src/database/models/user.model';
import { enmUserStatus } from 'src/interfaces/dbModels';
import { v4 as uuidv4 } from 'uuid';
export interface IResponseData {
    status: boolean;
    reason: string[];
    existed?: boolean;
}
export interface IAccountInfo {
    multiPayInfo?: Array<any>;
    airdropInfo?: Array<any>;
    subscriptionInfo?: Array<any>;
}

export interface IResponseDetail {
    status: boolean,
    reason: string,
}

let responseData: IResponseData = {
    status: true,
    reason: [],
}

let status: boolean;
let res: IResponseDetail;
let isExistPayer: boolean = true;
let isExistPayee: boolean = true;
let isExistTaxUser: boolean = true;


const getMultiPayData = async (walletAddress: string) => {
    let multiPayStatus = true;

    // Check payer
    const user = await UserModel.findOne({
        walletAddress: walletAddress,
    });

    if (user && user.status === enmUserStatus.Active) {
        isExistPayer = true;
        let id = user._id.toString();
        // Check Project
        res = await checkProjects(id);
        multiPayStatus = multiPayStatus && res.status;
        // Check Stream
        res = await checkStreams(id);
        multiPayStatus = multiPayStatus && res.status;
        // Check Airdrop
        res = await checkAirdrops(id);
        multiPayStatus = multiPayStatus && res.status;
        // Check Subscription
        res = await checkSubscriptionData(walletAddress, FANTOM.id, true);
        multiPayStatus = multiPayStatus && res.status;
    } else {
        isExistPayer = false;
    }

    return multiPayStatus;
}

const getTaxReportData = async (walletAddress: string) => {
    let taxReportStatus = true;
    // Check user
    const user = await UserModel.findOne({
        walletAddress: walletAddress
    });

    if (user && user.status === enmUserStatus.Active) {
        isExistTaxUser = true;
        // Check ongoing tax report
        res = await checkActiveTicket(walletAddress);
        taxReportStatus = taxReportStatus && res.status;
        // Check Subscription
        res = await checkSubscriptionData(walletAddress, FANTOM.id, false);
        taxReportStatus = taxReportStatus && res.status;
    } else {
        isExistTaxUser = false;
    }

    return taxReportStatus;
}

export const fetchAccountInfo = async (walletAddress: string) => {
    const multiPayStatus = await getMultiPayData(walletAddress);
    const taxReportStatus = await getTaxReportData(walletAddress);
    const userExist = !isExistPayer && !isExistPayee && !isExistTaxUser;
    status = multiPayStatus && taxReportStatus;
    !multiPayStatus && responseData.reason.push("Multipay");
    !taxReportStatus && responseData.reason.push("TaxReport");
    if (userExist) {
        status = false;
        responseData.reason.push("User not found");
        responseData.existed = false;
    } else {
        responseData.existed = true;
    }
};

export const canDisable = async (req: Request, res: Response) => {
    // Initialize
    responseData = {
        status: true,
        reason: [],
        existed: false,
    }

    try {
        const walletAddress = req.params.walletAddress.toLocaleLowerCase();
        await fetchAccountInfo(walletAddress);

        responseData.status = status;
        return res.json({
            responseData
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
}

export const checkAccountStatus = async (walletAddress: string): Promise<IResponseData> => {
    // Initialize
    responseData = {
        status: true,
        reason: [],
    }
    try {
        await fetchAccountInfo(walletAddress);
        responseData.status = status;

    } catch (e) {
        responseData.status = false;
        responseData.reason = ["Something went wrong..."];
    }

    return responseData;
}

export const getStatus = async (req: Request, res: Response) => {
    const getMessage = (status: number) => {
        switch (status) {
            case 0:
                return "Active User";
            case 1:
                return "Temporally Disabled";
            case 2:
                return "Permanently Disabled";
        }
    }
    try {
        const walletAddress = req.params.walletAddress.toLocaleLowerCase();
        let user = await AccountModel.findOne({
            walletAddress: walletAddress,
        });

        if (!user) {
            const newAccount = await AccountModel.create({
                walletAddress: walletAddress,
                nonce: uuidv4(),
            })
            return res.json({ status: newAccount.status, message: getMessage(0) });
        } else {
            const status = user.status;
            return res.json({ status: status, message: getMessage(status!) });
        }
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;
        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
}
