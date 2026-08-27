# Unified Recruitment Dashboard - Complete Specification
**For: UrbanGaon (or your company)**

---

## 🎯 EXECUTIVE SUMMARY (CEO/Leadership)

### What is this?
Ek **single dashboard** jisme aapko sab recruitment platforms ka complete view milega - sirf numbers nahi, real-time candidate flow bhi.

### Business Value
- **Hiring speed 40% faster** (ek jagah se sab metrics dikhe, duplicate applications na rhe)
- **Better source tracking** (kaunsa platform quality candidates bhej raha hai)
- **Zero data silos** (LinkedIn, Naukri, Indeed, apne platform - sab ek dashboard mein)
- **Scalability ready** (100+ daily applications easily handle kar lega)

### Budget & Timeline
- **MVP (basic version):** 6-8 weeks, ₹4-6 lakhs (in-house development)
- **Full version:** 12-14 weeks, ₹10-15 lakhs
- **Ongoing maintenance:** 20-30 hours/month

### What you get
![Dashboard Preview: Cards showing "Total Applications: 345", "LinkedIn: 120 (35%)", "Naukri: 95 (28%)", "Indeed: 87 (25%)", etc with pie charts and funnels]

---

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Naukri API]    [Indeed Webhook]    [LinkedIn Email]       │
│    (Direct)         (Real-time)        (Parser)              │
│                                                               │
│  [UrbanGaon Platform] (Own Careers Page)                    │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              INGESTION & NORMALIZATION LAYER                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Node.js Backend (Express.js)                               │
│  ├─ Naukri API Client                                       │
│  ├─ Indeed Webhook Handler                                  │
│  ├─ Gmail API Client (LinkedIn email parser)               │
│  ├─ Validation & Normalization Service                     │
│  └─ Resume Download & Storage Manager                       │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA STORAGE LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  MongoDB                      Firebase Storage              │
│  ├─ Candidates Collection     ├─ Resume PDFs               │
│  ├─ Applications Collection   ├─ Candidate Photos          │
│  ├─ Jobs Collection           └─ Documents                 │
│  └─ Activity Logs                                           │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD FRONTEND LAYER                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Next.js + React (TypeScript)                               │
│  ├─ Overview Page (KPIs, source breakdown)                  │
│  ├─ Candidate Pipeline (funnel view)                        │
│  ├─ Individual Candidate Profile                           │
│  ├─ Filters & Search (date, platform, role)                │
│  └─ Reports & Export (CSV, PDF)                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 DATA SCHEMA (Database Structure)

### Candidates Collection
```json
{
  "_id": "ObjectId",
  "name": "Raj Kumar",
  "email": "raj@example.com",
  "phone": "+919876543210",
  "source": "naukri",                    // naukri, indeed, linkedin, own-platform
  "jobAppliedFor": "Senior Frontend Engineer",
  "jobId": "job_12345",
  "resumeUrl": "https://storage.firebase.com/resumes/raj_kumar.pdf",
  "profileUrl": "https://linkedin.com/in/rajkumar",  // if available
  "status": "shortlisted",                // applied, shortlisted, interviewed, offered, rejected
  "currentStage": "round_1",
  "appliedDate": "2024-01-15T10:30:00Z",
  "lastUpdatedDate": "2024-01-18T14:45:00Z",
  "notes": "Good communication skills, needs more experience",
  "rating": 4,                           // 1-5 stars
  "tags": ["frontend", "react", "node.js"],
  "recruiterAssigned": "priya@company.com",
  "metadata": {
    "totalExperience": 3,
    "noticePeriod": "30 days",
    "salary": "12-15 LPA"
  }
}
```

### Applications Collection (activity log)
```json
{
  "_id": "ObjectId",
  "candidateId": "ObjectId",
  "jobId": "job_12345",
  "action": "status_changed",            // applied, status_changed, note_added, etc.
  "previousStatus": "applied",
  "newStatus": "shortlisted",
  "changedBy": "priya@company.com",
  "timestamp": "2024-01-18T14:45:00Z",
  "details": "Shortlisted after phone screening"
}
```

### Jobs Collection
```json
{
  "_id": "job_12345",
  "title": "Senior Frontend Engineer",
  "department": "Engineering",
  "noOfPositions": 2,
  "postedOn": "2024-01-10T00:00:00Z",
  "platforms": ["naukri", "indeed", "linkedin", "own-platform"],
  "platformJobIds": {
    "naukri": "naukri_job_abc123",
    "indeed": "indeed_job_xyz789"
  },
  "status": "active"
}
```

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### Phase 1: Data Ingestion (Weeks 1-3)

#### 1A. Naukri Integration
**API Endpoint:** `POST /api/ingestion/naukri`

```javascript
// Node.js Implementation
const naukriClient = require('naukri-corporate-api');

async function fetchNaukriApplications() {
  const applications = await naukriClient.getApplications({
    apiKey: process.env.NAUKRI_API_KEY,
    filters: {
      fromDate: yesterday(),
      status: 'all'
    }
  });
  
  // Normalize to common schema
  const normalized = applications.map(app => ({
    name: app.candidateName,
    email: app.candidateEmail,
    phone: app.phoneNumber,
    source: 'naukri',
    jobId: app.jobCode,
    resumeUrl: app.resumeUrl,
    status: mapNaukriStatus(app.applicationStatus),
    appliedDate: app.appliedDate,
    // ... other fields
  }));
  
  // Save to MongoDB
  await Candidate.insertMany(normalized);
}

// Run every 15 minutes
cron.schedule('*/15 * * * *', fetchNaukriApplications);
```

**Effort:** 2-3 days | **Status:** ✅ Straightforward

---

#### 1B. Indeed Integration
**Method:** Webhook (Real-time)

```javascript
// When candidate applies on Indeed, you get a webhook:
app.post('/api/ingestion/indeed', (req, res) => {
  const payload = req.body;
  
  const candidate = {
    name: payload.candidate.name,
    email: payload.candidate.email,
    phone: payload.candidate.phone,
    source: 'indeed',
    jobId: payload.job.id,
    resumeUrl: payload.candidate.resume_url,
    appliedDate: new Date(payload.applied_at),
    status: 'applied'
  };
  
  // Download resume to Firebase
  const resumePath = await downloadAndStore(payload.candidate.resume_url);
  candidate.resumeUrl = resumePath;
  
  // Save to MongoDB
  await Candidate.create(candidate);
  res.json({ success: true });
});
```

**Setup:** Indeed Employer Portal → Settings → Webhook → https://yourdomain.com/api/ingestion/indeed

**Effort:** 2-3 days | **Status:** ✅ Moderate (requires Indeed partner approval)

---

#### 1C. LinkedIn Integration (Email Parser)
**Method:** Gmail API + Regex/LLM Parser

```javascript
// LinkedIn sends emails like:
// From: noreply@linkedin.com
// Subject: New applicant for Your Job Title
// Body contains: candidate name, profile link, resume attachment

const { gmail_v1, google } = require('googleapis');

async function checkLinkedInEmails() {
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Get emails from LinkedIn in last 15 minutes
  const emails = await gmail.users.messages.list({
    userId: 'me',
    q: 'from:noreply@linkedin.com after:' + getTimestamp(15)
  });
  
  for (const message of emails.data.messages) {
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id
    });
    
    // Parse email body & extract data
    const parsed = parseLinkedInEmail(fullMsg);
    
    const candidate = {
      name: parsed.candidateName,
      email: parsed.candidateEmail,
      source: 'linkedin',
      profileUrl: parsed.linkedInProfile,
      resumeUrl: await downloadAttachment(fullMsg),
      appliedDate: new Date(fullMsg.internalDate),
      status: 'applied'
    };
    
    await Candidate.create(candidate);
  }
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', checkLinkedInEmails);
```

**Setup Required:**
1. Gmail account for recruiting inbox
2. Google OAuth2 setup
3. Email filter: Mark as "linkedin-applications"

**Effort:** 3-4 days | **Status:** ⚠️ Complex but highly practical

---

#### 1D. Own Platform (UrbanGaon Careers)
```javascript
// When candidate submits form on careers.urbangaon.com

app.post('/api/careers/apply', upload.single('resume'), async (req, res) => {
  // Upload resume to Firebase
  const resumeUrl = await uploadToFirebase(req.file);
  
  const candidate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    source: 'own-platform',
    jobId: req.body.jobId,
    resumeUrl: resumeUrl,
    appliedDate: new Date(),
    status: 'applied'
  };
  
  await Candidate.create(candidate);
  res.json({ success: true, candidateId: candidate._id });
});
```

**Effort:** 1 day | **Status:** ✅ Simplest

---

### Phase 2: Dashboard Frontend (Weeks 4-6)

#### 2A. Overview Page
```typescript
// pages/dashboard/overview.tsx

interface DashboardStats {
  totalApplications: number;
  sourceBreakdown: {
    naukri: number;
    indeed: number;
    linkedin: number;
    ownPlatform: number;
  };
  statusBreakdown: {
    applied: number;
    shortlisted: number;
    interviewed: number;
    offered: number;
    rejected: number;
  };
  metricsLast30Days: {
    avgTimeToHire: number;
    conversionRate: number;
    topPerformingRole: string;
  };
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats>(null);
  const [dateRange, setDateRange] = useState({ from: last30Days(), to: today() });
  
  useEffect(() => {
    fetchDashboardStats(dateRange).then(setStats);
  }, [dateRange]);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Recruitment Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Total Applications" 
          value={stats?.totalApplications} 
          icon="📋"
        />
        <KPICard 
          title="Avg. Time to Hire" 
          value={`${stats?.metricsLast30Days.avgTimeToHire} days`}
          icon="⏱️"
        />
        <KPICard 
          title="Conversion Rate" 
          value={`${stats?.metricsLast30Days.conversionRate}%`}
          icon="📈"
        />
        <KPICard 
          title="Open Positions" 
          value="8"
          icon="💼"
        />
      </div>
      
      {/* Source Breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <PieChart 
          title="Applications by Source"
          data={[
            { name: 'Naukri', value: stats?.sourceBreakdown.naukri },
            { name: 'Indeed', value: stats?.sourceBreakdown.indeed },
            { name: 'LinkedIn', value: stats?.sourceBreakdown.linkedin },
            { name: 'Own Platform', value: stats?.sourceBreakdown.ownPlatform }
          ]}
        />
        
        <BarChart
          title="Status Distribution"
          data={[
            { name: 'Applied', value: stats?.statusBreakdown.applied },
            { name: 'Shortlisted', value: stats?.statusBreakdown.shortlisted },
            { name: 'Interviewed', value: stats?.statusBreakdown.interviewed },
            { name: 'Offered', value: stats?.statusBreakdown.offered },
            { name: 'Rejected', value: stats?.statusBreakdown.rejected }
          ]}
        />
      </div>
      
      {/* Funnel Chart - Conversion Pipeline */}
      <FunnelChart 
        title="Hiring Pipeline"
        stages={[
          { name: 'Applied', value: stats?.statusBreakdown.applied },
          { name: 'Shortlisted', value: stats?.statusBreakdown.shortlisted },
          { name: 'Interviewed', value: stats?.statusBreakdown.interviewed },
          { name: 'Offered', value: stats?.statusBreakdown.offered },
          { name: 'Joined', value: '12' }
        ]}
      />
    </div>
  );
}
```

**Components Used:** Recharts, react-select, date-picker

---

#### 2B. Candidate List & Pipeline
```typescript
// pages/dashboard/candidates.tsx

export default function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({
    source: 'all',
    status: 'all',
    jobId: 'all',
    dateFrom: last30Days(),
    dateTo: today()
  });
  
  // Real-time search
  const [searchText, setSearchText] = useState('');
  
  useEffect(() => {
    fetchCandidates(filters, searchText).then(setCandidates);
  }, [filters, searchText]);
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">All Candidates</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg mb-6 grid grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search by name, email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        
        <Select
          options={[
            { label: 'All Sources', value: 'all' },
            { label: 'Naukri', value: 'naukri' },
            { label: 'Indeed', value: 'indeed' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Own Platform', value: 'own-platform' }
          ]}
          value={filters.source}
          onChange={(val) => setFilters({...filters, source: val})}
        />
        
        <Select
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Applied', value: 'applied' },
            { label: 'Shortlisted', value: 'shortlisted' },
            { label: 'Interviewed', value: 'interviewed' },
            { label: 'Offered', value: 'offered' }
          ]}
          value={filters.status}
          onChange={(val) => setFilters({...filters, status: val})}
        />
        
        <DateRangePicker 
          startDate={filters.dateFrom}
          endDate={filters.dateTo}
          onChange={(from, to) => setFilters({...filters, dateFrom: from, dateTo: to})}
        />
        
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Export CSV
        </button>
      </div>
      
      {/* Candidate Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Applied For</th>
            <th className="p-3 text-left">Source</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Resume</th>
            <th className="p-3 text-left">Applied Date</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate._id} className="border-t hover:bg-gray-50">
              <td className="p-3">{candidate.name}</td>
              <td className="p-3">{candidate.email}</td>
              <td className="p-3">{candidate.jobAppliedFor}</td>
              <td className="p-3">
                <badge source={candidate.source}>
                  {getSourceLabel(candidate.source)}
                </badge>
              </td>
              <td className="p-3">
                <select 
                  value={candidate.status}
                  onChange={(e) => updateCandidateStatus(candidate._id, e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td className="p-3">
                <a 
                  href={candidate.resumeUrl}
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  📄 View
                </a>
              </td>
              <td className="p-3 text-sm">{formatDate(candidate.appliedDate)}</td>
              <td className="p-3 text-center">
                <Link href={`/dashboard/candidate/${candidate._id}`}>
                  <button className="text-blue-500 hover:underline">View Profile</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <Pagination total={candidates.length} pageSize={20} />
    </div>
  );
}
```

---

#### 2C. Individual Candidate Profile
```typescript
// pages/dashboard/candidate/[id].tsx

export default function CandidateProfile() {
  const { id } = useRouter().query;
  const [candidate, setCandidate] = useState(null);
  const [activity, setActivity] = useState([]);
  
  useEffect(() => {
    Promise.all([
      fetchCandidate(id),
      fetchCandidateActivity(id)
    ]).then(([c, a]) => {
      setCandidate(c);
      setActivity(a);
    });
  }, [id]);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{candidate?.name}</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Left: Profile Info */}
        <div className="col-span-2 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-gray-600 text-sm">Email</label>
              <p className="font-semibold">{candidate?.email}</p>
            </div>
            <div>
              <label className="text-gray-600 text-sm">Phone</label>
              <p className="font-semibold">{candidate?.phone}</p>
            </div>
            <div>
              <label className="text-gray-600 text-sm">Applied For</label>
              <p className="font-semibold">{candidate?.jobAppliedFor}</p>
            </div>
            <div>
              <label className="text-gray-600 text-sm">Source</label>
              <badge source={candidate?.source}>{getSourceLabel(candidate?.source)}</badge>
            </div>
            <div>
              <label className="text-gray-600 text-sm">Experience</label>
              <p className="font-semibold">{candidate?.metadata?.totalExperience} years</p>
            </div>
            <div>
              <label className="text-gray-600 text-sm">Expected Salary</label>
              <p className="font-semibold">{candidate?.metadata?.salary}</p>
            </div>
          </div>
          
          <hr className="mb-6" />
          
          <h2 className="text-xl font-bold mb-4">Resume</h2>
          <div className="flex items-center gap-4">
            <a href={candidate?.resumeUrl} target="_blank" className="text-blue-500">
              📄 {candidate?.name}'s Resume
            </a>
            <a href={candidate?.resumeUrl} download className="text-blue-500">
              ⬇️ Download
            </a>
          </div>
          
          {candidate?.profileUrl && (
            <div className="mt-4">
              <a href={candidate.profileUrl} target="_blank" className="text-blue-500">
                🔗 LinkedIn Profile
              </a>
            </div>
          )}
          
          <hr className="my-6" />
          
          <h2 className="text-xl font-bold mb-4">Notes & Assessment</h2>
          <textarea
            value={candidate?.notes}
            onChange={(e) => updateCandidateNotes(id, e.target.value)}
            className="w-full border rounded p-3 min-h-24"
            placeholder="Add any notes about this candidate..."
          />
          
          <div className="mt-4 flex gap-2">
            <label className="flex items-center gap-2">
              <span>Rating:</span>
              <StarRating 
                value={candidate?.rating}
                onChange={(r) => updateCandidateRating(id, r)}
              />
            </label>
          </div>
        </div>
        
        {/* Right: Status & Activity */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Current Status</h2>
          <div className="mb-6">
            <select 
              value={candidate?.status}
              onChange={(e) => updateCandidateStatus(id, e.target.value)}
              className="w-full px-3 py-2 border rounded text-lg font-semibold"
            >
              <option value="applied">✓ Applied</option>
              <option value="shortlisted">⭐ Shortlisted</option>
              <option value="interviewed">📞 Interviewed</option>
              <option value="offered">🎉 Offered</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          
          <hr className="mb-6" />
          
          <h2 className="text-lg font-bold mb-4">Activity Timeline</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activity.map((log, idx) => (
              <div key={idx} className="text-sm border-l-2 border-blue-300 pl-3">
                <p className="font-semibold text-gray-800">{log.action}</p>
                <p className="text-gray-600">{log.details}</p>
                <p className="text-xs text-gray-400">{formatDate(log.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Assigned Recruiter */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-bold mb-4">Assignment</h2>
        <div>
          <label className="text-gray-600 text-sm">Assigned To</label>
          <select 
            value={candidate?.recruiterAssigned || ''}
            onChange={(e) => assignRecruiter(id, e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Unassigned</option>
            <option value="priya@company.com">Priya Sharma</option>
            <option value="amit@company.com">Amit Singh</option>
            <option value="neha@company.com">Neha Verma</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 3: Backend API (Weeks 4-5)

#### 3A. API Endpoints
```
GET    /api/dashboard/stats              - Get overview KPIs
GET    /api/candidates                   - List candidates (with filters)
GET    /api/candidates/:id               - Get single candidate
PATCH  /api/candidates/:id               - Update candidate status/notes
GET    /api/candidates/:id/activity      - Get activity timeline
POST   /api/reports/export               - Export to CSV/PDF
GET    /api/analytics/source-performance - Source quality analytics
GET    /api/analytics/time-to-hire       - Avg hiring time per role
POST   /api/ingestion/naukri            - Naukri webhook/cron trigger
POST   /api/ingestion/indeed            - Indeed webhook
POST   /api/ingestion/email             - LinkedIn email parser
```

#### 3B. Key Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "firebase-admin": "^11.5.0",
    "axios": "^1.3.0",
    "node-cron": "^3.0.2",
    "googleapis": "^118.0.0",
    "pdf-parse": "^1.1.1",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "typescript": "^4.9.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}
```

---

## 📅 IMPLEMENTATION ROADMAP

### Week 1-3: Data Layer Setup
- [ ] Naukri API integration
- [ ] MongoDB schema setup
- [ ] Firebase Storage config
- [ ] Naukri data sync running
- **Deliverable:** Naukri data flowing into dashboard

### Week 4-5: Dashboard MVP
- [ ] Overview page with KPIs
- [ ] Candidate list with filters
- [ ] Status update functionality
- [ ] Resume view/download
- **Deliverable:** Basic dashboard working with Naukri data

### Week 6: Integration Extensions
- [ ] Indeed webhook setup
- [ ] LinkedIn email parser
- [ ] Own platform integration
- [ ] Multi-source data deduplication
- **Deliverable:** All 4 sources feeding data

### Week 7-8: Polish & Optimization
- [ ] Search & sorting improvements
- [ ] CSV export functionality
- [ ] Analytics dashboards
- [ ] Performance optimization
- [ ] Security audit
- **Deliverable:** Production-ready dashboard

### Week 9+: Advanced Features (Post-MVP)
- [ ] Duplicate candidate detection (ML)
- [ ] Candidate ranking algorithm
- [ ] Automated email workflows
- [ ] Interview scheduling integration
- [ ] Slack notifications

---

## 💻 TECH STACK RECOMMENDATION

```
Frontend:
├─ Next.js 13+ (React 18)
├─ TypeScript
├─ TailwindCSS (styling)
├─ Recharts (charts/analytics)
└─ Zustand (state management)

Backend:
├─ Node.js (Express.js)
├─ TypeScript
├─ MongoDB (database)
├─ Firebase (file storage)
└─ Jest (testing)

DevOps:
├─ Docker (containerization)
├─ GitHub Actions (CI/CD)
├─ Vercel (Next.js hosting)
└─ MongoDB Atlas (managed DB)

Third-party:
├─ Naukri Corporate API
├─ Indeed Employer API
├─ Google Gmail API (LinkedIn)
└─ SendGrid (email notifications)
```

---

## 🔐 Security Checklist

- [ ] API authentication (JWT tokens)
- [ ] Rate limiting on ingestion endpoints
- [ ] Resume file virus scanning before storage
- [ ] Data encryption at rest (MongoDB)
- [ ] SSL/TLS for all communications
- [ ] PII data compliance (GDPR-ready)
- [ ] Regular backups (daily)
- [ ] Access control (role-based)
- [ ] Audit logs for all data changes
- [ ] CORS configuration

---

## 📊 EXPECTED OUTPUT (Dashboard Screens)

### Screen 1: Overview/Home Page
```
┌─────────────────────────────────────────────────────┐
│  RECRUITMENT DASHBOARD                      🔔 👤  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┬──────────────┬─────────┬────────┐ │
│  │ Applications │ Time to Hire │ Conv.   │ Open   │ │
│  │     345      │   12.5 days  │  23.4%  │   8    │ │
│  │   📈 ↑12%   │   ↓ 2 days   │  ↑ 4%   │ Roles  │ │
│  └──────────────┴──────────────┴─────────┴────────┘ │
│                                                      │
│  ┌────────────────────┐  ┌────────────────────┐   │
│  │ Applications by    │  │ Pipeline Status    │   │
│  │ Source             │  │ Applied: 345       │   │
│  │                    │  │ Shortlist: 87 (25%)│   │
│  │ Naukri:  120 (35%) │  │ Interview: 32 (9%) │   │
│  │ Indeed:   87 (25%) │  │ Offered:    8 (2%) │   │
│  │ LinkedIn:  95 (28%)│  │ Joined:    12 (3%) │   │
│  │ Own Pl:   43 (12%) │  │                    │   │
│  └────────────────────┘  └────────────────────┘   │
│                                                      │
│  [LINE GRAPH: Applications per day last 30 days]   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Screen 2: Candidate List
```
┌──────────────────────────────────────────────────────────┐
│  ALL CANDIDATES                                    🔍 +  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [Search box] [Source ▼] [Status ▼] [Date Range] [CSV] │
│                                                           │
│  Name         │ Email             │ Role         │ Sour │
│  ───────────────────────────────────────────────────────  │
│  Raj Kumar    │ raj@gmail.com     │ Sr Frontend │ NAUK │
│  ┌─ Status:  ┬ [Shortlisted ▼]   │ 8d ago      │ ⭐⭐⭐⭐⭐ │
│  │ Resume: 📄│ View              │ Resume: 📄  │       │
│  └───────────────────────────────────────────────────────  │
│                                                           │
│  Priya Singh  │ priya@outlook.com │ QA Lead     │ INDE  │
│  │ Status:    ┬ [Applied ▼]       │ 2d ago      │ ⭐⭐⭐⭐   │
│  │ Resume: 📄│ View              │ Resume: 📄  │       │
│  └───────────────────────────────────────────────────────  │
│                                                           │
│  Amit Verma   │ amit.v@gmail.com  │ Backend Dev │ LINK  │
│  │ Status:    ┬ [Interviewed ▼]   │ 5d ago      │ ⭐⭐⭐⭐⭐ │
│  │ Resume: 📄│ View              │ Resume: 📄  │       │
│  └───────────────────────────────────────────────────────  │
│                                                           │
│  < 1 2 3 ... 15 >                                Rows: 20 │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Screen 3: Candidate Profile
```
┌──────────────────────────────────────────────────────────┐
│  RAJ KUMAR                                          ← Back│
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │ Contact Info            │  │ Current Status       │  │
│  │                         │  │                      │  │
│  │ Email: raj@gmail.com    │  │ [Shortlisted ▼]     │  │
│  │ Phone: +91-9876543210   │  │                      │  │
│  │ Role: Sr Frontend       │  │ Activity Log         │  │
│  │ Source: Naukri          │  │ ────────────────────│  │
│  │ Exp: 3 years            │  │ ✓ Shortlisted       │  │
│  │ Salary: 12-15 LPA       │  │   by Priya (2d ago)│  │
│  │                         │  │                      │  │
│  │ Resume: 📄 View Download │  │ ✓ Applied           │  │
│  │ LinkedIn: 🔗 Visit      │  │   from Naukri (5d)│  │
│  │                         │  │                      │  │
│  │ ─────────────────────── │  │ Assigned To:        │  │
│  │ Notes & Rating          │  │ [Priya Sharma ▼]    │  │
│  │                         │  │                      │  │
│  │ [⭐⭐⭐⭐⭐] 4.5/5       │  │                      │  │
│  │                         │  │                      │  │
│  │ [Text area for notes]   │  │                      │  │
│  │ Good communication...   │  │                      │  │
│  │                         │  │                      │  │
│  └─────────────────────────┘  └──────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Environment variables setup (.env.local, .env.production)
- [ ] Database backups automated
- [ ] Error logging setup (Sentry/LogRocket)
- [ ] Monitoring & alerts configured
- [ ] Load testing completed
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] Documentation complete
- [ ] Team training completed

---

## 📞 SUPPORT & MAINTENANCE

**In-house Team:**
- 1 Backend Developer (Node.js/MongoDB)
- 1 Frontend Developer (React/Next.js)
- 1 DevOps Engineer (part-time)

**Estimated Monthly Effort:**
- Feature development: 40-60 hours
- Bug fixes & improvements: 20-30 hours
- Infrastructure & monitoring: 10-20 hours

---

## 📈 SUCCESS METRICS

| Metric | Target | Timeline |
|--------|--------|----------|
| Dashboard uptime | 99.5% | Week 8 onwards |
| Data sync latency | <5 minutes | Week 6 |
| Page load time | <2 seconds | Week 8 |
| User adoption (team) | 100% | Week 10 |
| Hiring speed improvement | +40% | Month 3 |
| Data accuracy | 99%+ | Week 6 |

---

## ❓ FAQ FOR STAKEHOLDERS

**Q: Agar LinkedIn se seedha API na mile to kya hoga?**
A: Email parser approach 99% reliable hai aur 5 minute mein data update ho jaata hai. Bahut effective workaround hai.

**Q: Data security ke baare mein?**
A: Resumes sirf Firebase Storage pe encrypted hain, database mein sirf URLs hain. PII data encrypted at rest. Regular backups + audit logs.

**Q: Kitna scalable hai ye solution?**
A: 100K+ daily applications handle kar sakta hai without architecture changes. Cloud infrastructure pe scale karna easy hai.

**Q: Duplicate candidates ka kya?**
A: Phase 2 mein email-based fuzzy matching implement karenge. ML model phase 3 mein.

---

## 📄 APPENDIX: Sample Naukri API Response

```json
{
  "statusCode": 200,
  "data": {
    "applications": [
      {
        "candidateId": "12345",
        "candidateName": "Raj Kumar",
        "candidateEmail": "raj@example.com",
        "phoneNumber": "+919876543210",
        "jobCode": "job_12345",
        "jobTitle": "Senior Frontend Engineer",
        "resumeUrl": "https://naukri.com/resumes/raj123.pdf",
        "applicationStatus": "applied",
        "appliedDate": "2024-01-15T10:30:00Z",
        "totalExperience": 3,
        "noticePeriod": 30,
        "expectedSalary": {
          "minSalary": 1200000,
          "maxSalary": 1500000,
          "currency": "INR"
        }
      }
    ]
  }
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Ready for Development
