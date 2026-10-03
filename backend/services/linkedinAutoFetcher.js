import imaps from 'imap-simple';
import cron from 'node-cron';
import { parseLinkedInEmail } from './linkedinParser.js';
import { Candidate } from '../models/Candidate.js';

let isFetching = false;

/**
 * Connects to the recruiting inbox via IMAP and parses new LinkedIn application emails.
 */
export async function fetchLinkedInEmails(ioInstance) {
  const email = process.env.LINKEDIN_SYNC_EMAIL;
  const password = process.env.LINKEDIN_SYNC_PASSWORD;
  const host = process.env.LINKEDIN_IMAP_HOST || 'imap.gmail.com';
  const port = parseInt(process.env.LINKEDIN_IMAP_PORT || '993', 10);

  if (!email || !password || email === 'yourcompany.hiring@gmail.com') {
    return {
      status: 'idle',
      message: 'Add LINKEDIN_SYNC_EMAIL and LINKEDIN_SYNC_PASSWORD in .env to enable 60-second live inbox polling.'
    };
  }

  if (isFetching) {
    return { status: 'busy', message: 'Sync already in progress.' };
  }

  isFetching = true;
  console.log(`[LinkedIn Sync] 🔍 Checking inbox (${email}) for new LinkedIn applications...`);

  const config = {
    imap: {
      user: email,
      password: password,
      host: host,
      port: port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    }
  };

  let connection = null;
  let ingestedCount = 0;

  try {
    connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    // Search for UNSEEN emails from linkedin.com
    const searchCriteria = [
      'UNSEEN',
      ['OR', ['FROM', 'linkedin.com'], ['SUBJECT', 'application']]
    ];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`[LinkedIn Sync] Found ${messages.length} unread LinkedIn candidate email(s).`);

    for (const msg of messages) {
      const allParts = msg.parts.find(part => part.which === '');
      const rawText = allParts?.body || '';

      if (rawText) {
        const candidateData = await parseLinkedInEmail(rawText);

        // Save to MongoDB Atlas
        const saved = await Candidate.findOneAndUpdate(
          { email: candidateData.email },
          candidateData,
          { upsert: true, returnDocument: 'after' }
        );

        // Push real-time event to Dashboard
        if (ioInstance) {
          ioInstance.emit('NEW_CANDIDATE_INGESTED', saved);
        }

        ingestedCount++;
        console.log(`[LinkedIn Sync] ✅ Successfully ingested candidate: ${candidateData.name} (${candidateData.jobAppliedFor})`);
      }
    }

    connection.end();
    isFetching = false;
    return {
      status: 'success',
      ingestedCount,
      message: `Sync complete. ${ingestedCount} new candidate(s) ingested directly into MongoDB Atlas.`
    };
  } catch (error) {
    if (connection) {
      try { connection.end(); } catch {}
    }
    isFetching = false;
    console.error('[LinkedIn Sync Error]:', error.message);
    return { status: 'error', error: error.message };
  }
}

/**
 * Initializes recurring automated inbox polling every 60 seconds.
 */
export function startLinkedInAutoSyncScheduler(ioInstance) {
  console.log('⏰ Starting LinkedIn Automated Inbox Sync Scheduler (Every 60 Seconds)...');
  
  // Runs every 60 seconds
  cron.schedule('*/1 * * * *', async () => {
    await fetchLinkedInEmails(ioInstance);
  });
}
