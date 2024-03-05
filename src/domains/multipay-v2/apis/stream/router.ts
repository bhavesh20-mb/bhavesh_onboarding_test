import { Router } from 'express';
import { createStream } from './handlers/create';
import { deleteStream } from './handlers/delete';
import { getStream, getStreams } from './handlers/get';
import { updateStream } from './handlers/update';

const streamsV2Router = Router();

streamsV2Router.get('/', getStreams);
streamsV2Router.get('/:id', getStream);
streamsV2Router.post('/', createStream);
streamsV2Router.put('/:id', updateStream);
streamsV2Router.delete('/:id', deleteStream);

export default streamsV2Router;
