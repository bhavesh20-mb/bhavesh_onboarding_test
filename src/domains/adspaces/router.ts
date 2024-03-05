import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import authRouter from './apis/auth/router';
import { FailJsonResponseType } from './types/api';

import providePublicAdsRouter from './apis/public/router';
import provideAdvertisersAdsRouter from './apis/advertisers/router';
import provideCouponsRouter from './apis/coupons/router';
import provideAdminRouter from './apis/admin/router';

const adSpacesRouter = Router();

adSpacesRouter.use(passport.initialize());

const passportAuthenticate = (req: Request, res: Response<FailJsonResponseType>, next: NextFunction) =>
    passport.authenticate('ads-strategy', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ success: false, error: { message: 'Not authorized.' } });
        }

        req.user = user;

        return next();
    })(req, res, next);

adSpacesRouter.use('/public', providePublicAdsRouter);
adSpacesRouter.use('/advertisers', passportAuthenticate, provideAdvertisersAdsRouter);
adSpacesRouter.use('/coupons', passportAuthenticate, provideCouponsRouter);
adSpacesRouter.use('/admin', passportAuthenticate, provideAdminRouter);
adSpacesRouter.use('/auth', authRouter);

export default adSpacesRouter;
