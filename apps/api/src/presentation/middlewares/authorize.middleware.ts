import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../../domain/errors/forbidden.error';
import { UserRole } from '@equipment-mgmt/shared';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
