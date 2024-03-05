import syncSubscription from './syncSubscriptions';
import pauseStreams from './pauseStreams';
import resumeStreams from './resumeStreams';
import { CHAINS, FANTOM } from 'src/utils/chain';

export default async function () {
    try {
        for (let i = 0; i < CHAINS.length; i++) {
            console.log("Start MultiPay CronJob...\n");
            console.log("Chain:", CHAINS[i].shortName);
            await syncSubscription(CHAINS[i].id);
            // await pauseStreams(CHAINS[i].id);
            // await resumeStreams(CHAINS[i].id);
        }
    } catch (e) {
        console.log(e)
    }
}
