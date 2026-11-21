import type { Request, Response } from 'express';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cltxvvjbukzjktsdrknc.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lypigBq62VpJTg2OzGjahQ_SGho2dlD';

async function getSupabaseAccountRow() {
  const supaRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bexly_automations?select=*&order=updated_at.desc&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  if (!supaRes.ok) return null;
  const rows = await supaRes.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function saveRulesToSupabase(rowId: string, rules: any[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bexly_automations?id=eq.${rowId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      rules,
      updated_at: new Date().toISOString(),
    }),
  });
  return res.ok;
}

export default async function handler(req: Request, res: Response) {
  const method = req.method;
  const pathParam = String(req.query.path || '');
  const pathSegments = pathParam.split('/').filter(Boolean);
  const targetId = pathSegments[0] || '';
  const isStatusAction = pathSegments[1] === 'status';

  try {
    const row = await getSupabaseAccountRow();
    const existingRules: any[] = (row && Array.isArray(row.rules)) ? row.rules : [];
    const rowId = row?.id || '28940950032212853';

    // ── 1. GET /api/automations or GET /api/automations/:id ──
    if (method === 'GET') {
      if (targetId) {
        const found = existingRules.find((r: any) => r.id === targetId);
        if (!found) {
          return res.status(404).json({ error: 'Automação não encontrada' });
        }
        return res.status(200).json({ automation: found });
      }

      // Format for frontend
      const automations = existingRules.map((r: any) => ({
        id: r.id,
        organizationId: r.organizationId || r.organization_id || 'org_default',
        organization_id: r.organizationId || r.organization_id || 'org_default',
        name: r.name,
        status: r.status || 'active',
        campaign_id: r.campaignName || r.name,
        campaignName: r.campaignName || r.name,
        trigger: r.trigger || { type: 'instagram_comment', postId: 'all' },
        trigger_config: r.trigger || { type: 'instagram_comment', postId: 'all' },
        conditions: r.conditions || [],
        conditions_config: r.conditions || [],
        actions: r.actions || [],
        actions_config: r.actions || [],
        metrics: r.metrics || {
          commentsDetected: 0,
          keywordMatches: 0,
          dmsSent: 0,
          leadsGenerated: 0,
          conversionRate: 0,
          attributedRevenue: 0,
        },
        createdAt: r.createdAt || r.created_at || new Date().toISOString(),
        created_at: r.createdAt || r.created_at || new Date().toISOString(),
        updatedAt: r.updatedAt || r.updated_at || new Date().toISOString(),
        updated_at: r.updatedAt || r.updated_at || new Date().toISOString(),
      }));

      return res.status(200).json({ automations });
    }

    // ── 2. POST /api/automations (Create) ──
    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const id = body.id || `auto_${Date.now()}`;
      const now = new Date().toISOString();

      const newRule = {
        id,
        name: body.name || 'Nova Automação',
        status: body.status || 'active',
        campaignName: body.campaign_id || body.campaignName || body.name || 'Geral',
        trigger: body.trigger || body.trigger_config || { type: 'instagram_comment', postId: 'all' },
        conditions: body.conditions || body.conditions_config || [],
        actions: body.actions || body.actions_config || [],
        metrics: body.metrics || {
          commentsDetected: 0,
          keywordMatches: 0,
          dmsSent: 0,
          leadsGenerated: 0,
          conversionRate: 0,
          attributedRevenue: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      // Add to existing rules (or replace if same id exists)
      const updatedRules = [newRule, ...existingRules.filter((r: any) => r.id !== id)];
      await saveRulesToSupabase(rowId, updatedRules);

      return res.status(201).json({
        id,
        name: newRule.name,
        status: newRule.status,
        created_at: now,
        automation: newRule,
      });
    }

    // ── 3. PATCH /api/automations/:id/status (Pause / Activate) ──
    if (method === 'PATCH' && isStatusAction && targetId) {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const nextStatus = body.status === 'paused' ? 'paused' : 'active';
      const now = new Date().toISOString();

      let found = false;
      const updatedRules = existingRules.map((r: any) => {
        if (r.id === targetId) {
          found = true;
          return {
            ...r,
            status: nextStatus,
            updatedAt: now,
          };
        }
        return r;
      });

      if (!found) {
        return res.status(404).json({ error: 'Automação não encontrada' });
      }

      await saveRulesToSupabase(rowId, updatedRules);
      return res.status(200).json({ success: true, status: nextStatus, updated_at: now });
    }

    // ── 4. PUT /api/automations/:id (Full Update) ──
    if (method === 'PUT' && targetId) {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const now = new Date().toISOString();

      let found = false;
      const updatedRules = existingRules.map((r: any) => {
        if (r.id === targetId) {
          found = true;
          return {
            ...r,
            name: body.name || r.name,
            status: body.status !== undefined ? body.status : r.status,
            campaignName: body.campaign_id || body.campaignName || r.campaignName,
            trigger: body.trigger || body.trigger_config || r.trigger,
            conditions: body.conditions || body.conditions_config || r.conditions,
            actions: body.actions || body.actions_config || r.actions,
            updatedAt: now,
          };
        }
        return r;
      });

      if (!found) {
        return res.status(404).json({ error: 'Automação não encontrada' });
      }

      await saveRulesToSupabase(rowId, updatedRules);
      return res.status(200).json({ success: true, updated_at: now });
    }

    // ── 5. DELETE /api/automations/:id (Delete) ──
    if (method === 'DELETE' && targetId) {
      const updatedRules = existingRules.filter((r: any) => r.id !== targetId);
      await saveRulesToSupabase(rowId, updatedRules);
      return res.status(200).json({ success: true, message: 'Automação excluída com sucesso' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('[API Automations] Erro:', err);
    return res.status(500).json({ error: 'Erro interno ao processar automações', message: err.message });
  }
}

