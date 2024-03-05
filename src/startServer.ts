import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import {
    bondingFarmCronJob,
    fnftCronJob,
    investmentsCronJob,
    votingCronJob,
    epFarmCronJob,
    taxReportCronJob,
    multiPayCronJob,
} from './cronJobs';
import routers from './routers';
import { useAdsPassport } from './domains/adspaces/apis/auth/utils/passport';

import vouchersListenAndSync from './cronJobs/adSpacesData';
import { usePassport } from './auth/utils/passport';

const startServer = () => {
    console.log('starting server...');

    // votingCronJob.start(); // This cronjob is working on voting contract so this is not used anymore

    if (process.env.CRON_JOB_ON === 'yes') {
        investmentsCronJob.start();
    }

    // fnftCronJob.start();
    // bondingFarmCronJob.start();
    // multiPayCronJob.start();
    // epFarmCronJob.start();
    // taxReportCronJob.start();

    usePassport();
    useAdsPassport();

    const port = process.env.SERVER_PORT || 8080;

    const app = express();

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get('/', (_, res) => {
        res.status(200).send('Hector DApp API');
    });

    app.use('/api', routers);

    vouchersListenAndSync();

    app.listen(port, () => console.log(`Running on port ${port}`));
};

export default startServer;
