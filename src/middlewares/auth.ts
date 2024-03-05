import { Request, Response, NextFunction } from 'express';

const authMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        try {
            const bearerToken = bearerHeader?.slice(7);
            if (bearerToken !== 'c34c58f7-bbac-44c9-948d-3f228a6ae8b3') {
                return res.status(401).json({ message: 'Invalid Token' });
            }
            return next();
        } catch (e) {
            return res.status(401).json({ message: 'Invalid Token' });
        }
    } else {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }
};

export default authMiddleWare;
