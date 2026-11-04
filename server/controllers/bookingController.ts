/**
 * Booking Controller
 * Handles reservation workflow: create booking, calculate duration & totals, update status
 */

import { Response } from 'express';
import { BookingModel } from '../models/Booking.ts';
import { EquipmentModel } from '../models/Equipment.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let bookings = await BookingModel.find();

    // Role-based visibility
    if (user.role === 'Customer') {
      bookings = bookings.filter((b: any) => b.customerId === user._id || b.customerEmail === user.email);
    }

    const { status, search } = req.query;
    if (status && status !== 'All') {
      bookings = bookings.filter((b: any) => b.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      bookings = bookings.filter((b: any) =>
        b.bookingNumber.toLowerCase().includes(q) ||
        b.equipmentName.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q)
      );
    }

    // Sort by latest
    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Role check: customer can only view own booking
    if (req.user.role === 'Customer' && booking.customerId !== req.user._id && booking.customerEmail !== req.user.email) {
      res.status(403).json({ success: false, message: 'Access denied: not your booking' });
      return;
    }

    res.status(200).json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking', error: error.message });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { equipmentId, startDate, endDate, notes } = req.body;
    const user = req.user;

    if (!equipmentId || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Equipment, start date, and end date are required.' });
      return;
    }

    const equipment = await EquipmentModel.findById(equipmentId);
    if (!equipment) {
      res.status(404).json({ success: false, message: 'Equipment not found.' });
      return;
    }

    if (equipment.status !== 'Available') {
      res.status(400).json({
        success: false,
        message: `Equipment is currently ${equipment.status} and cannot be booked right now.`,
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      res.status(400).json({ success: false, message: 'End date must be on or after start date.' });
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const totalAmount = totalDays * equipment.dailyRate;
    const depositAmount = equipment.securityDeposit;

    const count = await BookingModel.countDocuments();
    const bookingNumber = `BK-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newBooking = await BookingModel.create({
      bookingNumber,
      customerId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      startDate,
      endDate,
      totalDays,
      totalAmount,
      depositAmount,
      status: 'Confirmed', // Automatically confirm or pending
      notes: notes || '',
    });

    // Mark equipment as booked
    await EquipmentModel.findByIdAndUpdate(equipment._id, { status: 'Booked' });

    res.status(201).json({
      success: true,
      message: 'Booking successfully reserved! Pickup details will be arranged.',
      booking: newBooking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status provided.' });
      return;
    }

    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const updated = await BookingModel.findByIdAndUpdate(req.params.id, { status });

    // If cancelled, make equipment Available again
    if (status === 'Cancelled') {
      await EquipmentModel.findByIdAndUpdate(booking.equipmentId, { status: 'Available' });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update booking status', error: error.message });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await BookingModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }
    // Release equipment
    if (deleted.equipmentId) {
      await EquipmentModel.findByIdAndUpdate(deleted.equipmentId, { status: 'Available' });
    }
    res.status(200).json({ success: true, message: 'Booking record deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete booking', error: error.message });
  }
};
