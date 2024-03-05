import { Router } from 'express';
import walletBalanceInfoHandler from './handlers/walletBalanceInfoHandler';

const walletBalanceRouter = Router();

walletBalanceRouter.get('/balance', walletBalanceInfoHandler);

export default walletBalanceRouter;
