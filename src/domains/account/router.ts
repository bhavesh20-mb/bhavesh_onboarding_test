import { Router } from 'express';
import { createAccount } from './handlers/create';
import { getAccount } from './handlers/get';
import { sendEmail } from './handlers/sendEmail';
import { canDisable, getStatus } from './common';
import disable from './handlers/disable';
import active from './handlers/active';
import { getNonce } from './handlers/getNonce';

const accountRouter = Router();

accountRouter.get('/:walletAddress', getAccount);
accountRouter.get('/:walletAddress/nonce/:signType', getNonce);
accountRouter.post('/send-email/:walletAddress', sendEmail);
accountRouter.get('/getStatus/:walletAddress', getStatus);
accountRouter.get('/canDisable/:walletAddress', canDisable);
accountRouter.post('/create/:walletAddress', createAccount);
accountRouter.post('/disable/:walletAddress', disable);
accountRouter.post('/active/:walletAddress', active);

export default accountRouter;
