import { Router } from 'express';
import depositDataHandler from './handlers/depositDataHandler';
import bondingFarmInfoHandler from './handlers/bondingFarmInfoHandler';

const bondingFarmsRouter = Router();

bondingFarmsRouter.get('/deposits', depositDataHandler);
bondingFarmsRouter.get('/infos', bondingFarmInfoHandler);

export default bondingFarmsRouter;
