# Technical Interview Guide: Codebase Architecture & File Walkthrough

> **Role Standard:** SDE-2 / SDE-3 Enterprise MERN & TypeScript Platform
> **Key Metric:** Real-time dual-persistence with MongoDB Atlas, sub-millisecond client state hydration, and zero-reload WebSocket ingestion.

---

## 1. How to Answer: 'Can you walk me through your project structure?'

> 'I structured this platform using a **Decoupled Client-Server Monorepo pattern** with strict Separation of Concerns (SoC):
> 
> 1. **frontend/** contains a typed React 18 single-page application built with Vite and Tailwind CSS. It manages local UI state using React Context API as a single source of truth, backed by optimistic UI updates and resilient fallback caching.
> 2. **backend/** is an Express.js microservice utilizing Mongoose ODM to interface with a cloud MongoDB Atlas cluster, fortified with automatic DNS fallbacks and dual-persistence (in-memory buffering if the network drops).
> 3. Real-time bidirectional event streaming is powered by Socket.io, allowing multi-portal applications (from LinkedIn or Naukri) to pop up instantly on the recruiter's screen without browser reloads.
> 
> Let me walk you through the key files and how data flows from user action to persistent cloud storage.'

---

## 2. Frontend Files Walkthrough (frontend/)

### Core State & Routing
- **src/App.tsx**  
  **Responsibility:** The Root Layout Orchestrator.  
  **Code Inside:** Mounts the persistent Sidebar and TopHeader. Based on activeView from context, dynamically renders one of the main views (MainDashboard, CandidateTable, CandidateKanban, InterviewScheduler, or CallingDesk). Also globally mounts all modals to prevent unnecessary component tree re-renders.

- **src/context/RecruitmentContext.tsx**  
  **Responsibility:** The Brain & State Machine of the application.  
  **Code Inside:**  
  1. useEffect on mount triggers Promise.allSettled to hydrate candidates, jobs, interviews, and callRecords directly from MongoDB Atlas.  
  2. Sets up the socket.io listener for NEW_CANDIDATE_INGESTED events.  
  3. Houses every mutation function (updateCandidateStatus, addCandidateNote, updateCandidateRating, logCallRecord, scheduleInterview).  
  4. Implements Optimistic Updates: updates React state immediately for instant 60fps UX, while simultaneously dispatching asynchronous PATCH/POST requests to the backend.

### Network & Utility Layers
- **src/services/api.ts**  
  **Responsibility:** HTTP Client abstraction (REST API Bridge).  
  **Code Inside:** Encapsulates all fetch() operations to /api/candidates/*, /api/jobs/*, /api/interviews/*, and /api/calls/* with standardized JSON serialization, error handling, and type-safe payload definitions.

- **src/services/socket.ts**  
  **Responsibility:** Singleton WebSocket connection manager.  
  **Code Inside:** Exports getSocket() and closeSocket() to ensure only a single WebSocket handshake is maintained, preventing memory leaks and duplicate socket listeners.

- **src/utils/resumeParser.ts**  
  **Responsibility:** Client-side ATS Matching & Text Processing Engine.  
  **Code Inside:**  
  1. Parses raw resume text or PDF uploads.  
  2. Uses regex keyword extraction for technical skills, years of experience, and contact metadata.  
  3. calculateAtsMatchScore() compares parsed skills against active JobPosting requirements and computes a weighted ATS compatibility score (70% - 98%).

- **src/utils/resumeGenerator.ts**  
  **Responsibility:** Client-side PDF Generation.  
  **Code Inside:** Uses jsPDF to build clean, ATS-compliant resumes with structured sections on the fly without burdening backend compute.

### Key Views & Modules
- **src/components/views/CallingDesk.tsx**  
  **Responsibility:** High-Velocity Candidate Telephonic Screening CRM.  
  **Code Inside:** Manages call queues, interactive stopwatch timer for call duration, disposition selector (Interested, Callback, Disqualified), confirmed CTC and notice period inputs, and bulk resume drag-and-drop integration.

- **src/components/views/CandidateKanban.tsx**  
  **Responsibility:** Drag-and-drop Visual Recruitment Pipeline.  
  **Code Inside:** Groups candidates by status columns (Applied, Screening, Interview R1/R2, Offered, Hired). Triggers status change API calls when candidates are moved.

---

## 3. Backend Files Walkthrough (backend/)

### Entry & Configuration
- **server.js**  
  **Responsibility:** Express & WebSocket Server Bootstrap.  
  **Code Inside:** Initializes CORS, JSON body parsers, connects to MongoDB Atlas, executes initial DB seeding, mounts /api routes, starts Socket.io on the HTTP server, and launches background schedulers.

- **config/database.js**  
  **Responsibility:** Resilient Cloud Database Connection.  
  **Code Inside:**  
  1. Overrides Node.js DNS servers to Google (8.8.8.8) and Cloudflare (1.1.1.1) to resolve MongoDB SRV connection issues.  
  2. Implements automatic graceful fallback to local MongoDB or in-memory persistence if internet or Atlas cluster is unreachable.

### Routes & Controllers (MVC Pattern)
- **routes/candidateRoutes.js & controllers/candidateController.js**  
  **Responsibility:** Candidate CRUD & Audit History.  
  **Code Inside:**  
  - GET /api/candidates: Fetches all candidates sorted by recency.  
  - PATCH /api/candidates/:id/status: Updates stage and automatically pushes an audit event into the candidate's activityHistory array.  
  - POST /api/candidates/bulk: Batch inserts parsed resumes from CallingDesk.

- **routes/callRoutes.js & controllers/callController.js**  
  **Responsibility:** Telephonic Audit & Cross-Collection Sync.  
  **Code Inside:**  
  - POST /api/calls: Saves a new CallRecord in the callrecords collection, and simultaneously updates the candidate document to track callingDetails and follow-up alerts in a single database operation.

- **controllers/webhookController.js**  
  **Responsibility:** Multi-Portal Webhook Ingestion.  
  **Code Inside:** Normalizes heterogeneous payloads from LinkedIn, Naukri, Apna, and Indeed into a standardized Candidate document, persists it in MongoDB, and triggers broadcastNewCandidate() via WebSocket.

### Schemas & Data Layer
- **models/Candidate.js**  
  **Responsibility:** Comprehensive Candidate Schema.  
  **Code Inside:** Mongoose schema defining fields for personal info, ATS scores, recruiter assignment, parsed resume JSON, interview scorecards, telecalling history, and chronological activityHistory.

- **models/Job.js, Interview.js, CallRecord.js**  
  **Responsibility:** Normalized data structures for job openings, interview rounds, and telephonic screening audit records.