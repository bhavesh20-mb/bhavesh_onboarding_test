export interface Fee {
    type?: 'taker' | 'maker' | string;
    currency: string;
    rate?: number;
    cost: number;
}

export interface Trade {
    amount: number;
    datetime: string;
    id: string;
    info: any;
    order?: string;
    price: number;
    timestamp: number;
    type?: string;
    side: 'buy' | 'sell' | string;
    symbol: string;
    takerOrMaker: 'taker' | 'maker' | string;
    cost: number;
    fee: Fee;
}
