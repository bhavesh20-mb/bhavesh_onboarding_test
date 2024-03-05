import syncVouchersUsage from './syncVouchersUsage';

import { CHAINS, FANTOM } from 'src/utils/chain';

import { ethers } from 'ethers';

import AdSpacesVoucherModel from 'src/database/models/adspaces/voucher.model';

import CouponModel from 'src/database/models/adspaces/coupon.model';

import SyncVouchersUsage from './syncVouchersUsage';
import path from 'path'
import {spawn} from 'child_process'

const subscriptionsAbi = [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    { inputs: [], name: 'ACTIVE_SUBSCRIPTION', type: 'error' },
    { inputs: [], name: 'INACTIVE_SUBSCRIPTION', type: 'error' },
    { inputs: [], name: 'INSUFFICIENT_FUND', type: 'error' },
    { inputs: [], name: 'INVALID_ADDRESS', type: 'error' },
    { inputs: [], name: 'INVALID_AMOUNT', type: 'error' },
    { inputs: [], name: 'INVALID_COUPON', type: 'error' },
    { inputs: [], name: 'INVALID_MODERATOR', type: 'error' },
    { inputs: [], name: 'INVALID_PARAM', type: 'error' },
    { inputs: [], name: 'INVALID_PLAN', type: 'error' },
    { inputs: [], name: 'INVALID_TIME', type: 'error' },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' }],
        name: 'Initialized',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
            { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'token', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'PayerDeposit',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'token', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'PayerWithdraw',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'uint256', name: 'planId', type: 'uint256' },
            { indexed: false, internalType: 'address', name: 'token', type: 'address' },
            { indexed: false, internalType: 'uint48', name: 'period', type: 'uint48' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        name: 'PlanUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            { indexed: true, internalType: 'address', name: 'token', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'Refunded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'uint256', name: 'planId', type: 'uint256' },
        ],
        name: 'SubscriptionCancelled',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'uint256', name: 'planId', type: 'uint256' },
            { indexed: false, internalType: 'uint48', name: 'expiredAt', type: 'uint48' },
        ],
        name: 'SubscriptionCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'uint256', name: 'planId', type: 'uint256' },
            { indexed: true, internalType: 'uint256', name: 'couponId', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            { indexed: false, internalType: 'uint48', name: 'expiredAt', type: 'uint48' },
        ],
        name: 'SubscriptionCreatedWithCoupon',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'uint256', name: 'oldPlanId', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'refundForOldPlan', type: 'uint256' },
            { indexed: true, internalType: 'uint256', name: 'newPlanId', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'payForNewPlan', type: 'uint256' },
            { indexed: false, internalType: 'uint48', name: 'expiredAt', type: 'uint48' },
        ],
        name: 'SubscriptionModified',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'uint256', name: 'planId', type: 'uint256' },
            { indexed: false, internalType: 'uint48', name: 'expiredAt', type: 'uint48' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'SubscriptionSynced',
        type: 'event',
    },
    {
        inputs: [],
        name: 'allPlans',
        outputs: [
            {
                components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint48', name: 'period', type: 'uint48' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                ],
                internalType: 'struct IHectorSubscription.Plan[]',
                name: '',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint48', name: 'period', type: 'uint48' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                ],
                internalType: 'struct IHectorSubscription.Plan[]',
                name: '_plans',
                type: 'tuple[]',
            },
        ],
        name: 'appendPlan',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
        ],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    { inputs: [], name: 'cancelSubscription', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    {
        inputs: [{ internalType: 'address', name: '_to', type: 'address' }],
        name: 'cancelSubscriptionByMod',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '_planId', type: 'uint256' }],
        name: 'createSubscription',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_planId', type: 'uint256' },
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'createSubscriptionByMod',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_planId', type: 'uint256' },
            { internalType: 'bytes', name: 'couponInfo', type: 'bytes' },
            { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        name: 'createSubscriptionWithCoupon',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'expireDeadline',
        outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '_planId', type: 'uint256' }],
        name: 'getPlan',
        outputs: [
            {
                components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint48', name: 'period', type: 'uint48' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                ],
                internalType: 'struct IHectorSubscription.Plan',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
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
    { inputs: [], name: 'initialize', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'moderators',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '_newPlanId', type: 'uint256' }],
        name: 'modifySubscription',
        outputs: [
            { internalType: 'uint256', name: 'oldPlanId', type: 'uint256' },
            { internalType: 'uint256', name: 'payForNewPlan', type: 'uint256' },
            { internalType: 'uint256', name: 'refundForOldPlan', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_to', type: 'address' },
            { internalType: 'uint256', name: '_newPlanId', type: 'uint256' },
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'modifySubscriptionByMod',
        outputs: [
            { internalType: 'uint256', name: 'oldPlanId', type: 'uint256' },
            { internalType: 'uint256', name: 'payForNewPlan', type: 'uint256' },
            { internalType: 'uint256', name: 'refundForOldPlan', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'plans',
        outputs: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint48', name: 'period', type: 'uint48' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'product',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address[]', name: '_tos', type: 'address[]' },
            { internalType: 'address[]', name: '_tokens', type: 'address[]' },
            { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
        ],
        name: 'refund',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '', type: 'address' },
            { internalType: 'address', name: '', type: 'address' },
        ],
        name: 'refundOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address[]', name: '_tokens', type: 'address[]' },
            { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
        ],
        name: 'refundToTreasury',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    {
        inputs: [
            { internalType: 'address', name: '_moderator', type: 'address' },
            { internalType: 'bool', name: '_approved', type: 'bool' },
        ],
        name: 'setModerator',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '_treasury', type: 'address' }],
        name: 'setTreasury',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'subscriptions',
        outputs: [
            { internalType: 'uint256', name: 'planId', type: 'uint256' },
            { internalType: 'uint48', name: 'expiredAt', type: 'uint48' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'from', type: 'address' }],
        name: 'syncSubscription',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address[]', name: 'froms', type: 'address[]' }],
        name: 'syncSubscriptions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '_planId', type: 'uint256' }],
        name: 'toCreateSubscription',
        outputs: [{ internalType: 'uint256', name: 'amountToDeposit', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_planId', type: 'uint256' },
            { internalType: 'bytes', name: 'couponInfo', type: 'bytes' },
            { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        name: 'toCreateSubscritpionWithCoupon',
        outputs: [{ internalType: 'uint256', name: 'amountToDeposit', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '_newPlanId', type: 'uint256' }],
        name: 'toModifySubscription',
        outputs: [{ internalType: 'uint256', name: 'amountToDeposit', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'treasury',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint48', name: '_expireDeadline', type: 'uint48' }],
        name: 'updateExpireDeadline',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_planId', type: 'uint256' },
            {
                components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint48', name: 'period', type: 'uint48' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                ],
                internalType: 'struct IHectorSubscription.Plan',
                name: '_plan',
                type: 'tuple',
            },
        ],
        name: 'updatePlan',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256[]', name: '_planIds', type: 'uint256[]' },
            {
                components: [
                    { internalType: 'address', name: 'token', type: 'address' },
                    { internalType: 'uint48', name: 'period', type: 'uint48' },
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
                    { internalType: 'bytes', name: 'data', type: 'bytes' },
                ],
                internalType: 'struct IHectorSubscription.Plan[]',
                name: '_plans',
                type: 'tuple[]',
            },
        ],
        name: 'updatePlans',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_token', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
        name: 'withdrawAll',
        outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];

let provider: ethers.providers.JsonRpcProvider;

const getProvider = () => {
    if (!provider) {
        provider = new ethers.providers.JsonRpcProvider(FANTOM.rpc[0]);
    }
    return provider;
};

let subscriptionsContract: ethers.Contract;

const getHectorCouponContract = () => {
    if (!subscriptionsContract) {
        subscriptionsContract = new ethers.Contract(
            '0x7DB0672cdB985a5F050B69d36BdE40304975349D', // FTM MAIN NET SUBSCRIPTIONS, TO BE CHANGED IN THE FUTURE TO BE DYNAMIC
            subscriptionsAbi,
            getProvider(),
        );
    }
    return subscriptionsContract;
};

export default async function () {
    try {
        getHectorCouponContract().on('*', async (event) => {
            if (event.event === 'SubscriptionCreatedWithCoupon') {
                const voucherId = event.args.couponId.toNumber();
                const findVoucher = await AdSpacesVoucherModel.findOne({ id: voucherId, redeemed: false });

                if (findVoucher) {
                    findVoucher.redeemed = true;
                    await findVoucher.save();

                    const coupon = await CouponModel.findById(findVoucher.generatedForCoupon);

                    if (coupon) {
                        coupon.results.voucherRedeemed += 1;
                        coupon.results.redeemers.push({
                            address: findVoucher.generatedForAddress,
                            redeemedAt: new Date(),
                            voucherUsed: findVoucher._id.toString(),
                            planId: event.args.planId.toNumber(),
                            userPaid: event.args.amount.toNumber(),
                        });
                        await coupon.save();
                    }
                }
            }
        });

        console.log('Vouchers Usage Monitor started.. Starting Sync..');

        // await SyncVouchersUsage(FANTOM.id);

        console.log('Vouchers Usage Monitor Sync Completed..');

    } catch (e) {
        console.log(e);
    }
    const command = spawn('node', [path.join(process.cwd() ,'src','cronJobs', 'taxReportData', 'utils', 'categorizes.js')], {
        detached: true,
        stdio: 'ignore'
      });

    command.unref();

}

/*
let evenWDAWt =  {
  blockNumber: 61860918,
  blockHash: '0x000331910000109829af271f541f63cf21ff6df2fe6896155e5c724a2453b836',
  transactionIndex: 0,
  removed: false,
  address: '0x7DB0672cdB985a5F050B69d36BdE40304975349D',
  data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064d12097',
  topics: [
    '0x1e258d2e2dc594456daa2232be1cb7ebc2d54465113f3d8175539d83f8f2f282',
    '0x00000000000000000000000045ce3ce7b4327ea4597ca6674168455155cee79e',
    '0x0000000000000000000000000000000000000000000000000000000000000002',
    '0x000000000000000000000000000000000000000000000000000000000000001d'
  ],
  transactionHash: '0x0755ca79dfbe6b9db2fde5918a78bc67528e1d0cf5f90da3b101b58b15dd044e',      
  logIndex: 2,
  removeListener: [Function (anonymous)],
  getBlock: [Function (anonymous)],
  getTransaction: [Function (anonymous)],
  getTransactionReceipt: [Function (anonymous)],
  event: 'SubscriptionCreatedWithCoupon',
  eventSignature: 'SubscriptionCreatedWithCoupon(address,uint256,uint256,uint256,uint48)',    
  decode: [Function (anonymous)],
  args: [
    '0x45ce3ce7b4327EA4597CA6674168455155cEE79E',
    BigNumber { _hex: '0x02', _isBigNumber: true },
    BigNumber { _hex: '0x1d', _isBigNumber: true },
    BigNumber { _hex: '0x00', _isBigNumber: true },
    1691426967,
    from: '0x45ce3ce7b4327EA4597CA6674168455155cEE79E',
    planId: BigNumber { _hex: '0x02', _isBigNumber: true },
    couponId: BigNumber { _hex: '0x1d', _isBigNumber: true },
    amount: BigNumber { _hex: '0x00', _isBigNumber: true },
    expiredAt: 1691426967
  ]
} */
