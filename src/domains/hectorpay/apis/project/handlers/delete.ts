import { Request, Response } from 'express';
import ProjectModel from 'src/database/models/hectorpay/project.model';
import { DeleteProjectResponseType, IApiHandler, JsonResponseType } from 'src/domains/hectorpay/types/api';

export const deleteProject: IApiHandler<
    Request<{ id: string }>,
    Response<JsonResponseType<DeleteProjectResponseType>>
> = async (req, res) => {
    try {
        const project = await ProjectModel.findOneAndDelete({ _id: req.params.id, createdById: req.user!._id });

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
