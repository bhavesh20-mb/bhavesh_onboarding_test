import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';

import walletRouter from './apis/wallet/router';
import { FailJsonResponseType } from './types/api';
import { getWalletHistories } from './apis/history/handlers/get';
import ticketRouter from './apis/ticket/router';
import userRouter from './apis/user/router';
import tokenRouter from './apis/token/router';
import gainRouter from './apis/gain/router';
import authRouter from 'src/auth/router';
import { passportAuthenticate } from 'src/auth/utils/passport';

const taxReportRouter = Router();

taxReportRouter.use(passport.initialize());

taxReportRouter.use('/tickets', passportAuthenticate, ticketRouter);
taxReportRouter.use('/wallets', passportAuthenticate, walletRouter);
taxReportRouter.get('/history', passportAuthenticate, getWalletHistories);
taxReportRouter.use('/user', passportAuthenticate, userRouter);
taxReportRouter.use('/token', passportAuthenticate, tokenRouter);
taxReportRouter.use('/gain', passportAuthenticate, gainRouter);
taxReportRouter.use('/auth', authRouter);

export default taxReportRouter;
