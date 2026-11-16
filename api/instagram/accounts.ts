import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  // Gracefully handles account list / details on Vercel
  return res.status(200).json({
    success: true,
    accounts: [],
  });
}
