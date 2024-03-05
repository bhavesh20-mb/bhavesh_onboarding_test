import { Router } from 'express';
import { createStream } from './handlers/create';
import { deleteStream } from './handlers/delete';
import { getStream, getStreams } from './handlers/get';
import { updateStream } from './handlers/update';

const streamsRouter = Router();

streamsRouter.get('/', getStreams);
streamsRouter.get('/:id', getStream);
streamsRouter.post('/', createStream);
streamsRouter.put('/:id', updateStream);
streamsRouter.delete('/:id', deleteStream);

export default streamsRouter;
