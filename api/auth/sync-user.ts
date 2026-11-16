import type { Request, Response } from 'express';

const ADMIN_EMAIL = 'brenooodesena@gmail.com';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, email, name } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório para registrar o usuário.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const isAdmin = normalizedEmail === ADMIN_EMAIL;

  const organizationId = isAdmin
    ? 'org_default'
    : `org_${(id ? String(id).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24) : '') || Buffer.from(normalizedEmail).toString('hex').slice(0, 16)}`;

  const user = {
    id: id || `usr_${Buffer.from(normalizedEmail).toString('hex').slice(0, 16)}`,
    email: normalizedEmail,
    name: name || normalizedEmail.split('@')[0],
    role: isAdmin ? 'admin' : 'user',
    organization_id: organizationId,
  };

  const organization = {
    id: organizationId,
    name: isAdmin ? 'Bexly Admin Workspace' : `${user.name} Workspace`,
    plan: isAdmin ? 'enterprise' : 'free',
  };

  return res.status(200).json({
    success: true,
    user,
    organization,
    message: 'Usuário sincronizado com sucesso!',
  });
}
