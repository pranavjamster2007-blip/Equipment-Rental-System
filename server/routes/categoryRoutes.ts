/**
 * Category Routes
 * Category CRUD operations
 */

import { Router } from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

// Publicly viewable for browsing
router.get('/', getAllCategories);

// Management restricted to Admin and Staff
router.post('/', authenticateJWT, authorizeRoles('Admin', 'Staff'), createCategory);
router.put('/:id', authenticateJWT, authorizeRoles('Admin', 'Staff'), updateCategory);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), deleteCategory);

export default router;
