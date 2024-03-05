import { Router } from 'express';
import { getDashboardGainData } from './handlers/get';

const gainRouter = Router();

gainRouter.get('/', getDashboardGainData);

export default gainRouter;
