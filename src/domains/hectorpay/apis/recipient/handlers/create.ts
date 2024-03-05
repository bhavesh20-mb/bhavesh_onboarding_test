import { Request, Response } from 'express';
import RecipientModel from 'src/database/models/hectorpay/recipient.model';
import {
    CreateRecipientRequestType,
    CreateRecipientResponseType,
    IApiHandler,
    JsonResponseType,
} from 'src/domains/hectorpay/types/api';

import { ethers } from 'ethers';
import { ObjectId } from 'mongoose';

type PlanLevelType = {
    title: string;
    priceInUsd: number;
    timeUnit: 'month' | 'year';
    planIds: string[];
    description: string;
    maxStreams: number;
    maxRecipients: number;
};

export const dummyPlanLevels: PlanLevelType[] = [
    {
        title: 'Free',
        priceInUsd: 0,
        timeUnit: 'month',
        planIds: [],
        description: 'This plan gives you up to 1 active stream and up to 5 recipients',
        maxStreams: 1,
        maxRecipients: 5,
    },
    {
        title: 'Small',
        priceInUsd: 70,
        timeUnit: 'month',
        planIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        description: 'This plan gives you up to 3 active streams and up to 15 recipients',
        maxStreams: 3,
        maxRecipients: 15,
    },
    {
        title: 'Medium',
        priceInUsd: 99,
        timeUnit: 'month',
        planIds: ['10', '11', '12', '13', '14', '15', '16', '17', '18'],
        description: 'This plan gives you up to 10 active streams and up to 150 recipients',
        maxStreams: 10,
        maxRecipients: 150,
    },
    {
        title: 'Large',
        priceInUsd: 199,
        timeUnit: 'month',
        planIds: ['19', '20', '21', '22', '23', '24', '25', '26', '27'],
        description: 'This plan gives you up to 50 active streams and up to 500 recipients',
        maxStreams: 50,
        maxRecipients: 500,
    },
    // {
    //   title: "Enterprise",
    //   priceInUsd: 200,
    //   timeUnit: "month",
    //   planIds: ["9", "10"],
    //   description: "This plan gives you an unlimited number of active streams and recipients.",
    //   maxStreams: 10000000,
    //   maxRecipients: 500000,
    // },
];

const HECTOR_SUBSCRIPTION_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'from', type: 'address' }],
        name: 'getSubscription',
        outputs: [
            { internalType: 'uint256', name: 'planId', type: 'uint256' },
            { internalType: 'uint48', name: 'expiredAt', type: 'uint48' },
            { internalType: 'bool', name: 'isCancelled', type: 'bool' },
            { internalType: 'bool', name: 'isActiveForNow', type: 'bool' },
            { internalType: 'uint48', name: 'dueDate', type: 'uint48' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];

const hectorSubscriptionAddress = '0xf90ac51a2a20689657db558da14bf704c9e8fd3d';

let providerCache: ethers.providers.JsonRpcProvider;
let contractCache: ethers.Contract;

const getProvider = () => {
    if (!providerCache) {
        providerCache = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/fantom/');
    }
    return providerCache;
};

const getContract = () => {
    if (!contractCache) {
        contractCache = new ethers.Contract(hectorSubscriptionAddress, HECTOR_SUBSCRIPTION_ABI, getProvider());
    }
    return contractCache;
};

const getSubscription = async (walletAddress: string) => {
    const subscription = await getContract().getSubscription(walletAddress);
    return subscription;
};

const getUserPlan = async (walletAddress: string) => {
    const subscription = await getSubscription(walletAddress);
    if (ethers.BigNumber.from(subscription.planId).toString() !== '0') {
        const planIdStr = ethers.BigNumber.from(subscription.planId).toString();
        const userPlan = dummyPlanLevels.find((planLevel) => planLevel.planIds.includes(planIdStr));
        return userPlan;
    }

    return dummyPlanLevels[0];
};

const getUserRecipientCount = async (userId: ObjectId) => {
    const count = await RecipientModel.countDocuments({ createdById: userId });
    return count;
};

const isValidEmail = (email: string): boolean => {
    const re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

export const createRecipient: IApiHandler<
    Request<{}, {}, CreateRecipientRequestType>,
    Response<JsonResponseType<CreateRecipientResponseType>>
> = async (req, res) => {
    if (!req.user?.walletAddress) {
        return res.status(400).json({ success: false, error: { message: 'User has no wallet address' } });
    }
    try {
        const userPlan = await getUserPlan(req.user.walletAddress);

        if (!userPlan) {
            return res.status(400).json({ success: false, error: { message: 'User has no plan' } });
        }

        const currentRecipientCount = await getUserRecipientCount(req.user!._id);

        if (currentRecipientCount < userPlan.maxRecipients) {
            const newRecipient = await RecipientModel.create({
                ...req.body,
                createdById: req.user!._id,
            });

            return res.json({
                success: true,
                data: newRecipient.toObject(),
            });
        } else {
            return res.status(400).json({
                success: false,
                error: { message: 'Recipient limit for your plan has been reached. Please upgrade your plan.' },
            });
        }
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};

export const importRecipients: IApiHandler<
    Request<{}, {}, string>,
    Response<JsonResponseType<{ errors: string[] }>>
> = async (req, res) => {
    if (!req.user?.walletAddress) {
        return res.status(400).json({ success: false, error: { message: 'User has no wallet address' } });
    }
    try {
        let errors = [];
        const recipients = req.body as unknown as CreateRecipientRequestType[];
        const userPlan = await getUserPlan(req.user.walletAddress);
        if (!userPlan) {
            return res.status(400).json({ success: false, error: { message: 'User has no plan' } });
        }
        const currentRecipientCount = await getUserRecipientCount(req.user!._id);

        if (recipients.length > userPlan.maxRecipients - currentRecipientCount) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'This import would exceed your plan recipient limit. Please upgrade your plan.',
                },
            });
        }

        const validRecipients = recipients.filter((recipient) => {
            const { name, walletAddress, email, description } = recipient;
            if (
                !name ||
                !walletAddress ||
                name.length > 50 ||
                (description && description.length > 120) ||
                !ethers.utils.isAddress(walletAddress.toLowerCase()) ||
                (email && email !== '' && !isValidEmail(email))
            ) {
                errors.push(`Invalid recipient data: ${JSON.stringify(recipient)}`);
                return false;
            }
            return true;
        });

        const batchData = validRecipients.map((recipient) => {
            const { classificationIds, ...toWIPrecipientWithoutClassificationIds } = recipient;
            return {
                ...toWIPrecipientWithoutClassificationIds,
                createdById: req.user!._id,
            };
        });

        try {
            await RecipientModel.insertMany(batchData);
        } catch (e) {
            // @ts-ignore
            errors.push(e.message);
        }

        return res.json({
            success: true,
            data: {
                errors,
            },
        });
    } catch (e) {
        // @ts-ignore
        const errorMessage = e.message;

        return res.status(500).json({ success: false, error: { message: errorMessage } });
    }
};
