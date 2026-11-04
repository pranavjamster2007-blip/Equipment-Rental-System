/**
 * Payment Mongoose Model
 * Tracks rental fees, security deposits, refunds and damage penalty fees
 */

import { collections } from '../config/db.ts';

export interface IPayment {
  _id: string;
  paymentNumber: string;
  bookingId?: string;
  rentalId?: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentType: 'Deposit' | 'Rental Fee' | 'Damage Fee' | 'Refund';
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  transactionId?: string;
  paymentDate: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export const PaymentModel = {
  find: (query?: any) => collections.payments.find(query),
  findById: (id: string) => collections.payments.findById(id),
  findOne: (query: any) => collections.payments.findOne(query),
  create: (data: Partial<IPayment>) => collections.payments.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IPayment>) => collections.payments.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => collections.payments.findByIdAndDelete(id),
  countDocuments: (query?: any) => collections.payments.countDocuments(query),
};
