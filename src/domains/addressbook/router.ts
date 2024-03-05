import { Router } from 'express';
import { createAccount } from './handlers/create';
import { getBook } from './handlers/get';
import { updateAccount } from './handlers/update';
import { deleteAccount } from './handlers/delete';
import { createGroup } from './handlers/createGroup';
import { getGroup } from './handlers/getGruops';
import { updateGroup } from './handlers/updateGroup';
import { deleteGroup } from './handlers/deleteGroup';

const addressBookRouter = Router();

addressBookRouter.get('/:walletAddress', getBook);
addressBookRouter.post('/group/update', updateGroup);
addressBookRouter.post('/group/delete', deleteGroup);
addressBookRouter.get('/group/:walletAddress', getGroup);
addressBookRouter.post('/group/create', createGroup);
addressBookRouter.post('/create', createAccount);
addressBookRouter.post('/update', updateAccount);
addressBookRouter.post('/delete', deleteAccount);

export default addressBookRouter;
