import jwt from 'jsonwebtoken';
export const JWT_SECRET = '7w!z%C*F-JaNdRgUkXp2s5v8x/A?D(G+';

export type JWTPayloadType = {
    _id: string;
    walletAddress: string;
};

export const generateJWT = (payload: JWTPayloadType) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
