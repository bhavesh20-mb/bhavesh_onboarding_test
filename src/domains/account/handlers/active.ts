import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { setStatus, updateAccount } from './disable';
import AccountModel from 'src/database/models/account.model';
import { AccountStatus } from 'src/interfaces/dbModels';
import { getMessageForActiveAccount } from '../utils';

export default async function (req: Request, res: Response) {
    try {
        const { signature } = req.body;
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
            getMessageForActiveAccount(walletAddress, account.nonce),
            signature,
        );

        if (addressSigned.toLowerCase() === walletAddress.toLowerCase()) {
            // Check Permanently Disabled User
            if (account.status == AccountStatus.PermDisable) {
                return res.json({
                    success: false,
                    message: 'Account Permanently Disabled',
                });
            } else if (account.status == AccountStatus.TempDisable) {
                // Active Account for both of MultiPay & TaxReport
                let result = await setStatus(walletAddress, AccountStatus.Active);
                // Update Account
                result && await updateAccount(walletAddress, AccountStatus.Active);
                return res.json({
                    success: true,
                    message: 'Activated account successfully',
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


