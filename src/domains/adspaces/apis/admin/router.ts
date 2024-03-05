import { Router } from 'express';
import { createAnnouncement } from './handlers/createAnnouncement';
import { getAnnouncementsAdmin } from './handlers/getAnnouncementsAdmin';
import { updateAnnouncement } from './handlers/updateAnnouncement';

const provideAdminRouter = Router();

provideAdminRouter.post('/createAnnouncement', createAnnouncement);
provideAdminRouter.get('/getAnnouncements', getAnnouncementsAdmin);
provideAdminRouter.put('/updateAnnouncement/:id', updateAnnouncement);

export default provideAdminRouter;
