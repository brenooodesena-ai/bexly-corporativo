/**
 * Vercel Serverless Function: Meta Webhook Endpoint
 * Responds to Meta verification challenge and event payloads.
 */
export default function handler(req: any, res: any) {
  // ── GET: Webhook Verification ──
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const expectedToken = process.env.META_VERIFY_TOKEN || 'bexly_webhook_verify_2025';

    if (mode === 'subscribe' && token === expectedToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Webhook verification token mismatch' });
  }

  // ── POST: Receive Webhook Events ──
  if (req.method === 'POST') {
    // Acknowledge immediately within Meta's 20s timeout limit
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
