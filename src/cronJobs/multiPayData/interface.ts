export type SubscriptionInfo = {
    id: string;
    user: {
        address: string;
    };
    expiredAt: number;
};

export type Stream = {
    id: string;
    streamId: string;
    amountPerSec: number;
    starts: number;
    ends: number;
    active: boolean;
    payer: {
        address: string;
    };
    payee: {
        address: string;
    };
    contract: {
        address: string;
    };
};

export type StreamParam = {
    payContract: string;
    from: string;
    to: string;
    amountPerSec: number;
    starts: number;
    ends: number;
}

export type SubscriptionsData = any;
export type StreamData = any;