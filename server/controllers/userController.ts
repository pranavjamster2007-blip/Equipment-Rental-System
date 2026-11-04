/**
 * User Controller
 * CRUD operations for User management
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.ts';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search } = req.query;
    let users = await UserModel.find();

    if (role && role !== 'All') {
      users = users.filter((u: any) => u.role === role);
    }

    if (search) {
      const q = String(search).toLowerCase();
      users = users.filter((u: any) => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    // Strip password
    const safeUsers = users.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });

    res.status(200).json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const { password, ...safeUser } = user;
    res.status(200).json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'Customer', phone, address } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email is already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      address: address || '',
    });

    const { password: _, ...safeUser } = user;
    res.status(201).json({ success: true, message: 'User created successfully', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, phone, address, password } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await UserModel.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password: _, ...safeUser } = updated;
    res.status(200).json({ success: true, message: 'User updated successfully', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await UserModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};
