import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/error-handler.middleware';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
}
