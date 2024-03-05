import fetch from 'node-fetch';
import { FANTOM_MAINNET } from 'src/utils/chain';
import { getCurrentTimeInSecond } from 'src/utils/util';
import { ftmscanApiKey, VOTING_MAINNET } from 'src/constants';
import { getVotingMethodDecode, getVoteDelayingTime } from 'src/constants/voting';
import { IVotingFnftModel } from 'src/interfaces/dbModels';
import VoteFnftModel from 'src/database/models/votefnft.model';

export default async function () {
    try {
        // get current voting contract delay time
        const voteDelayTimeData = await getVoteDelayingTime(FANTOM_MAINNET, VOTING_MAINNET);
        let voteDelayTime = 604800;

        if (voteDelayTimeData.isOk && voteDelayTimeData.value.toNumber() > 0) {
            voteDelayTime = voteDelayTimeData.value.toNumber();
        }

        // get current timestamp
        const currentTime = await getCurrentTimeInSecond();
        const startTimeStamp = currentTime - voteDelayTime; // 7 days

        await VoteFnftModel.deleteMany({
            endTime: { $lt: currentTime },
            contract: VOTING_MAINNET.address.toLowerCase(),
        });

        const originalInfo = await VoteFnftModel.find({ contract: VOTING_MAINNET.address.toLowerCase() }).select(
            '-_id -__v',
        );

        const startBlockApiResult = await fetch(
            `https://api.ftmscan.com/api?module=block&action=getblocknobytime&timestamp=${startTimeStamp}&closest=before&apikey=${ftmscanApiKey}`,
        ).then((res: any) => res.json());

        let startBlock = 0;
        if (startBlockApiResult?.message === 'OK') {
            startBlock = startBlockApiResult.result;
        }

        let txHistories = await fetch(
            `https://api.ftmscan.com/api?module=account&action=txlist&address=${VOTING_MAINNET.address}&startblock=${startBlock}&endblock=99999999&sort=asc&apikey=${ftmscanApiKey}`,
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
                            contract: VOTING_MAINNET.address.toLowerCase(),
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
    } catch (error) {
        console.log(error);
    }
}
