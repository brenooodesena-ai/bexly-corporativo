import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  organizationId: string;
}

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Use organization ID from header or default to primary workspace
  (req as AuthenticatedRequest).organizationId =
    (req.headers['x-organization-id'] as string) || 'org_default';
  next();
}
