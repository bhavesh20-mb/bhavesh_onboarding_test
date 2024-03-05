import { Router } from 'express';
import { createClassification } from './handlers/create';
import { deleteClassification } from './handlers/delete';
import { getClassification, getClassifications } from './handlers/get';
import { updateClassification } from './handlers/update';

const classificationsRouter = Router();

classificationsRouter.get('/', getClassifications);
classificationsRouter.get('/:id', getClassification);
classificationsRouter.post('/', createClassification);
classificationsRouter.put('/:id', updateClassification);
classificationsRouter.delete('/:id', deleteClassification);

export default classificationsRouter;
