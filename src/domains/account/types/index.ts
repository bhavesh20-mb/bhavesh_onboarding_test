import { IAccountModel } from "src/interfaces/dbModels";

export type IApiHandler<T extends Request, Q extends Response> = (req: T, res: Q) => Promise<unknown> | unknown;

export enum SignType {
    create = 'create',
    disable = 'disable',
    active = 'active',
}

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

export type SignUpRequestType = { name: string; email: string; signature: string; };
export type SignUpResponseType = { user: IAccountModel };

export type DeleteAccountResponseType = IAccountModel | null;

export type GetAccountResponseType = IAccountModel | null;

export type UpdateAccountRequestType = Partial<Omit<IAccountModel, 'walletAddress'>>;;
export type UpdateAccountResponseType = IAccountModel;

export type SendEmailRequestType = { trigger: string, content: string, title: string };

// Auth
export type GetNonceResponseType = { nonce: string; messageToSign: string };