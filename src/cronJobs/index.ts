import { CronJob } from 'cron';
import populateInvestmentsData from './populateInvestmentsData';
import fnftData from './fnftData';
import votingData from './votingData';
import bondingFarmData from './bondingFarmData';
import multiPayData from './multiPayData';
import epFarmData from './epFarmData';
import taxReportData from './taxReportData';

export const investmentsCronJob = new CronJob('10 50 * * * *', () => {
    populateInvestmentsData();
});

export const fnftCronJob = new CronJob('30 */2 * * * *', () => {
    fnftData();
});

export const votingCronJob = new CronJob('0 */2 * * * *', () => {
    votingData();
});

export const bondingFarmCronJob = new CronJob('15 */3 * * * *', () => {
    bondingFarmData();
});

export const multiPayCronJob = new CronJob('5 */2 * * * *', () => {
    multiPayData();
});

export const epFarmCronJob = new CronJob('45 */3 * * * *', () => {
    epFarmData();
});

export const taxReportCronJob = new CronJob('30 */2 * * * *', () => {
    taxReportData();
});
