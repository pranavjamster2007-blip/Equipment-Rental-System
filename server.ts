/**
 * Equipment Rental System - Main Server Entry Point
 * Full-stack Express + Vite dev server for local laptops and production servers
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import app, { ensureDb } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  // In AI Studio dev container, PORT is set to 8080 by Cloud Run while nginx proxy routes to 3000.
  // On any user laptop, local machine, or cloud platform (Render, etc.), it uses process.env.PORT or 3000.
  const PORT = process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000;

  // Pre-initialize database and seeds
  await ensureDb();

  // Mount Vite middleware in development, or serve static dist in production
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Equipment Rental System Server running on http://0.0.0.0:${PORT}`);
    console.log(` Backend APIs available at http://0.0.0.0:${PORT}/api/*`);
    console.log(` Mode: ${isProduction ? 'Production (Static Dist)' : 'Development (Vite HMR/Middleware)'}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
