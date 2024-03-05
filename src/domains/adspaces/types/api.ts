import { Request, Response } from 'express';

import { IAdSpacesAdModel, IAdSpacesUserSimpleModel, IAdSpacesCouponModel, IAdSpacesVoucherModel, IAdSpacesAnnouncementModel } from 'src/interfaces/adSpacesModels';

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
export type SignInResponseType = { token: string; user: IAdSpacesUserSimpleModel };
export type SignUpRequestType = { name: string; email: string; signature: string };
export type SignUpResponseType = { token: string; user: IAdSpacesUserSimpleModel };

export type GetAdResponseType = IAdSpacesAdModel;

export type CreateAdRequestType = {
    adInfo: Omit<IAdSpacesAdModel, 'createdById'>;
};
export type CreateAdResponseType = IAdSpacesAdModel;

export type AdSpacesRoleName = 'user' | 'coupons' | 'advertiser' | 'admin' | 'superadmin' | 'master';

// coupons
export type GetCouponsResponseType = IAdSpacesCouponModel;

export type CreateCouponResponseType = IAdSpacesCouponModel;
export type EditCouponResponseType = IAdSpacesCouponModel;

// voucher
export type GetVoucherResponseType = IAdSpacesVoucherModel;

// announcements

export type GetAnnouncementResponseType = IAdSpacesAnnouncementModel;