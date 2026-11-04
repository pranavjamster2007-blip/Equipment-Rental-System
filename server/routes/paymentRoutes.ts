/**
 * Payment Routes
 * Payment records, deposit transactions, and receipts
 */

import { Router } from 'express';
import {
  getAllPayments,
  createPayment,
} from '../controllers/paymentController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllPayments);
router.post('/', authorizeRoles('Admin', 'Staff', 'Customer'), createPayment);

export default router;
