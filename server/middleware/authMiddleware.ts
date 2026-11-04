/**
 * JWT Authentication Middleware
 * Validates JSON Web Token from Authorization header and attaches req.user
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'college_equipment_rental_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };

    let user = await UserModel.findById(decoded.id);
    if (!user && decoded.email) {
      user = await UserModel.findOne({ email: decoded.email.toLowerCase() });
    }
    if (!user) {
      res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
      return;
    }

    // Omit password from req.user
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.', error: error.message });
  }
};
