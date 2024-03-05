import mongoose from 'mongoose';

export interface IProjectV2Model {
    title: string;
    description?: string;
    chainId: number;
    createdById: mongoose.Schema.Types.ObjectId;
}

export interface IStreamV2Model {
    recipientId: mongoose.Schema.Types.ObjectId;
    tokenAddress: string;
    chainId: number;
    amountInUnit: number;
    unitOfAmount: 'hour' | 'day' | 'week' | 'month' | 'year';
    periodInUnit: number;
    startAt: Date;
    unitOfPeriod: 'day' | 'week' | 'month' | 'year' | 'infinite';
    description?: string;
    projectId: mongoose.Schema.Types.ObjectId;
    createdById: mongoose.Schema.Types.ObjectId;
}
