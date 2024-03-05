import { Request, Response } from 'express';
import ContractModel from 'src/database/models/contract.model';

interface ContractInfo {
    contract: Object;
    type: string;
    status: string;
}

const isVaild = (data: ContractInfo[]) => {
    if (!data || data.length === 0 || data.length === undefined) return false;
    for (let i = 0; i < data.length; i++) {
        if (
            !data[i].contract ||
            !data[i].type ||
            (data[i].type !== 'Bonding' && data[i].type !== 'LockFarm') ||
            !data[i].status ||
            (data[i].status !== 'active' && data[i].status !== 'inactive')
        ) {
            return false;
        }
    }

    return true;
};

export default async function (req: Request, res: Response) {
    try {
        const inputData = req.body;

        if (!isVaild(inputData)) {
            return res.status(400).json({
                message: 'Wrong input data...',
            });
        }

        const dataToInsert = inputData.map((item: ContractInfo) => {
            return {
                ...item,
                dateAdded: new Date(),
            };
        });

        try {
            await ContractModel.insertMany(dataToInsert).then((response) => {
                return res.json({
                    message: 'New contracts added successfully',
                });
            });
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
