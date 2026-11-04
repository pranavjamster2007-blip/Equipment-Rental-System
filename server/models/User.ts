/**
 * User Mongoose Model
 * Represents system users: Admin, Staff, and Customer
 */

import { collections } from '../config/db.ts';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Staff' | 'Customer';
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export const UserModel = {
  find: (query?: any) => collections.users.find(query),
  findById: (id: string) => collections.users.findById(id),
  findOne: (query: any) => collections.users.findOne(query),
  create: (data: Partial<IUser>) => collections.users.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IUser>) => collections.users.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.users.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.users.countDocuments(query),
};
