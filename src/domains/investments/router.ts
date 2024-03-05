import { Router } from 'express';
import {
    CACHE_KEY_INVESTMENTS_GENERAL_STATS,
    CACHE_KEY_INVESTMENTS_GRAPH_STATS,
    CACHE_KEY_INVESTMENTS_PROTOCOLS,
    CACHE_KEY_INVESTMENTS_BUY_BACK,
    CACHE_KEY_INVESTMENTS_INVESTMENTS,
    CACHE_KEY_INVESTMENTS_FNFTS,
} from 'src/constants/investments';
import cacheMiddleWare from 'src/middlewares/cache';
import generalStatsRouter from './handlers/generalStatsHandler';
import graphStatsHandler from './handlers/graphStatsHandler';
import buyBackHandler from './handlers/buyBackHandler';
import protocolsHandler from './handlers/protocolsHandler';
import investmentsHandler from './handlers/investmentsHandler';
import fnftsHandler from './handlers/fnftsHandler';
import generalStatsSupplyHandler from './handlers/generalStatsSupplyHandler';
import votingPowerHandler from './handlers/votingPowerHandler';
import erc20VotingPowerHandler from './handlers/erc20VotingPowerHandler'
import votingTimeHandler from './handlers/votingTimeHandler';
import votingTimeUpdateHandler from './handlers/votingTimeUpdateHandler';

const investmentsRouter = Router();

investmentsRouter.get('/graph-stats', cacheMiddleWare(CACHE_KEY_INVESTMENTS_GRAPH_STATS), graphStatsHandler);
investmentsRouter.get('/supply/:type', generalStatsSupplyHandler);
investmentsRouter.get('/general-stats', cacheMiddleWare(CACHE_KEY_INVESTMENTS_GENERAL_STATS), generalStatsRouter);
investmentsRouter.get('/protocols', cacheMiddleWare(CACHE_KEY_INVESTMENTS_PROTOCOLS), protocolsHandler);
investmentsRouter.get('/buy-back', cacheMiddleWare(CACHE_KEY_INVESTMENTS_BUY_BACK), buyBackHandler);
investmentsRouter.get('/investments', cacheMiddleWare(CACHE_KEY_INVESTMENTS_INVESTMENTS), investmentsHandler);
investmentsRouter.get('/fnfts', fnftsHandler);
investmentsRouter.get('/voting-power', votingPowerHandler);
investmentsRouter.post('/voting-power-erc20', erc20VotingPowerHandler);
investmentsRouter.get('/voting-time', votingTimeHandler);
investmentsRouter.get('/voting-time/update', votingTimeUpdateHandler);

export default investmentsRouter;
