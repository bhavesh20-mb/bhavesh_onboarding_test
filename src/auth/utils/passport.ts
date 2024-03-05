import mongoose from 'mongoose';
import passport from 'passport';
import { ExtractJwt, Strategy, StrategyOptions, VerifyCallback } from 'passport-jwt';
import { JWTPayloadType, JWT_SECRET } from './generateJWT';
import { IUserModel } from 'src/interfaces/dbModels';
import UserModel from 'src/database/models/user.model';
import { FailJsonResponseType } from '../types/api';
import { NextFunction, Request, Response } from 'express';

declare global {
    namespace Express {
        interface User extends IUserModel {
            _id: mongoose.Schema.Types.ObjectId;
        }
    }
}

export const usePassport = () => {
    const strategyOptions: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
    };

    const verifyCallback: VerifyCallback = (payload: JWTPayloadType, done) => {
        UserModel.findById(payload._id)
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

    passport.use('hector-dapp-user-strategy', new Strategy(strategyOptions, verifyCallback));
};

export const passportAuthenticate = (req: Request, res: Response<FailJsonResponseType>, next: NextFunction) =>
    passport.authenticate('hector-dapp-user-strategy', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ success: false, error: { message: 'Not authorized.' } });
        }

        req.user = user;

        return next();
    })(req, res, next);
