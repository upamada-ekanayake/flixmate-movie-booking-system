/**
 * FlixMate — Express API Gateway
 *
 * Entry point for the Node.js backend server.
 * Exposes RESTful endpoints for:
 *   - Movie booking with PostgreSQL row-level transaction locks
 *   - Content-based AI recommendation engine
 *
 * Prerequisites:
 *   - PostgreSQL database running (see DATABASE_URL in .env)
 *   - Prisma client generated: `npx prisma generate`
 *   - Schema migrated:         `npx prisma migrate dev`
 *
 * Start server: `npx tsx src/server.ts`
 */

import express from 'express';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes';
import recommendationRoutes from './routes/recommendationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(express.json());

// CORS — allow requests from the Vite dev server in development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// ── Health Check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FlixMate API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Route Mounting ──────────────────────────────────────────────────────────

app.use('/api', bookingRoutes);
app.use('/api', recommendationRoutes);

// ── 404 Fallback ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🎬 FlixMate API Gateway running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
