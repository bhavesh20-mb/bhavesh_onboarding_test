import { Request, Response } from 'express';
import { IUserModel } from 'src/interfaces/dbModels';

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
