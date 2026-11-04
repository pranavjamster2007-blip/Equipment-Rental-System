/**
 * Booking Routes
 * Booking creation and management
 */

import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id/status', authorizeRoles('Admin', 'Staff'), updateBookingStatus);
router.delete('/:id', authorizeRoles('Admin', 'Staff'), deleteBooking);

export default router;
