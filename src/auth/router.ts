import { Router } from 'express';
import { getNonce } from './handlers/getNonce';
import { signIn } from './handlers/signIn';
import { signUp } from './handlers/signUp';

const authRouter = Router();

authRouter.get('/:walletAddress/nonce/:signType', getNonce);
authRouter.post('/:walletAddress/signin', signIn);
authRouter.post('/:walletAddress/signup', signUp);

export default authRouter;
