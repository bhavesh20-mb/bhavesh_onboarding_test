import { Request, Response } from 'express';
import ProjectV2Model from 'src/database/models/multipay-v2/project.model';
import { DeleteProjectResponseType, IApiHandler, JsonResponseType } from 'src/domains/multipay-v2/types/api';

export const deleteProject: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteProjectResponseType>>
> = async (req, res) => {
    try {
        const project = await ProjectV2Model.findOneAndDelete({ _id: req.params.id, createdById: req.user!._id });

        return res.json({
            success: true,
            data: project?.toObject() ?? null,
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
