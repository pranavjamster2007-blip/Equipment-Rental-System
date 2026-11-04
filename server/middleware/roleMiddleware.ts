/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permissions for: Admin, Staff, Customer
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.ts';

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. User not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Role '${req.user.role}' cannot perform this action. Required: ${roles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};
