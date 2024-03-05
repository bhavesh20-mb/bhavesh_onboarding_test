import { Router } from 'express';
import apiRouterV1 from './apiRouterV1';

const routers = Router();

routers.use('/v1', apiRouterV1);

export default routers;
