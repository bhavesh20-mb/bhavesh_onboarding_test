import { Request, Response } from 'express';
import { checkAccountStatus } from '../common';
import AccountModel from 'src/database/models/account.model';
import { ObjectID } from './create';
import { ethers } from 'ethers';
import { AccountStatus, enmUserStatus } from 'src/interfaces/dbModels';
import { getMessageForDisableAccount } from '../utils';
import UserModel from 'src/database/models/user.model';

export default async function (req: Request, res: Response) {
    try {
        const { signature, isTempDisable } = req.body;
        const { walletAddress } = req.params;

        const account = await AccountModel.findOne({ walletAddress: walletAddress });

        if (!account) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Account not found',
                },
            });
        }

        const addressSigned = ethers.utils.verifyMessage(
            getMessageForDisableAccount(walletAddress, account.nonce),
            signature,
        );

        if (addressSigned.toLowerCase() === walletAddress.toLowerCase()) {
            // check user's on-chain process at the moment
            let status = await checkAccountStatus(walletAddress);
            if (status.status) {
                // Disable Account for both of MultiPay & TaxReport
                let result = await setStatus(
                    walletAddress,
                    isTempDisable ? AccountStatus.TempDisable : AccountStatus.PermDisable,
                );
                // Update Account
                result &&
                    (await updateAccount(
                        walletAddress,
                        isTempDisable ? AccountStatus.TempDisable : AccountStatus.PermDisable,
                    ));
                return res.json({
                    success: true,
                    message: isTempDisable ? 'Disabled account temporally' : 'Disabled account permanently',
                });
            } else {
                return res.json({
                    success: false,
                    message: isTempDisable ? 'Failed disable account temporally' : 'Failed disable account permanently',
                });
            }
        } else {
            return res.json({
                success: false,
                message: 'Failed diSecurity signature mismatch detected',
            });
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e || 'Something went wrong...',
        });
    }
}

export const updateAccount = async (walletAddress: string, status: number) => {
    try {
        let user = await AccountModel.findOne({
            walletAddress: walletAddress,
        });

        const account = await AccountModel.findOneAndUpdate({ _id: ObjectID(user!._id) }, { status: status });
    } catch (e) {
        return { success: false, error: { message: 'Something went wrong!' } };
    }
};

export const setStatus = async (walletAddress: string, status: AccountStatus): Promise<boolean> => {
    try {
        // Delete User
        const payer = await UserModel.findOne({
            walletAddress: walletAddress,
        });

        if (payer && payer.status === enmUserStatus.Active) {
            await UserModel.updateOne(
                {
                    _id: ObjectID(payer._id),
                },
                { status: getUserStatusFromAccountStatus(status) },
            );
        }

        return true;
    } catch (error: any) {
        return false;
    }
};

const getUserStatusFromAccountStatus = (status: AccountStatus) => {
    switch (status) {
        case AccountStatus.Active:
            return enmUserStatus.Active;
        case AccountStatus.TempDisable:
            return enmUserStatus.TempDisabled;
        case AccountStatus.PermDisable:
            return enmUserStatus.PermDisabled;
        default:
            return enmUserStatus.Active;
    }
};
