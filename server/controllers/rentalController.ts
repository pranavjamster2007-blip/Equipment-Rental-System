/**
 * Rental Controller
 * Manages physical equipment lifecycle: Pickup handover, Active rental monitoring, Return checkout
 */

import { Response } from 'express';
import { RentalModel } from '../models/Rental.ts';
import { EquipmentModel } from '../models/Equipment.ts';
import { BookingModel } from '../models/Booking.ts';
import { PaymentModel } from '../models/Payment.ts';
import { InspectionModel } from '../models/Inspection.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const getAllRentals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let rentals = await RentalModel.find();

    if (user.role === 'Customer') {
      rentals = rentals.filter((r: any) => r.customerId === user._id);
    }

    const { status, search } = req.query;
    if (status && status !== 'All') {
      rentals = rentals.filter((r: any) => r.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      rentals = rentals.filter((r: any) =>
        r.rentalNumber.toLowerCase().includes(q) ||
        r.equipmentName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q)
      );
    }

    rentals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, count: rentals.length, rentals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch rentals', error: error.message });
  }
};

export const getRentalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rental = await RentalModel.findById(req.params.id);
    if (!rental) {
      res.status(404).json({ success: false, message: 'Rental record not found' });
      return;
    }

    if (req.user.role === 'Customer' && rental.customerId !== req.user._id) {
      res.status(403).json({ success: false, message: 'Access denied: not your rental' });
      return;
    }

    res.status(200).json({ success: true, rental });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch rental', error: error.message });
  }
};

export const processPickup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      bookingId,
      customerId,
      customerName,
      equipmentId,
      expectedReturnDate,
      initialDepositPaid,
      remarks,
      conditionRating = 'Excellent',
      damageNotes = 'No pre-existing damages noted during handover inspection.',
    } = req.body;

    const staff = req.user;

    if (!equipmentId || !customerId || !expectedReturnDate) {
      res.status(400).json({
        success: false,
        message: 'Equipment, Customer, and Expected Return Date are required for pickup dispatch.',
      });
      return;
    }

    const equipment = await EquipmentModel.findById(equipmentId);
    if (!equipment) {
      res.status(404).json({ success: false, message: 'Equipment not found' });
      return;
    }

    const pickupDate = new Date().toISOString().split('T')[0];
    const count = await RentalModel.countDocuments();
    const rentalNumber = `RN-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // 1. Create Rental record
    const rental = await RentalModel.create({
      rentalNumber,
      bookingId: bookingId || '',
      customerId,
      customerName: customerName || 'Customer',
      equipmentId,
      equipmentName: equipment.name,
      staffId: staff._id,
      staffName: staff.name,
      pickupDate,
      expectedReturnDate,
      actualReturnDate: null,
      status: 'Active',
      initialDepositPaid: Number(initialDepositPaid || equipment.securityDeposit),
      remarks: remarks || 'Equipment checked out by staff and handed to customer.',
    });

    // 2. Mark equipment as Rented
    await EquipmentModel.findByIdAndUpdate(equipmentId, { status: 'Rented' });

    // 3. Mark booking as Completed/Active if linked
    if (bookingId) {
      await BookingModel.findByIdAndUpdate(bookingId, { status: 'Completed' });
    }

    // 4. Create Pickup Inspection log
    await InspectionModel.create({
      rentalId: rental._id,
      equipmentId: equipment._id,
      equipmentName: equipment.name,
      inspectorId: staff._id,
      inspectorName: staff.name,
      inspectionType: 'Pickup',
      conditionRating,
      damageNotes,
      repairCostEstimate: 0,
      cleanState: true,
      approved: true,
    });

    // 5. Create Payment record for deposit if paid
    if (initialDepositPaid && Number(initialDepositPaid) > 0) {
      const payCount = await PaymentModel.countDocuments();
      await PaymentModel.create({
        paymentNumber: `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(3, '0')}`,
        bookingId: bookingId || '',
        rentalId: rental._id,
        customerId,
        customerName: customerName || 'Customer',
        amount: Number(initialDepositPaid),
        paymentType: 'Deposit',
        paymentMethod: 'Cash',
        status: 'Completed',
        transactionId: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentDate: pickupDate,
        remarks: 'Security deposit collected at pickup counter',
      });
    }

    res.status(201).json({
      success: true,
      message: `Pickup handover completed successfully! Rental ${rentalNumber} is now Active.`,
      rental,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process pickup', error: error.message });
  }
};

export const processReturn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      actualReturnDate,
      conditionRating = 'Good',
      damageNotes,
      repairCostEstimate = 0,
      refundDeposit = true,
      remarks,
    } = req.body;

    const rentalId = req.params.id;
    const rental = await RentalModel.findById(rentalId);

    if (!rental) {
      res.status(404).json({ success: false, message: 'Rental record not found' });
      return;
    }

    if (rental.status === 'Returned') {
      res.status(400).json({ success: false, message: 'This rental has already been returned.' });
      return;
    }

    const returnDate = actualReturnDate || new Date().toISOString().split('T')[0];
    const staff = req.user;

    // 1. Update Rental
    const updatedRental = await RentalModel.findByIdAndUpdate(rentalId, {
      status: 'Returned',
      actualReturnDate: returnDate,
      remarks: remarks ? `${rental.remarks || ''} | Return: ${remarks}` : rental.remarks,
    });

    // 2. Equipment status & condition
    const newStatus = conditionRating === 'Damaged' ? 'Maintenance' : 'Available';
    await EquipmentModel.findByIdAndUpdate(rental.equipmentId, {
      status: newStatus,
      condition: conditionRating,
    });

    // 3. Create Return Inspection record
    const hasDamage = conditionRating === 'Damaged' || Number(repairCostEstimate) > 0;
    await InspectionModel.create({
      rentalId: rental._id,
      equipmentId: rental.equipmentId,
      equipmentName: rental.equipmentName,
      inspectorId: staff._id,
      inspectorName: staff.name,
      inspectionType: 'Return',
      conditionRating,
      damageNotes: damageNotes || (hasDamage ? 'Damage recorded during return inspection.' : 'Item returned in normal working order.'),
      repairCostEstimate: Number(repairCostEstimate || 0),
      cleanState: !hasDamage,
      approved: !hasDamage,
    });

    // 4. Create damage payment deduction if damaged
    if (Number(repairCostEstimate) > 0) {
      const payCount = await PaymentModel.countDocuments();
      await PaymentModel.create({
        paymentNumber: `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(3, '0')}`,
        rentalId: rental._id,
        customerId: rental.customerId,
        customerName: rental.customerName,
        amount: Number(repairCostEstimate),
        paymentType: 'Damage Fee',
        paymentMethod: 'Cash',
        status: 'Completed',
        transactionId: `DMG-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentDate: returnDate,
        remarks: `Damage assessment repair deduction for ${rental.equipmentName}: ${damageNotes || ''}`,
      });
    }

    // 5. Refund deposit if requested and deposit was paid
    if (refundDeposit && rental.initialDepositPaid > 0) {
      const refundAmount = Math.max(0, rental.initialDepositPaid - Number(repairCostEstimate || 0));
      if (refundAmount > 0) {
        const payCount = await PaymentModel.countDocuments();
        await PaymentModel.create({
          paymentNumber: `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(3, '0')}`,
          rentalId: rental._id,
          customerId: rental.customerId,
          customerName: rental.customerName,
          amount: refundAmount,
          paymentType: 'Refund',
          paymentMethod: 'Cash',
          status: 'Completed',
          transactionId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate: returnDate,
          remarks: `Deposit refund processed upon equipment return checkout.`,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Equipment return process and checkout inspection logged successfully!',
      rental: updatedRental,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process return', error: error.message });
  }
};
