import { Router } from 'express';
import { createAirdrop } from './handlers/create';
import { deleteAirdrop } from './handlers/delete';
import { getAirdrop, getAirdrops } from './handlers/get';

const airdropsRouter = Router();

airdropsRouter.get('/', getAirdrops);
airdropsRouter.get('/:id', getAirdrop);
airdropsRouter.post('/', createAirdrop);
airdropsRouter.delete('/:id', deleteAirdrop);

export default airdropsRouter;
