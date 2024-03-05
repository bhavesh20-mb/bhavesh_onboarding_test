import { Router } from 'express';
import passport from 'passport';

import airdropsRouter from 'src/domains/hectorpay/apis/airdrop/router';
import classificationsRouter from 'src/domains/hectorpay/apis/classification/router';
import recipientsRouter from 'src/domains/hectorpay/apis/recipient/router';

import { getStreamsByPayeeAddress } from './apis/stream/handlers/get';
import { passportAuthenticate } from 'src/auth/utils/passport';
import authRouter from 'src/auth/router';
import projectsV2Router from './apis/project/router';
import streamsV2Router from './apis/stream/router';

const multipayV2Router = Router();

multipayV2Router.use(passport.initialize());

multipayV2Router.use('/recipients', passportAuthenticate, recipientsRouter);
multipayV2Router.use('/classifications', passportAuthenticate, classificationsRouter);
multipayV2Router.use('/projects', passportAuthenticate, projectsV2Router);
multipayV2Router.use('/streams', passportAuthenticate, streamsV2Router);
multipayV2Router.use('/airdrops', passportAuthenticate, airdropsRouter);
multipayV2Router.use('/auth', authRouter);

multipayV2Router.get('/payee/:walletAddress/streams', getStreamsByPayeeAddress);

export default multipayV2Router;
