/**
 * Payment Controller
 * Manages deposits, rental fees, damage compensations, and refunds
 */

import { Response } from 'express';
import { PaymentModel } from '../models/Payment.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const getAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let payments = await PaymentModel.find();

    if (user.role === 'Customer') {
      payments = payments.filter((p: any) => p.customerId === user._id);
    }

    const { type, search } = req.query;
    if (type && type !== 'All') {
      payments = payments.filter((p: any) => p.paymentType === type);
    }

    if (search) {
      const q = String(search).toLowerCase();
      payments = payments.filter((p: any) =>
        p.paymentNumber.toLowerCase().includes(q) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
        p.customerName.toLowerCase().includes(q)
      );
    }

    payments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
};

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      bookingId,
      rentalId,
      customerId,
      customerName,
      amount,
      paymentType = 'Rental Fee',
      paymentMethod = 'UPI',
      remarks,
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'A valid payment amount is required.' });
      return;
    }

    const count = await PaymentModel.countDocuments();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const transactionId = `TXN-${Date.now().toString().slice(-8)}`;
    const paymentDate = new Date().toISOString().split('T')[0];

    const payment = await PaymentModel.create({
      paymentNumber,
      bookingId: bookingId || '',
      rentalId: rentalId || '',
      customerId: customerId || req.user._id,
      customerName: customerName || req.user.name,
      amount: Number(amount),
      paymentType,
      paymentMethod,
      status: 'Completed',
      transactionId,
      paymentDate,
      remarks: remarks || '',
    });

    res.status(201).json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully!`,
      payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
};
