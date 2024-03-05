import { Router } from 'express';
import { createProject } from './handlers/create';
import { deleteProject } from './handlers/delete';
import { getProject, getProjects } from './handlers/get';
import { updateProject } from './handlers/update';

const projectsV2Router = Router();

projectsV2Router.get('/', getProjects);
projectsV2Router.get('/:id', getProject);
projectsV2Router.post('/', createProject);
projectsV2Router.put('/:id', updateProject);
projectsV2Router.delete('/:id', deleteProject);

export default projectsV2Router;
