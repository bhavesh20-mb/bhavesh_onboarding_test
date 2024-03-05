import { Request, Response } from 'express';
import ProjectModel from 'src/database/models/hectorpay/project.model';
import {
    CreateProjectRequestType,
    CreateProjectResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

export const createProject: IApiHandler<
    Request<{}, {}, CreateProjectRequestType>,
    Response<JsonResponseType<CreateProjectResponseType>>
> = async (req, res) => {
    try {
        const newProject = await ProjectModel.create({
            ...req.body,
            createdById: req.user!._id,
        });

        return res.json({
            success: true,
            data: newProject.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
