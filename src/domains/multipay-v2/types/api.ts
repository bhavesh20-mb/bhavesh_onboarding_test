import { Request, Response } from 'express';
import { IUserModel } from 'src/interfaces/dbModels';
import { IClassificationModel, IRecipientModel } from 'src/interfaces/hectorpayModels';
import { IProjectV2Model, IStreamV2Model } from 'src/interfaces/multipayV2Models';

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

// Project
export type CreateProjectRequestType = Omit<IProjectV2Model, 'createdById'>;
export type CreateProjectResponseType = IProjectV2Model;

export type DeleteProjectResponseType = IProjectV2Model | null;

export type GetProjectResponseType = IProjectV2Model | null;

export type GetProjectsQueryParamsType = Partial<{ keyword: string; chainId: string }>;
export type GetProjectsResponseType = IProjectV2Model[];

export type UpdateProjectRequestType = Partial<Omit<IProjectV2Model, 'createdById'>>;
export type UpdateProjectResponseType = IProjectV2Model;

// Stream
export type CreateStreamRequestType = Omit<IStreamV2Model, 'createdById'>;
export type CreateStreamResponseType = IStreamV2Model;

export type DeleteStreamResponseType = IStreamV2Model | null;

export type GetStreamResponseType = IStreamV2Model & {
    recipient: IRecipientModel;
    project: IProjectV2Model;
    classifications: IClassificationModel[];
};

export type GetStreamsByPayeeAddressQueryParamsType = Partial<{ projectId: string; chainId: string }>;
export type GetPayeeStreamsResponseType = (IStreamV2Model & {
    recipient: IRecipientModel;
    project: IProjectV2Model;
    classifications: IClassificationModel[];
    payer: IUserModel;
})[];

export type GetStreamsResponseType = (IStreamV2Model & {
    recipient: IRecipientModel;
    project: IProjectV2Model;
    classifications: IClassificationModel[];
})[];

export type UpdateStreamRequestType = Partial<Omit<IStreamV2Model, 'createdById'>>;
export type UpdateStreamResponseType = IStreamV2Model;
