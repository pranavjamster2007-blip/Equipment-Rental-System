/**
 * Auth Controller
 * Handles student/staff/admin registration, login with bcrypt & JWT issuance
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'college_equipment_rental_jwt_secret_key_2026';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'Customer', phone, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required fields.' });
      return;
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ['Admin', 'Staff', 'Customer'].includes(role) ? role : 'Customer',
      phone: phone || '',
      address: address || '',
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Equipment Rental System.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.status(200).json({
      success: true,
      message: `Login successful! Welcome back, ${user.name} (${user.role}).`,
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    res.status(200).json({ success: true, user: req.user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.', error: error.message });
  }
};
