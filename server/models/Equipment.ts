/**
 * Equipment Mongoose Model
 * Represents rentable equipment inventory with pricing and availability status
 */

import { collections } from '../config/db.ts';

export interface IEquipment {
  _id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  modelNumber: string;
  serialNumber: string;
  dailyRate: number;
  securityDeposit: number;
  status: 'Available' | 'Booked' | 'Rented' | 'Maintenance';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const EquipmentModel = {
  find: (query?: any) => collections.equipment.find(query),
  findById: (id: string) => collections.equipment.findById(id),
  findOne: (query: any) => collections.equipment.findOne(query),
  create: (data: Partial<IEquipment>) => collections.equipment.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IEquipment>) => collections.equipment.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.equipment.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.equipment.countDocuments(query),
};
