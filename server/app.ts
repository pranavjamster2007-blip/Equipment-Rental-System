/**
 * Equipment Rental System - Express Application Factory
 * Modular Express app configured for local servers, Docker, and Vercel serverless functions.
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';

import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import categoryRoutes from './routes/categoryRoutes.ts';
import equipmentRoutes from './routes/equipmentRoutes.ts';
import bookingRoutes from './routes/bookingRoutes.ts';
import rentalRoutes from './routes/rentalRoutes.ts';
import inspectionRoutes from './routes/inspectionRoutes.ts';
import paymentRoutes from './routes/paymentRoutes.ts';
import reportRoutes from './routes/reportRoutes.ts';

dotenv.config();

const app = express();

let isDbInitialized = false;

export async function ensureDb() {
  if (!isDbInitialized) {
    await connectDB();
    isDbInitialized = true;
  }
}

// Middleware: parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is seeded and ready on every API invocation
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    next();
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    project: '20. Equipment Rental System',
    stage: '2nd Year College Internal Mark Project',
    platform: 'Cross-platform Node.js / Vercel Serverless',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// Fallback 404 for unhandled API routes (ensures clean JSON, never returns HTML 404)
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global API error handler
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error Handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
