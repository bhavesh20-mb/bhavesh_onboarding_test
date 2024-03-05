import mongoose from 'mongoose';
import passport from 'passport';
import { ExtractJwt, Strategy, StrategyOptions, VerifyCallback } from 'passport-jwt';
import AdSpacesUserModel from 'src/database/models/adspaces/user.model';
import { IAdSpacesUserModel } from 'src/interfaces/adSpacesModels';
import { JWTPayloadType, JWT_SECRET } from './generateJWT';

declare global {
    namespace Express {
        interface User extends IAdSpacesUserModel {
            _id: mongoose.Schema.Types.ObjectId;
        }
    }
}

export const useAdsPassport = () => {
    const strategyOptions: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
    };

    const verifyCallback: VerifyCallback = (payload: JWTPayloadType, done) => {
        AdSpacesUserModel.findById(payload._id)
            .then((user) => {
                if (!user) {
                    return done(null, false);
                }

                return done(null, user.toObject());
            })
            .catch((e) => {
                return done(e.message);
            });
    };

    passport.use('ads-strategy', new Strategy(strategyOptions, verifyCallback));
};