import { Router } from 'express';
import getTokenDetailsHandler from './handlers/getTokenDetailsHandler';

const tokenRouter = Router();

tokenRouter.post('/details', getTokenDetailsHandler);

export default tokenRouter;
