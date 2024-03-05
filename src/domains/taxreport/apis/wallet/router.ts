import { Router } from 'express';
import { createWallet } from './handlers/create';
import { deleteWallet } from './handlers/delete';
import { updateWallet } from './handlers/update';
import { getWallet, getWalletList, getWallets } from './handlers/get';

const walletRouter = Router();

walletRouter.post('/', createWallet);
walletRouter.put('/:id', updateWallet);
walletRouter.delete('/:id', deleteWallet);
walletRouter.post('/all', getWallets);
walletRouter.get('/:id', getWallet);
walletRouter.get('/', getWalletList);

export default walletRouter;
