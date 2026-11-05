/**
 * Vercel Serverless Function Entry Point
 * Exports the Express backend app for serverless execution on Vercel.
 */

import app, { ensureDb } from '../server/app.ts';

// Pre-warm DB initialization
ensureDb().catch((err) => {
  console.error('Failed to pre-warm DB:', err);
});

export default app;
