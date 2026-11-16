import { createClient } from '@supabase/supabase-js';

// Default to the project's Supabase instance if env vars are not set at build time (e.g. on Vercel)
const DEFAULT_SUPABASE_URL = 'https://cltxvvjbukzjktsdrknc.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_lypigBq62VpJTg2OzGjahQ_SGho2dlD';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
