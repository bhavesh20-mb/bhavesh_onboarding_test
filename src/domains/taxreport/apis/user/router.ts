import { Router } from 'express';
import { getUserInfo } from './handlers/get';

const userRouter = Router();

userRouter.get('/', getUserInfo);

export default userRouter;
