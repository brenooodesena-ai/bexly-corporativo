import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { isMetaConfigured } from '../config/index.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  let dbStatus = 'ok';
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
  } catch (error: any) {
    dbStatus = `error: ${error.message}`;
  }

  res.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    database: dbStatus,
    meta_configured: isMetaConfigured(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
