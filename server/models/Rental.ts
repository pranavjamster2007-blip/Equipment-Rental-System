/**
 * Rental Mongoose Model
 * Represents active rental when equipment is picked up until it is returned
 */

import { collections } from '../config/db.ts';

export interface IRental {
  _id: string;
  rentalNumber: string;
  bookingId?: string;
  customerId: string;
  customerName: string;
  equipmentId: string;
  equipmentName: string;
  staffId: string;
  staffName: string;
  pickupDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string | null;
  status: 'Active' | 'Returned' | 'Overdue';
  initialDepositPaid: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export const RentalModel = {
  find: (query?: any) => collections.rentals.find(query),
  findById: (id: string) => collections.rentals.findById(id),
  findOne: (query: any) => collections.rentals.findOne(query),
  create: (data: Partial<IRental>) => collections.rentals.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IRental>) => collections.rentals.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.rentals.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.rentals.countDocuments(query),
};
