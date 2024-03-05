import { Router } from 'express';

import authMiddleWare from 'src/middlewares/auth';
import addContractHandler from './handlers/addContractHandler';
import getContractListHandler from './handlers/getContractListHandler';

const contractsRouter = Router();

contractsRouter.get('/', getContractListHandler);
contractsRouter.post('/', authMiddleWare, addContractHandler);

export default contractsRouter;
