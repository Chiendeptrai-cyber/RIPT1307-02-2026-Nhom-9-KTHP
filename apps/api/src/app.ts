import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/error-handler.middleware';

export function createApp(): express.Application {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
}
