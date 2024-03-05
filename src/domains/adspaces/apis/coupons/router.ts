import { Router } from 'express';

import { getCoupon } from './handlers/getCoupon';
import { createCoupon } from './handlers/createCoupon';
import { editCoupon } from './handlers/editCoupon';

const provideCouponsRouter = Router();

provideCouponsRouter.get('/:code', getCoupon);
provideCouponsRouter.post('/create', createCoupon);
provideCouponsRouter.put('/:code', editCoupon);

export default provideCouponsRouter;