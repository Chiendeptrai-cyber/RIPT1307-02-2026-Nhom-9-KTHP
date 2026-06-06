import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/app.error';
import type { ApiResponse } from '@equipment-mgmt/shared';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
      code: err.code,
    } satisfies ApiResponse);
    return;
  }

  console.error('[Unhandled Error]', err.message, err.stack);
  res.status(500).json({
    success: false,
    data: null,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  } satisfies ApiResponse);
}
