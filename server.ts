/**
 * Equipment Rental System - Main Full Stack Server Entry
 * ExpressJS Backend with Vite middleware mounting for unified dev server on port 3000
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/config/db.ts';
import authRoutes from './server/routes/authRoutes.ts';
import userRoutes from './server/routes/userRoutes.ts';
import categoryRoutes from './server/routes/categoryRoutes.ts';
import equipmentRoutes from './server/routes/equipmentRoutes.ts';
import bookingRoutes from './server/routes/bookingRoutes.ts';
import rentalRoutes from './server/routes/rentalRoutes.ts';
import inspectionRoutes from './server/routes/inspectionRoutes.ts';
import paymentRoutes from './server/routes/paymentRoutes.ts';
import reportRoutes from './server/routes/reportRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // AI Studio requires dev server to run strictly on port 3000
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Initialize DB Connection and Seed Data
  await connectDB();

  // Express middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'OK',
      project: '20. Equipment Rental System',
      stage: '2nd Year College Internal Mark Project',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routers
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/equipment', equipmentRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/rentals', rentalRoutes);
  app.use('/api/inspections', inspectionRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reports', reportRoutes);

  // Fallback 404 handler for any non-existent API routes so they return JSON, not HTML
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'API route not found',
    });
  });

  // Global API Error handler
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  // Mount Vite or static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Equipment Rental System Server running on http://0.0.0.0:${PORT}`);
    console.log(` Backend APIs available at http://0.0.0.0:${PORT}/api/*`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
