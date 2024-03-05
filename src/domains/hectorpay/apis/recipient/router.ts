import { Router } from 'express';
import { createRecipient, importRecipients } from './handlers/create';
import { deleteRecipient } from './handlers/delete';
import { getRecipient, getRecipients, getRecipientsAmount } from './handlers/get';
import { updateRecipient } from './handlers/update';

const recipientsRouter = Router();

recipientsRouter.get('/', getRecipients);
recipientsRouter.get('/getAmount', getRecipientsAmount);
recipientsRouter.get('/:id', getRecipient);
recipientsRouter.post('/', createRecipient);
recipientsRouter.post('/import', importRecipients);
recipientsRouter.put('/:id', updateRecipient);
recipientsRouter.delete('/:id', deleteRecipient);

export default recipientsRouter;
