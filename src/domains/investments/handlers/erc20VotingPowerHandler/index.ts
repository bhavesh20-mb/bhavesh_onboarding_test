import axios from 'axios';
import { Request, Response } from 'express';
import { FANTOM_HEC } from 'src/constants';
import { FANTOM } from 'src/utils/chain';
import { balanceOf } from 'src/utils/contracts/erc20';

const endpoint = 'https://api.studio.thegraph.com/query/48138/hector-voting-ftm-subgraph/version/latest';
const query = `
query ($token: String!, $userIn: [String]! $createdTimestamp: Int!, $first: Int!) {
  balances(
    where: {token: $token, user_in: $userIn, createdTimestamp_gt: $createdTimestamp}
    orderBy: createdTimestamp
    orderDirection: asc
    first: $first
  ) {
    user {
      address
    }
    balanceAfterBlockedDate
    createdTimestamp
  }
}
`;

type BalanceUser = {
    user: { address: string };
    balanceAfterBlockedDate: number;
    createdTimestamp: number;
};

const fetchQuery = (query: string, variables: { [key: string]: any }, endpoint: string) => {
    return axios.post(endpoint, { query, variables });
};

export default async function (req: Request, res: Response) {
    try {
        const token: string = req.query?.token as string;
        const { addresses } = req.body;
        const arrayAddresses: string[] = typeof addresses === 'string' ? JSON.parse(addresses) : addresses;
        if (token && arrayAddresses && arrayAddresses.length > 0) {
            if (token.toLowerCase() === FANTOM_HEC.address.toLowerCase()) {
                const userIn = arrayAddresses.map((address) => address.toLowerCase());
                let createdTimestamp = 0;
                const perPage = 500;
                const result: { score: { score: number; address: string }[] } = { score: [] };

                const { data } = await fetchQuery(
                    query,
                    {
                        token: token.toLowerCase(),
                        userIn: userIn,
                        createdTimestamp: createdTimestamp,
                        first: perPage,
                    },
                    endpoint,
                );

                for (let i = 0; i < arrayAddresses.length; i++) {
                    const currentHolding = await balanceOf(FANTOM, FANTOM_HEC, arrayAddresses[i]);
                    let withDecimal: number = 0;
                    if (currentHolding.isOk) {
                        withDecimal = currentHolding.value.toNumber() * 10 ** 9;
                    } else throw new Error('Error: got error when call HEC contract');
                    const blockedBalance: BalanceUser = data.data?.balances?.find(
                        (balance: BalanceUser) =>
                            balance.user.address.toLowerCase() === arrayAddresses[i].toLowerCase(),
                    );

                    if (blockedBalance && blockedBalance.balanceAfterBlockedDate > 0) {
                        const balanceAfterBlockedDate = blockedBalance.balanceAfterBlockedDate;
                        const score: number =
                            balanceAfterBlockedDate >= withDecimal ? 0 : withDecimal - balanceAfterBlockedDate;
                        result.score.push({ score, address: arrayAddresses[i] });
                    } else {
                        result.score.push({ score: withDecimal, address: arrayAddresses[i] });
                    }
                }

                return res.json(result);
            }
        } else {
            throw new Error('Error: required params are not valid');
        }
    } catch (e: any) {
        return res.status(500).json({
            message: e.message || 'Something went wrong...',
        });
    }
}
