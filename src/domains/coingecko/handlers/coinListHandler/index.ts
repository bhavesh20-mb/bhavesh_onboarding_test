import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { coingeckoApiKey, coingeckoProApiBaseUrl } from 'src/constants';
import { CoinGeckoCoinListInfo } from 'src/interfaces/apiDataModels';

export default async function (req: Request, res: Response) {
    try {
        const coinsList: CoinGeckoCoinListInfo[] = (await (
            await fetch(`${coingeckoProApiBaseUrl}/coins/list?x_cg_pro_api_key=${coingeckoApiKey}`)
        ).json()) as CoinGeckoCoinListInfo[];

        res.json(coinsList);
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
