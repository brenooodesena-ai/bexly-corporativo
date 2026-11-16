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

export async function syncAutomationsToCloud(account: any, automations: any[]) {
  const token = account?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('bexly_meta_access_token') : null);
  if (!account || !token) return;

  try {
    const accId = account.id || account.instagramUserId || 'default';
    await fetch(`${supabaseUrl}/rest/v1/bexly_automations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: String(accId),
        instagram_user_id: String(account.instagramUserId || accId),
        username: account.username || 'instagram_user',
        access_token: token,
        rules: automations,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('[Sync] Erro ao sincronizar regras no Supabase:', err);
  }
}

export async function pauseCloudAutomations() {
  try {
    const supaRes = await fetch(`${supabaseUrl}/rest/v1/bexly_automations?select=*&order=updated_at.desc&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    if (supaRes.ok) {
      const rows = await supaRes.json();
      if (rows && rows[0]) {
        const row = rows[0];
        const pausedRules = Array.isArray(row.rules)
          ? row.rules.map((r: any) => ({ ...r, status: 'paused' }))
          : [];
        await fetch(`${supabaseUrl}/rest/v1/bexly_automations?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            rules: pausedRules,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    }
  } catch (err) {
    console.warn('[Sync] Erro ao pausar regras no logout:', err);
  }
}

export async function resumeCloudAutomations() {
  try {
    const supaRes = await fetch(`${supabaseUrl}/rest/v1/bexly_automations?select=*&order=updated_at.desc&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    if (supaRes.ok) {
      const rows = await supaRes.json();
      if (rows && rows[0]) {
        const row = rows[0];
        const activeRules = Array.isArray(row.rules)
          ? row.rules.map((r: any) => ({ ...r, status: 'active' }))
          : [];
        await fetch(`${supabaseUrl}/rest/v1/bexly_automations?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            rules: activeRules,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    }
  } catch (err) {
    console.warn('[Sync] Erro ao reativar regras no login:', err);
  }
}
