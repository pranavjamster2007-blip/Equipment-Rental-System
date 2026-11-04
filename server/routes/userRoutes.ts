/**
 * User Routes
 * CRUD routes for User entity with role enforcement
 */

import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('Admin', 'Staff'), getAllUsers);
router.get('/:id', getUserById);
router.post('/', authorizeRoles('Admin'), createUser);
router.put('/:id', authorizeRoles('Admin'), updateUser);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);

export default router;
