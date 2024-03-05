import { Router } from 'express';
import epFarmInfoHandler from './handlers/epFarmInfoHandler';

const epFarmsRouter = Router();

epFarmsRouter.get('/infos', epFarmInfoHandler);

export default epFarmsRouter;
