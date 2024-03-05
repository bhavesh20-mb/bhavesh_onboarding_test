import { Request, Response } from 'express';
import { IUserModel } from 'src/interfaces/dbModels';
import {
    IDashboardGainDataModel,
    IDecodedTxModel,
    ITaxAssetModel,
    ITaxReporterModel,
    ITaxReportResModel,
    ITaxWalletModel,
} from 'src/interfaces/taxreportModels';

export type IApiHandler<T extends Request, Q extends Response> = (req: T, res: Q) => Promise<unknown> | unknown;

export type SuccessJsonResponseType<T = Record<string, any>> = {
    success: true;
    data: T;
};

export type FailJsonResponseType<T = { message: string }> = {
    success: false;
    error: T;
};

export type JsonResponseType<T = Record<string, any>, Q = { message: string }> =
    | SuccessJsonResponseType<T>
    | FailJsonResponseType<Q>;

// Auth
export type SignType = 'signin' | 'signup';
export type GetNonceResponseType = { nonce: string; messageToSign: string };

export type SignInRequestType = { signature: string };
export type SignInResponseType = { token: string; user: IUserModel };

export type SignUpRequestType = { name: string; email: string; signature: string };
export type SignUpResponseType = { token: string; user: IUserModel };

// History

export type GetWalletHistoriesResponseType = IDecodedTxModel[];

// User

export type GetUserInfoResponseType = IUserModel[];

export type UpdateUserInfoResponseType = { message: string };

// Ticket

export type CreateTicketResponseType = { message: string };

export type GetTicketsResponseType = ITaxReportResModel[];

export type DeleteTicketsResponseType = { message: string };

// Wallet

export type GetWalletResponseType = ITaxWalletModel | null;
export type GetWalletsResponseType = ITaxWalletModel[];
export type GetWalletListResponseType = ITaxReporterModel[];

export type CreateWalletResponseType = { message: string };

export type DeleteWalletResponseType = { message: string };

export type UpdateWalletResponseType = { message: string };

// Token

export type GetTokensResponseType = ITaxAssetModel[];

// Gain

export type GetDashboardGainDataResponseType = IDashboardGainDataModel[];
