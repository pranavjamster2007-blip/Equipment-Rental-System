/**
 * Booking Mongoose Model
 * Represents customer reservation for equipment
 */

import { collections } from '../config/db.ts';

export interface IBooking {
  _id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  depositAmount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const BookingModel = {
  find: (query?: any) => collections.bookings.find(query),
  findById: (id: string) => collections.bookings.findById(id),
  findOne: (query: any) => collections.bookings.findOne(query),
  create: (data: Partial<IBooking>) => collections.bookings.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IBooking>) => collections.bookings.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.bookings.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.bookings.countDocuments(query),
};
