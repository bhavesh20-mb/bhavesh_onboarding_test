import { Router } from 'express';
import { createProject } from './handlers/create';
import { deleteProject } from './handlers/delete';
import { getProject, getProjects } from './handlers/get';
import { updateProject } from './handlers/update';

const projectsRouter = Router();

projectsRouter.get('/', getProjects);
projectsRouter.get('/:id', getProject);
projectsRouter.post('/', createProject);
projectsRouter.put('/:id', updateProject);
projectsRouter.delete('/:id', deleteProject);

export default projectsRouter;
