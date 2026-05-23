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

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    data: null,
    message: 'Internal server error',
  } satisfies ApiResponse);
}
