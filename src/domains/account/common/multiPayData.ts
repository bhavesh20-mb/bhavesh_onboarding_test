import mongoose, { PipelineStage } from 'mongoose';
import AirdropModel from 'src/database/models/hectorpay/airdrop.model';
import ProjectModel from 'src/database/models/hectorpay/project.model';
import StreamModel from 'src/database/models/hectorpay/stream.model';
import { ObjectID } from '../handlers/create';
import { getCurrentTimeInSecond } from 'src/utils/util';

export interface IResponseData {
    status: boolean,
    reason: string,
}

export const checkProjects = async (id: string): Promise<IResponseData> => {
    let responseData: IResponseData = {
        status: true,
        reason: "",
    }
    try {

        const findQuery = ProjectModel.find({ createdById: id });
        const projects = await findQuery.exec();
        if (projects.length > 0) {
            responseData.status = false;
            responseData.reason = "Multipay - Projects exist";
        }

        return responseData;
    } catch (e) {
        responseData.status = false;
        responseData.reason = "Something went wrong...";
        return responseData;
    }
};


export const checkStreams = async (id: string): Promise<IResponseData> => {
    let responseData: IResponseData = {
        status: true,
        reason: "",
    }
    try {
        const findQuery = StreamModel.aggregate([
            {
                $match: {
                    createdById: ObjectID(id),
                },
            },
        ]);

        const streams = await findQuery.exec();

        if (streams.length > 0) {
            responseData.status = false;
            responseData.reason = "Multipay - Payer Streams exist";
        }

        return responseData;

    } catch (e) {
        responseData.status = false;
        responseData.reason = "Something went wrong...";
        return responseData;
    }
};

export const checkAirdrops = async (id: string): Promise<IResponseData> => {
    let responseData: IResponseData = {
        status: true,
        reason: "",
    }
    const currentTimestamp = await getCurrentTimeInSecond();
    const currentDate = new Date(currentTimestamp * 1000);
    try {
        const findQuery = AirdropModel.aggregate([
            {
                $match: {
                    $and: [
                        { createdById: ObjectID(id) },
                        { releaseAt: { $gte: currentDate } } // research how to compare date in mongo aggregate
                    ]
                },
            },
        ]);

        const airdrops = await findQuery.exec();

        if (airdrops.length > 0) {
            responseData.status = false;
            responseData.reason = "Multipay - Active airdrop exist";
        }

        return responseData;

    } catch (e) {
        responseData.status = false;
        responseData.reason = "Something went wrong...";
        return responseData;
    }
};


export const checkStreamsByPayeeAddress = async (recipientId: string, walletAddress: string): Promise<IResponseData> => {
    let responseData: IResponseData = {
        status: true,
        reason: "",
    }
    try {
        const pipelineStage: PipelineStage[] = [];

        pipelineStage.push({
            $match: {
                recipientId: ObjectID(recipientId),
            },
        });

        const findQuery = StreamModel.aggregate(pipelineStage);

        const streams = await findQuery.exec();

        if (streams.length > 0) {
            responseData.status = false;
            responseData.reason = "Multipay - Payee Streams exist";
        }

        return responseData;

    } catch (e) {
        responseData.status = false;
        responseData.reason = "Something went wrong...";
        return responseData;
    }
};