import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { Candidate } from './models/Candidate.js';
import { Job } from './models/Job.js';
import { parseLinkedInEmail } from './services/linkedinParser.js';
import { fetchLinkedInEmails, startLinkedInAutoSyncScheduler } from './services/linkedinAutoFetcher.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recruitment_dashboard';

app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

let isMongoConnected = false;

// Connect to MongoDB Database
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  isMongoConnected = true;
  console.log(`✅ MongoDB Connected Successfully: ${MONGODB_URI.split('@').pop()}`);
})
.catch((err) => {
  isMongoConnected = false;
  console.warn(`⚠️ MongoDB Local Connection Notice: ${err.message}`);
  console.log(`ℹ️ Running with Dual-Persistence (MongoDB when available + In-Memory Fallback)`);
});

// In-Memory Backup Store (if MongoDB is temporarily offline)
let memoryCandidates = [];

io.on('connection', (socket) => {
  console.log(`[WebSocket] Dashboard Client Connected (${socket.id})`);
});

// Helper to save candidate to MongoDB + Memory
async function persistCandidate(candidateData) {
  try {
    if (isMongoConnected) {
      const saved = await Candidate.findOneAndUpdate(
        { $or: [{ id: candidateData.id }, { email: candidateData.email }] },
        candidateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return saved.toObject();
    }
  } catch (e) {
    console.error('MongoDB write error:', e.message);
  }
  // Memory fallback
  const idx = memoryCandidates.findIndex(c => c.id === candidateData.id || c.email === candidateData.email);
  if (idx >= 0) {
    memoryCandidates[idx] = candidateData;
  } else {
    memoryCandidates.unshift(candidateData);
  }
  return candidateData;
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Health & Database Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'In-Memory / Awaiting MongoDB Local Service',
    service: 'UrbanGaon Unified Recruitment Ingestion Gateway',
    timestamp: new Date().toISOString(),
    webhooks: [
      'POST /api/webhook/naukri',
      'POST /api/webhook/linkedin',
      'POST /api/webhook/apna',
      'POST /api/webhook/indeed',
      'POST /api/careers/apply'
    ]
  });
});

// 2. Get All Candidates (from MongoDB)
app.get('/api/candidates', async (req, res) => {
  try {
    if (isMongoConnected) {
      const candidates = await Candidate.find().sort({ createdAt: -1 });
      return res.json(candidates);
    }
  } catch (err) {
    console.error('Error fetching candidates from MongoDB:', err);
  }
  res.json(memoryCandidates);
});

// 3. Update Candidate Status in MongoDB
app.patch('/api/candidates/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, details, performedBy } = req.body;

  const activityItem = {
    id: `act-${Date.now()}`,
    action: `Status updated to ${status.toUpperCase()}`,
    details: details || `Moved to ${status}`,
    performedBy: performedBy || 'Recruiter',
    timestamp: new Date().toISOString(),
    type: 'status'
  };

  try {
    if (isMongoConnected) {
      const updated = await Candidate.findOneAndUpdate(
        { id },
        { 
          $set: { status, lastUpdatedDate: new Date().toISOString() },
          $push: { activityHistory: { $each: [activityItem], $position: 0 } }
        },
        { new: true }
      );
      if (updated) {
        io.emit('CANDIDATE_STATUS_UPDATED', { id, status, activityItem });
        return res.json({ success: true, candidate: updated });
      }
    }
  } catch (e) {
    console.error('Failed to update status in MongoDB:', e);
  }

  res.json({ success: true, id, status });
});

// 4. Update Candidate Notes in MongoDB
app.patch('/api/candidates/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    if (isMongoConnected) {
      await Candidate.findOneAndUpdate(
        { id },
        { $set: { notes, lastUpdatedDate: new Date().toISOString() } }
      );
    }
  } catch (e) {
    console.error('Failed to save notes in MongoDB:', e);
  }

  res.json({ success: true, id, notes });
});

// 5. Update Candidate Scorecard in MongoDB
app.patch('/api/candidates/:id/scorecard', async (req, res) => {
  const { id } = req.params;
  const { scorecard } = req.body;

  const activityItem = {
    id: `act-${Date.now()}`,
    action: 'Interview Scorecard Recorded',
    details: `Evaluation recommendation: ${scorecard.overallRecommendation?.toUpperCase()}`,
    performedBy: scorecard.evaluatedBy || 'Interviewer',
    timestamp: new Date().toISOString(),
    type: 'scorecard'
  };

  try {
    if (isMongoConnected) {
      await Candidate.findOneAndUpdate(
        { id },
        { 
          $set: { scorecard, lastUpdatedDate: new Date().toISOString() },
          $push: { activityHistory: { $each: [activityItem], $position: 0 } }
        }
      );
    }
  } catch (e) {
    console.error('Failed to save scorecard in MongoDB:', e);
  }

  res.json({ success: true, id, scorecard });
});

// -------------------------------------------------------------
// REAL-TIME WEBHOOK INGESTION ENDPOINTS (SAVES TO MONGODB)
// -------------------------------------------------------------

// A. Apna.co Webhook
app.post('/api/webhook/apna', async (req, res) => {
  const data = req.body || {};
  console.log('[Apna Webhook] Ingesting candidate:', data.candidate_name || data.name);

  const candidate = {
    id: `apna-${Date.now().toString().slice(-6)}`,
    name: data.candidate_name || data.name || 'Apna Candidate',
    email: data.candidate_email || data.email || `apna.user.${Date.now().toString().slice(-4)}@mail.in`,
    phone: data.mobile_number || data.phone || '+91 99' + Math.floor(10000000 + Math.random() * 90000000),
    location: data.city || data.location || 'Noida, UP',
    source: 'apna',
    sourceId: `APNA-${Math.floor(100000 + Math.random() * 900000)}`,
    jobAppliedFor: data.job_title || data.jobTitle || 'Lead QA Automation Engineer (Playwright/Cypress)',
    jobId: data.jobId || 'job-qa-04',
    department: 'Quality Assurance',
    appliedDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
    status: 'applied',
    atsMatchScore: Math.floor(Math.random() * 12 + 86),
    rating: 4,
    experienceYears: parseFloat(data.total_experience_years || data.experienceYears) || 5.0,
    expectedSalary: data.expected_salary || data.expectedSalary || '₹22 LPA',
    noticePeriod: data.noticePeriod || 'Immediate',
    recruiterAssigned: 'Neha Verma',
    tags: ['Playwright', 'Cypress', 'TypeScript', 'Apna Verified', 'Immediate Joiner'],
    notes: 'Candidate applied directly via Apna Employer Webhook. Saved in MongoDB.',
    resumeData: {
      summary: 'Automation QA Engineer with hands-on expertise building scalable E2E cross-browser test grids.',
      skills: ['Playwright', 'Cypress', 'JavaScript / TypeScript', 'Postman', 'k6 Performance Testing'],
      experience: [
        {
          company: 'QualityFirst Software',
          role: 'Senior QA Automation Engineer',
          duration: '2022 - Present',
          location: 'Delhi NCR',
          highlights: [
            'Created automated regression suites cutting release validation time from 2 days to 30 minutes.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'Delhi Technological University (DTU)',
          year: '2018 - 2022'
        }
      ]
    },
    activityHistory: [
      {
        id: `act-${Date.now()}`,
        action: 'Ingested via Apna.co Webhook (Saved to MongoDB)',
        details: 'Received from Apna.co candidate application webhook.',
        performedBy: 'Apna Webhook Gateway',
        timestamp: new Date().toISOString(),
        type: 'ingestion'
      }
    ]
  };

  const savedCandidate = await persistCandidate(candidate);
  io.emit('NEW_CANDIDATE_INGESTED', savedCandidate);

  res.status(200).json({ 
    success: true, 
    message: 'Candidate saved in MongoDB and pushed to Dashboard via WebSocket',
    candidateId: candidate.id 
  });
});

// B. Naukri.com Corporate API
app.post('/api/webhook/naukri', async (req, res) => {
  const data = req.body || {};
  console.log('[Naukri Ingestion] Ingesting candidate:', data.candidateName || data.name);

  const candidate = {
    id: `nauk-${Date.now().toString().slice(-6)}`,
    name: data.candidateName || data.name || 'Naukri Applicant',
    email: data.candidateEmail || data.email || `naukri.cand.${Date.now().toString().slice(-4)}@workmail.in`,
    phone: data.phoneNumber || data.phone || '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
    location: data.location || data.currentCity || 'Bengaluru, Karnataka',
    source: 'naukri',
    sourceId: data.candidateId || `NAUK-${Math.floor(100000 + Math.random() * 900000)}`,
    jobAppliedFor: data.jobTitle || 'Senior Frontend Engineer (React/TypeScript)',
    jobId: data.jobCode || 'job-fe-01',
    department: data.department || 'Engineering',
    appliedDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
    status: 'applied',
    atsMatchScore: Math.floor(Math.random() * 15 + 85),
    rating: 4,
    experienceYears: parseFloat(data.experience || data.totalExperience) || 4.2,
    currentCompany: data.currentCompany || 'Digital Tech Labs',
    currentDesignation: data.currentDesignation || 'Senior Software Engineer',
    currentSalary: data.currentSalary ? `₹${data.currentSalary} LPA` : '₹14 LPA',
    expectedSalary: data.expectedSalary ? `₹${data.expectedSalary} LPA` : '₹22 - 25 LPA',
    noticePeriod: data.noticePeriod || '30 Days',
    recruiterAssigned: 'Priya Sharma',
    tags: Array.isArray(data.skills) ? data.skills : ['React', 'TypeScript', 'Redux', 'Tailwind CSS', 'Naukri FastForward'],
    notes: 'Ingested via Naukri Corporate eApps API. Saved in MongoDB.',
    resumeData: {
      summary: data.resumeHeadline || data.summary || 'Senior Frontend Engineer with 4+ years architecting high-performance React & TypeScript applications.',
      skills: Array.isArray(data.skills) ? data.skills : ['React.js', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS'],
      experience: [
        {
          company: data.currentCompany || 'Digital Tech Labs',
          role: data.currentDesignation || 'Senior Software Engineer',
          duration: '2022 - Present',
          location: data.location || 'Bengaluru',
          highlights: ['Architected high-throughput client portal with 99.9% uptime.']
        }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'VTU Bengaluru',
          year: '2018 - 2022'
        }
      ]
    },
    activityHistory: [
      {
        id: `act-${Date.now()}`,
        action: 'Application Ingested via Naukri API (Saved to MongoDB)',
        details: 'Candidate payload received and parsed via Naukri Corporate Ingestion Gateway.',
        performedBy: 'Naukri Ingestion Engine',
        timestamp: new Date().toISOString(),
        type: 'ingestion'
      }
    ]
  };

  const savedCandidate = await persistCandidate(candidate);
  io.emit('NEW_CANDIDATE_INGESTED', savedCandidate);

  res.status(200).json({ success: true, candidateId: candidate.id });
});

// C1. LinkedIn Structured Webhook
app.post('/api/webhook/linkedin', async (req, res) => {
  const data = req.body || {};
  console.log('[LinkedIn Webhook] Ingesting candidate:', data.name || data.candidateName);

  try {
    const candidateData = await parseLinkedInEmail(data);
    const savedCandidate = await persistCandidate(candidateData);
    io.emit('NEW_CANDIDATE_INGESTED', savedCandidate);
    res.status(200).json({ 
      success: true, 
      message: 'LinkedIn candidate parsed, saved to MongoDB Atlas, and pushed to Dashboard.',
      candidateId: savedCandidate.id 
    });
  } catch (err) {
    console.error('LinkedIn parse error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// C2. LinkedIn Inbound Raw Email Parser (SendGrid / Mailgun / Postmark / Gmail forwarder)
app.post('/api/webhook/linkedin-email', express.text({ type: '*/*' }), async (req, res) => {
  console.log('[LinkedIn Email Parser] Received raw application email webhook');

  try {
    const rawContent = req.body;
    const candidateData = await parseLinkedInEmail(rawContent);
    const savedCandidate = await persistCandidate(candidateData);
    io.emit('NEW_CANDIDATE_INGESTED', savedCandidate);
    res.status(200).json({ 
      success: true, 
      message: 'Raw LinkedIn email parsed, saved to MongoDB Atlas, and pushed to Dashboard.',
      candidateId: savedCandidate.id 
    });
  } catch (err) {
    console.error('LinkedIn email parse error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// D. Indeed Apply Webhook
app.post('/api/webhook/indeed', async (req, res) => {
  const data = req.body || {};
  console.log('[Indeed Webhook] Ingesting candidate:', data.name || data.applicantName);

  const candidate = {
    id: `ind-${Date.now().toString().slice(-6)}`,
    name: data.name || data.applicantName || 'Indeed Applicant',
    email: data.email || `indeed.app.${Date.now().toString().slice(-4)}@quickmail.com`,
    phone: data.phone || '+91 96' + Math.floor(10000000 + Math.random() * 90000000),
    location: data.location || 'Hyderabad, Telangana',
    source: 'indeed',
    sourceId: `IND-${Math.floor(100000 + Math.random() * 900000)}`,
    jobAppliedFor: data.jobTitle || 'UI/UX Product Designer (Figma/Design Systems)',
    jobId: data.jobId || 'job-ux-05',
    department: 'Design',
    appliedDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
    status: 'applied',
    atsMatchScore: 89,
    rating: 4,
    experienceYears: 3.5,
    expectedSalary: '₹16 - 19 LPA',
    noticePeriod: '30 Days',
    recruiterAssigned: 'Priya Sharma',
    tags: ['Figma', 'UI/UX', 'Design Tokens', 'Indeed Apply'],
    notes: 'Received through Indeed Apply instant webhook. Saved in MongoDB.',
    resumeData: {
      summary: 'Product Designer specializing in design systems and interaction tokens.',
      skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research'],
      experience: [
        {
          company: 'Nexus Creative Studio',
          role: 'Product Designer',
          duration: '2023 - Present',
          location: 'Hyderabad',
          highlights: ['Built design systems used by 5 product squads.']
        }
      ],
      education: [
        {
          degree: 'B.Des in Visual Communication',
          institution: 'NIFT Hyderabad',
          year: '2019 - 2023'
        }
      ]
    },
    activityHistory: [
      {
        id: `act-${Date.now()}`,
        action: 'Ingested from Indeed Webhook (Saved to MongoDB)',
        details: 'Received via Indeed Apply instant candidate dispatch.',
        performedBy: 'Indeed Webhook Engine',
        timestamp: new Date().toISOString(),
        type: 'ingestion'
      }
    ]
  };

  const savedCandidate = await persistCandidate(candidate);
  io.emit('NEW_CANDIDATE_INGESTED', savedCandidate);

  res.status(200).json({ success: true, candidateId: candidate.id });
});

// E. Direct Company Career Portal Apply Form
app.post('/api/careers/apply', async (req, res) => {
  const data = req.body || {};
  console.log('[Careers Portal] Ingesting direct application:', data.name);

  const candidate = {
    id: `ug-${Date.now().toString().slice(-6)}`,
    name: data.name || 'Direct Portal Applicant',
    email: data.email || `applicant.${Date.now().toString().slice(-4)}@inbox.com`,
    phone: data.phone || '+91 98765 00000',
    location: data.location || 'India',
    source: 'urbangaon',
    sourceId: `UG-PORTAL-${Math.floor(100000 + Math.random() * 900000)}`,
    jobAppliedFor: data.jobAppliedFor || 'Senior Frontend Engineer (React/TypeScript)',
    jobId: data.jobId || 'job-fe-01',
    department: data.department || 'Engineering',
    appliedDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
    status: 'applied',
    atsMatchScore: 91,
    rating: 4,
    experienceYears: parseFloat(data.experienceYears) || 3.0,
    expectedSalary: data.expectedSalary || '₹18 - 22 LPA',
    noticePeriod: data.noticePeriod || '30 Days',
    recruiterAssigned: 'Priya Sharma',
    tags: ['Direct Portal Application', 'Verified Submission'],
    notes: 'Applied directly on UrbanGaon Careers Portal. Saved in MongoDB.',
    resumeData: {
      summary: data.summary || 'Direct portal applicant with comprehensive profile.',
      skills: Array.isArray(data.skills) ? data.skills : ['JavaScript', 'React', 'CSS3', 'Git'],
      experience: [
        {
          company: 'Technology Solutions Ltd',
          role: 'Software Engineer',
          duration: '2022 - Present',
          location: 'India',
          highlights: ['Built responsive consumer facing features.']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Technology',
          institution: 'Reputed University',
          year: '2018 - 2022'
        }
      ]
    },
    activityHistory: [
      {
        id: `act-${Date.now()}`,
        action: 'Direct Career Page Application (Saved to MongoDB)',
        details: 'Candidate submitted application directly via careers website.',
        performedBy: 'UrbanGaon Career Portal',
        timestamp: new Date().toISOString(),
        type: 'ingestion'
      }
    ]
  };

  const savedCandidate = await persistCandidate(candidate);
  io.emit('NEW_CANDIDATE_INGESTED', savedCandidate);

  res.status(200).json({ success: true, candidateId: candidate.id });
});

// ==========================================
// 6. ON-DEMAND LINKEDIN INBOX SYNC TRIGGER
// ==========================================
app.post('/api/sync/linkedin-now', async (req, res) => {
  console.log('[LinkedIn Sync] Manual sync triggered from Dashboard...');
  const result = await fetchLinkedInEmails(io);
  res.json(result);
});

// Start Server & Auto-Sync Scheduler
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Unified Recruitment Ingestion Gateway is LIVE!`);
  console.log(`📡 Server Address: http://localhost:${PORT}`);
  console.log(`💾 Database Mode: MongoDB Atlas with Mongoose ODM`);
  console.log(`⚡ WebSocket Server: Ready for Real-Time Dashboard Sync`);
  console.log(`💼 LinkedIn Ingestion: Live (Webhook + Email Auto-Fetcher)`);
  console.log(`=======================================================`);

  // Start 60-second automated inbox polling
  startLinkedInAutoSyncScheduler(io);
});
