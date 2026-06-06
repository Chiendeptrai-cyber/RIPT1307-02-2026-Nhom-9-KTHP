import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { router } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/error-handler.middleware';

export function createApp(): express.Application {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors({ origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  const uploadDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
  app.use('/api/v1/uploads', express.static(path.resolve(uploadDir)));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', router);
  app.use(errorHandler);

  return app;
}
