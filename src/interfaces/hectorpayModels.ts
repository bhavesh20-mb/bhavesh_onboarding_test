import mongoose from 'mongoose';
import { AccountStatus } from './dbModels';

export interface IPayerModel {
    walletAddress: string;
    name?: string;
    email?: string;
    nonce: string;
    verified: boolean;
    status?: AccountStatus;
}

export interface IRecipientModel {
    walletAddress: string;
    email?: string;
    name: string;
    description?: string;
    classificationIds: mongoose.Schema.Types.ObjectId[];
    createdById: mongoose.Schema.Types.ObjectId;
}

export interface IClassificationModel {
    label: string;
    color: string;
    description?: string;
    createdById: mongoose.Schema.Types.ObjectId;
}

export interface IProjectModel {
    title: string;
    description?: string;
    chainId: number;
    createdById: mongoose.Schema.Types.ObjectId;
}

export interface IStreamModel {
    recipientId: mongoose.Schema.Types.ObjectId;
    tokenAddress: string;
    chainId: number;
    onchainStreamId?: string;
    amountInUnit: number;
    unitOfAmount: 'hour' | 'day' | 'week' | 'month' | 'year';
    periodInUnit: number;
    startAt: Date;
    unitOfPeriod: 'day' | 'week' | 'month' | 'year' | 'infinite';
    description?: string;
    projectId: mongoose.Schema.Types.ObjectId;
    createdById: mongoose.Schema.Types.ObjectId;
}

export interface IAirdropModel {
    tokenAddress: string;
    tokenType: 'erc20' | 'erc721';
    chainId: number;
    onchainAirdropId?: string;
    amount: number;
    releaseAt: Date;
    title: string;
    description?: string;
    recipientIds: mongoose.Schema.Types.ObjectId[];
    createdById: mongoose.Schema.Types.ObjectId;
}