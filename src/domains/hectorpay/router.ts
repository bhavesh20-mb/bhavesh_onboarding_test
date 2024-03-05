import { Router } from 'express';
import passport from 'passport';
import airdropsRouter from './apis/airdrop/router';
import classificationsRouter from './apis/classification/router';
import projectsRouter from './apis/project/router';
import recipientsRouter from './apis/recipient/router';
import { getStreamsByPayeeAddress } from './apis/stream/handlers/get';
import streamsRouter from './apis/stream/router';
import { passportAuthenticate } from 'src/auth/utils/passport';
import authRouter from 'src/auth/router';

const hectorpayRouter = Router();

hectorpayRouter.use(passport.initialize());

hectorpayRouter.use('/recipients', passportAuthenticate, recipientsRouter);
hectorpayRouter.use('/classifications', passportAuthenticate, classificationsRouter);
hectorpayRouter.use('/projects', passportAuthenticate, projectsRouter);
hectorpayRouter.use('/streams', passportAuthenticate, streamsRouter);
hectorpayRouter.use('/airdrops', passportAuthenticate, airdropsRouter);
hectorpayRouter.use('/auth', authRouter);

hectorpayRouter.get('/payee/:walletAddress/streams', getStreamsByPayeeAddress);

export default hectorpayRouter;
