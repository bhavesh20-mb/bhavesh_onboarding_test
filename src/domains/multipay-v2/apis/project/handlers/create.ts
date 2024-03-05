import { Request, Response } from 'express';
import ProjectV2Model from 'src/database/models/multipay-v2/project.model';
import {
    CreateProjectRequestType,
    CreateProjectResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/multipay-v2/types/api';

export const createProject: IApiHandler<
    Request<{}, {}, CreateProjectRequestType>,
    Response<JsonResponseType<CreateProjectResponseType>>
> = async (req, res) => {
    try {
        const newProject = await ProjectV2Model.create({
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
