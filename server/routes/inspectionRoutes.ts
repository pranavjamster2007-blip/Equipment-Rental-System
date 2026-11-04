/**
 * Inspection Routes
 * Equipment condition and damage inspection logs
 */

import { Router } from 'express';
import {
  getAllInspections,
  createInspection,
} from '../controllers/inspectionController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('Admin', 'Staff'), getAllInspections);
router.post('/', authorizeRoles('Admin', 'Staff'), createInspection);

export default router;
