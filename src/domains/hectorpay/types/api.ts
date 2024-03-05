import { Request, Response } from 'express';
import { IUserModel } from 'src/interfaces/dbModels';
import {
    IAirdropModel,
    IClassificationModel,
    IProjectModel,
    IRecipientModel,
    IStreamModel,
} from 'src/interfaces/hectorpayModels';

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

// Classification
export type CreateClassificationRequestType = {
    classification: Omit<IClassificationModel, 'createdById'>;
    userIds: string[];
};
export type CreateClassificationResponseType = IClassificationModel;

export type DeleteClassificationResponseType = IClassificationModel | null;

export type GetClassificationResponseType = IClassificationModel | null;
export type GetClassificationsResponseType = IClassificationModel[];

export type UpdateClassificationRequestType = {
    dataToUpdate: Partial<Omit<IClassificationModel, 'createdById'>>;
    userIdsToAdd: string[];
    userIdsToRemove: string[];
};
export type UpdateClassificationResponseType = IClassificationModel;

// Recipient
export type CreateRecipientRequestType = Omit<IRecipientModel, 'createdById'>;
export type CreateRecipientResponseType = IRecipientModel;

export type DeleteRecipientResponseType = IRecipientModel | null;

export type GetRecipientResponseType = IRecipientModel;

export type GetRecipientsQueryParamsType = Partial<{ keyword: string; classifications: string[] }>;
export type GetRecipientsResponseType = IRecipientModel[];

export type UpdateRecipientRequestType = Partial<Omit<IRecipientModel, 'createdById'>>;
export type UpdateRecipientResponseType = IRecipientModel;

// Project
export type CreateProjectRequestType = Omit<IProjectModel, 'createdById'>;
export type CreateProjectResponseType = IProjectModel;

export type DeleteProjectResponseType = IProjectModel | null;

export type GetProjectResponseType = IProjectModel | null;

export type GetProjectsQueryParamsType = Partial<{ keyword: string; chainId: string }>;
export type GetProjectsResponseType = IProjectModel[];

export type UpdateProjectRequestType = Partial<Omit<IProjectModel, 'createdById'>>;
export type UpdateProjectResponseType = IProjectModel;

// Stream
export type CreateStreamRequestType = Omit<IStreamModel, 'createdById'>;
export type CreateStreamResponseType = IStreamModel;

export type DeleteStreamResponseType = IStreamModel | null;

export type GetStreamResponseType = IStreamModel & {
    recipient: IRecipientModel;
    project: IProjectModel;
    classifications: IClassificationModel[];
};

export type GetStreamsByPayeeAddressQueryParamsType = Partial<{ projectId: string; chainId: string }>;
export type GetPayeeStreamsResponseType = (IStreamModel & {
    recipient: IRecipientModel;
    project: IProjectModel;
    classifications: IClassificationModel[];
    payer: IUserModel;
})[];

export type GetStreamsResponseType = (IStreamModel & {
    recipient: IRecipientModel;
    project: IProjectModel;
    classifications: IClassificationModel[];
})[];

export type UpdateStreamRequestType = Partial<Omit<IStreamModel, 'createdById'>>;
export type UpdateStreamResponseType = IStreamModel;

// Stream
export type CreateAirdropRequestType = Omit<IAirdropModel, 'createdById'>;
export type CreateAirdropResponseType = IAirdropModel;

export type DeleteAirdropResponseType = IAirdropModel | null;

export type GetAirdropResponseType = IAirdropModel;
export type GetAirdropsResponseType = IAirdropModel[];