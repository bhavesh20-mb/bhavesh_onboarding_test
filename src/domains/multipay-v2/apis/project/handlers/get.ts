import { Request, Response } from 'express';
import ProjectV2Model from 'src/database/models/multipay-v2/project.model';
import {
    GetProjectResponseType,
    GetProjectsQueryParamsType,
    GetProjectsResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/multipay-v2/types/api';

export const getProject: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<GetProjectResponseType>>
> = async (req, res) => {
    try {
        const project = await ProjectV2Model.findOne({
            _id: req.params.id,
            createdById: req.user!._id,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Project not found',
                },
            });
        }

        return res.json({
            success: true,
            data: project,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const getProjects: IApiHandler<
    Request<{}, {}, {}, GetProjectsQueryParamsType>,
    Response<JsonResponseType<GetProjectsResponseType>>
> = async (req, res) => {
    const keywordRegex = req.query.keyword ? new RegExp(req.query.keyword, 'i') : null;

    try {
        const findQuery = ProjectV2Model.find({ createdById: req.user!._id });

        if (req.query.chainId) {
            findQuery.find({ chainId: parseInt(req.query.chainId) });
        }

        if (keywordRegex) {
            findQuery.or([{ name: keywordRegex, description: keywordRegex }]);
        }

        const projects = await findQuery.exec();

        return res.json({
            success: true,
            data: projects,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
