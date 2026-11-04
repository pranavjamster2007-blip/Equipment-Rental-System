/**
 * Rental Routes
 * Pickup, checkout return, and rental monitoring
 */

import { Router } from 'express';
import {
  getAllRentals,
  getRentalById,
  processPickup,
  processReturn,
} from '../controllers/rentalController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllRentals);
router.get('/:id', getRentalById);
router.post('/pickup', authorizeRoles('Admin', 'Staff'), processPickup);
router.post('/:id/return', authorizeRoles('Admin', 'Staff'), processReturn);

export default router;
