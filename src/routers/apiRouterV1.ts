import { Router } from 'express';
import investmentsRouter from 'src/domains/investments/router';
import contractsRouter from 'src/domains/contracts/router';
import coingeckoRouter from 'src/domains/coingecko/router';
import bondingFarmsRouter from 'src/domains/bondingFarms/router';
import hectorpayRouter from 'src/domains/hectorpay/router';
import walletRouter from 'src/domains/wallet/router';
import tokenRouter from 'src/domains/tokens/router';
import epFarmsRouter from 'src/domains/epFarms/router';
import taxReportRouter from 'src/domains/taxreport/router';
import adSpacesRouter from 'src/domains/adspaces/router';
import accountRouter from 'src/domains/account/router';
import authRouter from 'src/auth/router';
import multipayV2Router from 'src/domains/multipay-v2/router';
import addressBookRouter from 'src/domains/addressbook/router';

const apiRouterV1 = Router();

apiRouterV1.get('/ping', (_, res) => {
    res.json({ message: 'pong' });
});

apiRouterV1.use('/coingecko', coingeckoRouter);
apiRouterV1.use('/investments', investmentsRouter);
apiRouterV1.use('/contracts', contractsRouter);
apiRouterV1.use('/bonding-farms', bondingFarmsRouter);
apiRouterV1.use('/auth', authRouter);
apiRouterV1.use('/hectorpay', hectorpayRouter);
apiRouterV1.use('/multipay-v2', multipayV2Router);
apiRouterV1.use('/wallet', walletRouter);
apiRouterV1.use('/token', tokenRouter);
apiRouterV1.use('/epfarms', epFarmsRouter);
apiRouterV1.use('/taxreport', taxReportRouter);
apiRouterV1.use('/adspaces', adSpacesRouter);
apiRouterV1.use('/account', accountRouter);
apiRouterV1.use('/addressbook', addressBookRouter)

export default apiRouterV1;
