/**
 * Server Configuration
 * All env-var access goes through this module — never use process.env directly elsewhere
 */

import 'dotenv/config';

export const config = {
  get PORT() { return parseInt(process.env.PORT || '3001', 10); },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get APP_URL() { return process.env.APP_URL || 'http://localhost:3001'; },
  get FRONTEND_URL() { return process.env.FRONTEND_URL || 'http://localhost:5173'; },
  get DATABASE_URL() { return process.env.DATABASE_URL || './server/data/bexly.db'; },

  // Meta/Instagram — NEVER expose these to frontend
  get META_APP_ID() { return process.env.META_APP_ID || ''; },
  get META_APP_SECRET() { return process.env.META_APP_SECRET || ''; },
  get META_REDIRECT_URI() { return process.env.META_REDIRECT_URI || 'https://localhost:5173/integrations/instagram/callback'; },
  get META_VERIFY_TOKEN() { return process.env.META_VERIFY_TOKEN || ''; },
  get META_API_VERSION() { return process.env.META_API_VERSION || 'v21.0'; },

  // Security
  get ENCRYPTION_KEY() { return process.env.ENCRYPTION_KEY || ''; },
  get JWT_SECRET() { return process.env.JWT_SECRET || ''; },
};

/**
 * Validate that all required environment variables are present.
 * Called at server startup — fail fast rather than silent errors.
 */
export function validateConfig(): void {
  const missing: string[] = [];
  const criticalVars: (keyof typeof config)[] = [
    'ENCRYPTION_KEY',
    'JWT_SECRET',
    'META_VERIFY_TOKEN',
  ];

  for (const key of criticalVars) {
    if (!config[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Copy .env.example to .env and fill in all values.`
    );
  }

  // Warn (don't fail) if Meta credentials are missing — some features will be unavailable
  const metaVars: (keyof typeof config)[] = ['META_APP_ID', 'META_APP_SECRET', 'META_REDIRECT_URI'];
  const missingMeta = metaVars.filter(k => !config[k]);
  if (missingMeta.length > 0) {
    console.warn(
      `[WARN] Meta API credentials not configured: ${missingMeta.join(', ')}\n` +
      `Instagram integration features will be unavailable until these are set.`
    );
  }
}

export function isMetaConfigured(): boolean {
  return !!(config.META_APP_ID && config.META_APP_SECRET && config.META_REDIRECT_URI);
}
