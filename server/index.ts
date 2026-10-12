/**
 * Bexly Server — Entry Point
 * Production-ready Express server for the Instagram Automation Engine
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import { initializeDatabase } from './db/database.js';
import { config, validateConfig } from './config/index.js';
import { webhookRouter } from './routes/webhooks.js';
import { instagramRouter } from './routes/instagram.js';
import { automationsRouter } from './routes/automations.js';
import { leadsRouter } from './routes/leads.js';
import { healthRouter } from './routes/health.js';
import { logger } from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

// Behind Render/Vercel proxy: use X-Forwarded-For for client IP (rate limiting)
app.set('trust proxy', 1);

// ── Security ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    if (config.FRONTEND_URL && origin.startsWith(config.FRONTEND_URL)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Webhook endpoint needs raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// All other routes use JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging ──
app.use(requestLogger);

// ── Routes ──
app.use('/api/health', healthRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/instagram', instagramRouter);
app.use('/api/automations', automationsRouter);
app.use('/api/leads', leadsRouter);

// ── Serve Frontend SPA in Production ──
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// ── Global error handler ──
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({
    message: err.message,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// ── Bootstrap ──
async function start() {
  try {
    // Validate environment before starting
    validateConfig();

    // Initialize database and run migrations
    await initializeDatabase();

    app.listen(config.PORT, () => {
      logger.info(`🚀 Bexly API server running on port ${config.PORT}`);
      logger.info(`   Environment: ${config.NODE_ENV}`);
      logger.info(`   Database: ${config.DATABASE_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app };
