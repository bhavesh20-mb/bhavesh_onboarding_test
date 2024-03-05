import { Request, Response, NextFunction } from 'express';
import mcache from 'memory-cache';

const cacheMiddleWare = (cacheKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const cachedBody = mcache.get(cacheKey);

        if (!!cachedBody) {
            return res.json(cachedBody);
        } else {
            // @ts-ignore
            res.responseJSON = res.json;
            
            // @ts-ignore
            res.json = (data) => {
                mcache.put(cacheKey, data);

                // @ts-ignore
                res.responseJSON(data);
            };

            next();
        }
    };
};

export default cacheMiddleWare;
