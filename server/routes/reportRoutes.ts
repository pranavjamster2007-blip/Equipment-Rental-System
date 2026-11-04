/**
 * Report Routes
 * Summary dashboards and project analytics
 */

import { Router } from 'express';
import { getDashboardSummary } from '../controllers/reportController.ts';
import { authenticateJWT } from '../middleware/authMiddleware.ts';
import { authorizeRoles } from '../middleware/roleMiddleware.ts';

const router = Router();

router.use(authenticateJWT);
router.get('/dashboard', authorizeRoles('Admin', 'Staff'), getDashboardSummary);

export default router;
