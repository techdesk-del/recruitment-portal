import { fetchLinkedInEmails } from '../services/linkedinAutoFetcher.js';
import { getIO } from '../sockets/socketHandler.js';

export async function triggerLinkedInSync(req, res) {
  console.log('[LinkedIn Sync] Manual sync triggered from Dashboard...');
  const io = getIO();
  const result = await fetchLinkedInEmails(io);
  res.json(result);
}
