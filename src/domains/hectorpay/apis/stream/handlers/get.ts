import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import StreamModel from 'src/database/models/hectorpay/stream.model';
import {
    GetPayeeStreamsResponseType,
    GetStreamResponseType,
    GetStreamsByPayeeAddressQueryParamsType,
    GetStreamsResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const getStream: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<GetStreamResponseType>>
> = async (req, res) => {
    try {
        const stream = await StreamModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.id),
                    createdById: req.user!._id,
                },
            },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'hectorpay_recipients',
                    localField: 'recipientId',
                    foreignField: '_id',
                    as: 'recipient',
                },
            },
            {
                $unwind: '$recipient',
            },
            {
                $lookup: {
                    from: 'hectorpay_projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            {
                $unwind: '$project',
            },
        ]);

        if (!stream.length) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Stream not found',
                },
            });
        }

        return res.json({
            success: true,
            data: stream[0],
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getStreams: IApiHandler<
    Request<{}, {}, {}, Partial<{ projectId: string }>>,
    Response<JsonResponseType<GetStreamsResponseType>>
> = async (req, res) => {
    try {
        const findQuery = StreamModel.aggregate([
            {
                $match: {
                    ...{
                        createdById: req.user!._id,
                    },
                    ...(req.query.projectId ? { projectId: new mongoose.Types.ObjectId(req.query.projectId) } : {}),
                },
            },
            {
                $lookup: {
                    from: 'hectorpay_recipients',
                    localField: 'recipientId',
                    foreignField: '_id',
                    as: 'recipient',
                },
            },
            {
                $unwind: '$recipient',
            },
            {
                $lookup: {
                    from: 'hectorpay_projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            {
                $unwind: '$project',
            },
        ]);

        const streams = await findQuery.exec();

        return res.json({
            success: true,
            data: streams,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getStreamsByPayeeAddress: IApiHandler<
    Request<{ walletAddress: string }, {}, {}, Partial<GetStreamsByPayeeAddressQueryParamsType>>,
    Response<JsonResponseType<GetPayeeStreamsResponseType>>
> = async (req, res) => {
    try {
        const pipelineStage: PipelineStage[] = [];

        if (req.query.chainId) {
            pipelineStage.push({
                $match: {
                    chainId: parseInt(req.query.chainId),
                },
            });
        }

        if (req.query.projectId) {
            pipelineStage.push({
                $match: {
                    projectId: new mongoose.Types.ObjectId(req.query.projectId),
                },
            });
        }

        pipelineStage.push(
            ...[
                {
                    $lookup: {
                        from: 'hectorpay_recipients',
                        localField: 'recipientId',
                        foreignField: '_id',
                        pipeline: [{ $project: { walletAddress: 1, _id: 0 } }],
                        as: 'recipient',
                    },
                },
                {
                    $unwind: '$recipient',
                },
                {
                    $match: {
                        'recipient.walletAddress': req.params.walletAddress,
                    },
                },
                {
                    $lookup: {
                        from: 'hectorpay_projects',
                        localField: 'projectId',
                        foreignField: '_id',
                        as: 'project',
                    },
                },
                {
                    $unwind: '$project',
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdById',
                        foreignField: '_id',
                        pipeline: [{ $project: { walletAddress: 1, _id: 0 } }],
                        as: 'payer',
                    },
                },
                {
                    $unwind: '$payer',
                },
            ],
        );

        const findQuery = StreamModel.aggregate(pipelineStage);

        const streams = await findQuery.exec();

        return res.json({
            success: true,
            data: streams,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
