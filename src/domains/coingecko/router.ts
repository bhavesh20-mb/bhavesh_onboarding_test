import { Router } from 'express';
import coinListHandler from './handlers/coinListHandler';
import coinPriceHandler from './handlers/coinPriceHandler';

const coingeckoRouter = Router();

coingeckoRouter.get('/coin-price/:symbol', coinPriceHandler);
coingeckoRouter.get('/coin-list', coinListHandler);

export default coingeckoRouter;
