import { Request, Response } from 'express';
import ProjectV2Model from 'src/database/models/multipay-v2/project.model';
import {
    IApiHandler,
    JsonResponseType,
    UpdateProjectRequestType,
    UpdateProjectResponseType,
} from 'src/domains/multipay-v2/types/api';

export const updateProject: IApiHandler<
    Request<{ id: string }, {}, UpdateProjectRequestType>,
    Response<JsonResponseType<UpdateProjectResponseType>>
> = async (req, res) => {
    try {
        const project = await ProjectV2Model.findOneAndUpdate(
            { _id: req.params.id, createdById: req.user!._id },
            req.body,
        );

        if (!project) {
            return res.status(404).json({ success: false, error: { message: 'Project not found' } });
        }

        const updatedProject = await ProjectV2Model.findById(req.params.id);

        return res.json({
            success: true,
            data: updatedProject!.toObject(),
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
