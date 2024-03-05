import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { coingeckoApiKey, coingeckoProApiBaseUrl } from 'src/constants';
import {
    CoinGeckoCoinListInfo,
    CoinGeckoCoinsUsdPriceInfo,
    CoinGeckoCoinUsdPriceInfo,
} from 'src/interfaces/apiDataModels';

export default async function (req: Request, res: Response) {
    try {
        const symbol: string = req.params.symbol.toLowerCase();

        // valid requested coin name
        const coinsList: CoinGeckoCoinListInfo[] = (await (
            await fetch(`${coingeckoProApiBaseUrl}/coins/list?x_cg_pro_api_key=${coingeckoApiKey}`)
        ).json()) as CoinGeckoCoinListInfo[];

        const isValidCoin: number = coinsList.findIndex((ele: CoinGeckoCoinListInfo) => ele.symbol === symbol);

        if (isValidCoin >= 0) {
            const coinPrices: CoinGeckoCoinsUsdPriceInfo = (await (
                await fetch(
                    `${coingeckoProApiBaseUrl}/simple/price?ids=${coinsList[isValidCoin].id}&vs_currencies=usd&x_cg_pro_api_key=${coingeckoApiKey}`,
                )
            ).json()) as CoinGeckoCoinsUsdPriceInfo;

            const coinPrice: CoinGeckoCoinUsdPriceInfo = Object.values(coinPrices)[0];

            return res.send(`<div id="price">${coinPrice.usd}</div>`);
        } else {
            return res.status(400).json({
                message: 'bad request - endpoint should end with correct symbol',
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
