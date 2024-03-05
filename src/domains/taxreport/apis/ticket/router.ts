import { Router } from 'express';
import { createTicket } from './handlers/create';
import { deleteTickets } from './handlers/delete';
import { getTickets } from './handlers/get';

const ticketRouter = Router();

ticketRouter.post('/', createTicket);
ticketRouter.get('/', getTickets);
ticketRouter.delete('/', deleteTickets);

export default ticketRouter;
