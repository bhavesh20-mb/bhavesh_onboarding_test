import { Router } from 'express';
import { getTokens } from './handlers/get';

const tokenRouter = Router();

tokenRouter.post('/', getTokens);

export default tokenRouter;
