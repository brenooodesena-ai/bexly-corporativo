/**
 * Leads Native Management Routes
 */
import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { leadService } from '../services/leadService.js';

export const leadsRouter = Router();

function getOrgId(req: Request): string {
  return (req.headers['x-organization-id'] as string) || 'org_default';
}

/**
 * GET /api/leads
 * List leads with pagination, search and status filter
 */
leadsRouter.get('/', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { status, search, limit = '50', offset = '0' } = req.query;

  const leads = leadService.listLeads(orgId, {
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
    limit: parseInt(String(limit), 10),
    offset: parseInt(String(offset), 10),
  });

  const db = getDb();
  const total = (db.prepare(`
    SELECT COUNT(*) as c FROM leads WHERE organization_id = ?
  `).get(orgId) as { c: number }).c;

  res.json({ leads, total });
});

/**
 * GET /api/leads/stats
 * Get overview metrics for leads and funnel
 */
leadsRouter.get('/stats', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDb();

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM leads
    WHERE organization_id = ?
    GROUP BY status
  `).all(orgId);

  const totalLeads = (db.prepare(`
    SELECT COUNT(*) as c FROM leads WHERE organization_id = ?
  `).get(orgId) as { c: number }).c;

  const totalInteractions = (db.prepare(`
    SELECT COUNT(*) as c FROM lead_interactions WHERE organization_id = ?
  `).get(orgId) as { c: number }).c;

  const totalDmsSent = (db.prepare(`
    SELECT COUNT(*) as c FROM message_attempts WHERE organization_id = ? AND status = 'sent'
  `).get(orgId) as { c: number }).c;

  res.json({
    total_leads: totalLeads,
    total_interactions: totalInteractions,
    total_dms_sent: totalDmsSent,
    by_status: byStatus,
  });
});

/**
 * GET /api/leads/:id
 * Get single lead with interactions timeline and touchpoints
 */
leadsRouter.get('/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { id } = req.params;

  const data = leadService.getLeadWithTimeline(orgId, id);

  if (!data.lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  res.json(data);
});

/**
 * PATCH /api/leads/:id/status
 * Update lead pipeline stage
 */
leadsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['novo', 'contatado', 'qualificado', 'oportunidade', 'cliente', 'perdido'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  leadService.updateStatus(orgId, id, status);
  res.json({ success: true, status });
});

/**
 * POST /api/leads/:id/tags
 * Add tag to lead
 */
leadsRouter.post('/:id/tags', async (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const { tag } = req.body;

  if (!tag) {
    return res.status(400).json({ error: 'tag is required' });
  }

  await leadService.addTag(orgId, id, tag.trim());
  res.json({ success: true, tag });
});
