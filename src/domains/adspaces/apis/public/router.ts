import { Router } from 'express';
import { getAd } from './handlers/getAd';
import { getVoucher } from './handlers/getVoucher';
import { getCouponInfo } from './handlers/getCouponInfo';
import { getAnnouncement } from './handlers/getAnnouncement';

const providePublicAdsRouter = Router();

providePublicAdsRouter.get('/adv/:dimension', getAd);
providePublicAdsRouter.get('/voucher', getVoucher);
providePublicAdsRouter.get('/getCouponInfo', getCouponInfo);
providePublicAdsRouter.get('/announcement/:buildId', getAnnouncement);

export default providePublicAdsRouter;
