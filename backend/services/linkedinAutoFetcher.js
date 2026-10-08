import imaps from 'imap-simple';
import cron from 'node-cron';
import { parseLinkedInEmail } from './linkedinParser.js';
import { parseApnaEmail } from './apnaEmailParser.js';
import { Candidate } from '../models/Candidate.js';
import { persistCandidate } from './candidateStore.js';

let isFetching = false;

/**
 * Connects to the recruiting inbox via IMAP and parses new LinkedIn & Apna application emails.
 */
export async function fetchLinkedInEmails(ioInstance) {
  const email = process.env.LINKEDIN_SYNC_EMAIL || process.env.RECRUITMENT_SYNC_EMAIL;
  const password = process.env.LINKEDIN_SYNC_PASSWORD || process.env.RECRUITMENT_SYNC_PASSWORD;
  const host = process.env.LINKEDIN_IMAP_HOST || process.env.RECRUITMENT_IMAP_HOST || 'imap.gmail.com';
  const port = parseInt(process.env.LINKEDIN_IMAP_PORT || '993', 10);

  if (!email || !password || email === 'yourcompany.hiring@gmail.com') {
    return {
      status: 'idle',
      message: 'Add LINKEDIN_SYNC_EMAIL and LINKEDIN_SYNC_PASSWORD (or RECRUITMENT_SYNC_EMAIL) in .env to enable 60-second live inbox polling.'
    };
  }

  if (isFetching) {
    return { status: 'busy', message: 'Sync already in progress.' };
  }

  isFetching = true;
  console.log(`[Auto Email Sync] 🔍 Checking inbox (${email}) for new LinkedIn & Apna applications...`);

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

    // Search for UNSEEN emails from linkedin.com or apna.co or containing application
    const searchCriteria = [
      'UNSEEN',
      ['OR', 
        ['FROM', 'linkedin.com'], 
        ['OR', 
          ['FROM', 'apna.co'], 
          ['OR', ['SUBJECT', 'application'], ['SUBJECT', 'apna']]
        ]
      ]
    ];

    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`[Auto Email Sync] Found ${messages.length} unread candidate email(s).`);

    for (const msg of messages) {
      const allParts = msg.parts.find(part => part.which === '');
      const rawText = allParts?.body || '';

      if (rawText) {
        const isApna = rawText.includes('apna.co') || rawText.toLowerCase().includes('apna');
        const candidateData = isApna ? await parseApnaEmail(rawText) : await parseLinkedInEmail(rawText);

        // Save to MongoDB Atlas via candidateStore
        const saved = await persistCandidate(candidateData);

        // Push real-time event to Dashboard
        if (ioInstance) {
          ioInstance.emit('NEW_CANDIDATE_INGESTED', saved);
        }

        ingestedCount++;
        console.log(`[Auto Email Sync] ✅ Successfully ingested candidate from ${isApna ? 'Apna' : 'LinkedIn'}: ${candidateData.name} (${candidateData.jobAppliedFor})`);
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
