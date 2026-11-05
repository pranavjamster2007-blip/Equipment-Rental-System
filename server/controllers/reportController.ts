/**
 * Report Controller
 * Generates college project summary metrics, revenue analytics, and inventory utilization reports
 */

import { Response } from 'express';
import { EquipmentModel } from '../models/Equipment.ts';
import { BookingModel } from '../models/Booking.ts';
import { RentalModel } from '../models/Rental.ts';
import { PaymentModel } from '../models/Payment.ts';
import { UserModel } from '../models/User.ts';
import { InspectionModel } from '../models/Inspection.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allEquipment = await EquipmentModel.find();
    const allBookings = await BookingModel.find();
    const allRentals = await RentalModel.find();
    const allPayments = await PaymentModel.find();
    const allUsers = await UserModel.find();
    const allInspections = await InspectionModel.find();

    // Equipment Status Breakdown
    const availableCount = allEquipment.filter((e: any) => e.status === 'Available').length;
    const rentedCount = allEquipment.filter((e: any) => e.status === 'Rented').length;
    const bookedCount = allEquipment.filter((e: any) => e.status === 'Booked').length;
    const maintenanceCount = allEquipment.filter((e: any) => e.status === 'Maintenance').length;

    // Financial calculations
    const rentalRevenue = allPayments
      .filter((p: any) => p.paymentType === 'Rental Fee')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const depositsCollected = allPayments
      .filter((p: any) => p.paymentType === 'Deposit')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const damageFeesCollected = allPayments
      .filter((p: any) => p.paymentType === 'Damage Fee')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const refundsProcessed = allPayments
      .filter((p: any) => p.paymentType === 'Refund')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const netRevenue = rentalRevenue + damageFeesCollected;

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    for (const eq of allEquipment) {
      const cat = eq.categoryName || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    const categoryStats = Object.keys(categoryMap).map(name => ({
      category: name,
      count: categoryMap[name],
    }));

    const user = req.user;
    const isCustomer = user?.role === 'Customer';

    // Bookings & Rentals filtering by role
    const customerBookings = isCustomer
      ? allBookings.filter((b: any) => b.customerId === user._id || b.customerEmail === user.email)
      : allBookings;

    const customerRentals = isCustomer
      ? allRentals.filter((r: any) => r.customerId === user._id)
      : allRentals;

    // Recent activity (latest 5 bookings & rentals)
    const recentBookings = customerBookings
      .slice(-5)
      .reverse();

    const recentRentals = customerRentals
      .slice(-5)
      .reverse();

    const activeRentalsCount = isCustomer
      ? customerRentals.filter((r: any) => r.status === 'Active').length
      : allRentals.filter((r: any) => r.status === 'Active').length;

    const pendingBookingsCount = isCustomer
      ? customerBookings.filter((b: any) => b.status === 'Pending').length
      : allBookings.filter((b: any) => b.status === 'Pending').length;

    res.status(200).json({
      success: true,
      stats: {
        totalEquipment: allEquipment.length,
        availableCount,
        rentedCount,
        bookedCount,
        maintenanceCount,
        totalCustomers: allUsers.filter((u: any) => u.role === 'Customer').length,
        activeRentals: activeRentalsCount,
        pendingBookings: pendingBookingsCount,
        totalInspections: allInspections.length,
        financials: {
          rentalRevenue,
          depositsCollected,
          damageFeesCollected,
          refundsProcessed,
          netRevenue,
        },
      },
      categoryStats,
      recentBookings,
      recentRentals,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to compile dashboard reports', error: error.message });
  }
};
