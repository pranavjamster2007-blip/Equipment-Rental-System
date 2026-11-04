/**
 * Equipment Routes
 * Equipment inventory search, view, and CRUD
 */

import { Router } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipmentController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

// Viewing equipment is accessible to customers & all logged-in/public visitors
router.get('/', getAllEquipment);
router.get('/:id', getEquipmentById);

// Modifications require Admin or Staff role
router.post('/', authenticateJWT, authorizeRoles('Admin', 'Staff'), createEquipment);
router.put('/:id', authenticateJWT, authorizeRoles('Admin', 'Staff'), updateEquipment);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), deleteEquipment);

export default router;
