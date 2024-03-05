import { Request, Response } from 'express';
import fetch from 'node-fetch';

import { FANTOM_MAINNET, FANTOM_TESTNET } from 'src/utils/chain';
import VoteFnftModel from 'src/database/models/votefnft.model';
import { IVotingFnftModel } from 'src/interfaces/dbModels';
import { ftmscanApiKey, VOTING_MAINNET, VOTING_TESTNET } from 'src/constants';
import { getVotingMethodDecode, getVoteDelayingTime } from 'src/constants/voting';
import { getCurrentTimeInSecond } from 'src/utils/util';

export default async function (req: Request, res: Response) {
    try {
        const params = req.query;

        if (params && params.voting) {
            const requestedContract = params.voting.toString().toLowerCase();
            if (
                requestedContract === VOTING_MAINNET.address.toLowerCase() ||
                requestedContract === VOTING_TESTNET.address.toLowerCase()
            ) {
                const isMainNet = requestedContract === VOTING_MAINNET.address.toLowerCase() ? true : false;

                const chain = isMainNet ? FANTOM_MAINNET : FANTOM_TESTNET;
                const votingContract = isMainNet ? VOTING_MAINNET : VOTING_TESTNET;
                const scanBaseURL = isMainNet ? 'https://api.ftmscan.com' : 'https://testnet.ftmscan.com';

                // get current voting contract delay time
                const voteDelayTimeData = await getVoteDelayingTime(chain, votingContract);
                let voteDelayTime = 604800;

                if (voteDelayTimeData.isOk && voteDelayTimeData.value.toNumber() > 0) {
                    voteDelayTime = voteDelayTimeData.value.toNumber();
                }

                // get current timestamp
                const currentTime = await getCurrentTimeInSecond();
                const startTimeStamp = currentTime - 6000; // 10 mins

                const originalInfo = await VoteFnftModel.find({
                    contract: votingContract.address.toLowerCase(),
                }).select('-_id -__v');

                const startBlockApiResult = await fetch(
                    `${scanBaseURL}/api?module=block&action=getblocknobytime&timestamp=${startTimeStamp}&closest=before&apikey=${ftmscanApiKey}`,
                ).then((res: any) => res.json());

                let startBlock = 0;
                if (startBlockApiResult?.message === 'OK') {
                    startBlock = startBlockApiResult.result;
                }

                let txHistories = await fetch(
                    `${scanBaseURL}/api?module=account&action=txlist&address=${votingContract.address}&startblock=${startBlock}&endblock=99999999&sort=asc&apikey=${ftmscanApiKey}`,
                ).then((res: any) => res.json());

                if (txHistories?.message === 'OK') {
                    txHistories = txHistories.result;
                } else {
                    txHistories = [];
                }

                const fnftVotingInfoFromHistories: IVotingFnftModel[] = [];

                txHistories.map((history: any) => {
                    if (history.txreceipt_status) {
                        let [fnftInfo, fnftIds] = getVotingMethodDecode(history);

                        if (fnftInfo?.value && fnftIds?.value) {
                            fnftIds?.value?.map((id: any) =>
                                fnftVotingInfoFromHistories.push({
                                    id,
                                    voter: history.from.toLowerCase(),
                                    fnftAddress: fnftInfo.value.toLowerCase(),
                                    endTime: parseInt(history.timeStamp) + voteDelayTime,
                                    contract: votingContract.address.toLowerCase(),
                                }),
                            );
                        }
                    }
                });

                const uniqueVotingInfos = fnftVotingInfoFromHistories.filter((voteInfo: any) => {
                    return (
                        originalInfo.filter((obj: any) => {
                            return (
                                obj.fnftAddress.toLowerCase() === voteInfo.fnftAddress.toLowerCase() &&
                                obj.voter.toLowerCase() === voteInfo.voter.toLowerCase() &&
                                obj.id === parseInt(voteInfo.id)
                            );
                        }).length == 0
                    );
                });

                await VoteFnftModel.insertMany(uniqueVotingInfos, { ordered: false });

                return res.status(200).json({
                    result: true,
                });
            } else {
                return res.status(400).json({
                    message: 'Passed voting contract address is not valid',
                });
            }
        } else {
            return res.status(400).json({
                message: 'Voting contract address was not passed',
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: 'Something went wrong...',
        });
    }
}
