import { Router } from 'express';
import { createAd } from './handlers/createAd';
import { getAdsAdmin } from './handlers/getAdsAdmin';
import { getAdAdmin } from './handlers/getAdAdmin';
import { updateAd } from './handlers/updateAd';

const provideAdvertisersAdsRouter = Router();

provideAdvertisersAdsRouter.post('/createAd', createAd);
provideAdvertisersAdsRouter.get('/getAds', getAdsAdmin);
provideAdvertisersAdsRouter.get('/getAd/:id', getAdAdmin);
provideAdvertisersAdsRouter.put('/updateAd/:id', updateAd);

export default provideAdvertisersAdsRouter;
