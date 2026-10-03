# UrbanGaon Unified Recruitment Platform

> Enterprise-Grade Architecture: Clean Separation of **Frontend** (React + Vite + TypeScript) and **Backend** (Node.js + Express + MongoDB Atlas).

---

## 📁 Repository Layout

`
Recruitment Dashboard/
├── 📂 frontend/                  # Complete Client-Side React SPA
│   ├── package.json              # Frontend scripts & dependencies
│   ├── index.html                # HTML entry point
│   ├── vite.config.ts            # Vite dev & build configuration (API proxy: :5000)
│   ├── tsconfig.json             # TypeScript configuration
│   ├── tailwind.config.js        # Tailwind CSS styling tokens
│   ├── postcss.config.js         # PostCSS configuration
│   ├── vercel.json               # SPA routing headers for deployment
│   ├── node_modules/             # Dedicated Frontend dependencies
│   ├── public/                   # Static icons, portal logos, manifest & service worker
│   └── src/
│       ├── main.tsx              # React DOM entry
│       ├── App.tsx               # Main layout (Sidebar, Header, Dynamic Views, Modals)
│       ├── index.css             # Tailwind base & design system
│       ├── types/                # Strict TypeScript interfaces
│       ├── context/              # Global RecruitmentContext (State + Live Atlas sync)
│       ├── services/             # api.ts (Full CRUD) & socket.ts (WebSocket singleton)
│       ├── data/                 # Offline fallback seed & countries
│       ├── utils/                # ATS PDF generator, scorecard generator, resume parser
│       ├── assets/               # Brand & platform images
│       └── components/
│           ├── layout/           # Sidebar, TopHeader, Navbar
│           ├── views/            # Dashboard, Candidates, Jobs, Pipeline, Scheduler, CallingDesk
│           ├── modals/           # Profile, Scorecard, BulkUpload, ResumePreview
│           ├── candidate/        # CandidateCallTab
│           └── common/           # ToastContainer, PortalLogo, Pagination, Flag
│
├── 📂 backend/                   # Complete REST & WebSocket API Server
│   ├── package.json              # Backend dependencies & scripts
│   ├── server.js                 # Express server & WebSocket initialization
│   ├── .env                      # Database URI & credentials (cluster0.mflxz4m.mongodb.net)
│   ├── node_modules/             # Dedicated Backend dependencies
│   ├── config/                   # database.js (resilient connection + DNS fallback) & env.js
│   ├── models/                   # Mongoose ODM models (Candidate, Job, Interview, CallRecord)
│   ├── controllers/              # Candidate, Job, Interview, Call, Webhook, Sync controllers
│   ├── routes/                   # Clean REST routes mapped under /api/*
│   ├── services/                 # Dual-persistence store, dbSeeder, LinkedIn IMAP fetcher
│   ├── sockets/                  # Real-time WebSocket broadcasting handler
│   └── data/                     # seedData.json (Master seed dataset)
│
├── 📂 docs/                      # Platform specifications & documentation
│   ├── recruitment_dashboard_spec.md
│   ├── scripts/                  # Standalone report generator & icon utilities
│   └── shortcuts/                # Desktop shortcut installer helpers
│
├── .gitignore                    # Comprehensive ignore rules
├── package.json                  # Root runner orchestrator
└── README.md                     # Architecture documentation
`

---

## 🚀 Quick Start Guide

### Option 1: Run From Root (Orchestrator)
`powershell
# Run both Backend & Frontend simultaneously:
npm run dev:all

# Or run individually from root:
npm run dev:backend     # Express API Server on http://localhost:5000
npm run dev:frontend    # Vite Frontend App on http://localhost:3001
`

### Option 2: Run From Dedicated Folders
`powershell
# Terminal 1 — Backend:
cd backend
npm run dev

# Terminal 2 — Frontend:
cd frontend
npm run dev
`

---

## 🗄️ Database: MongoDB Atlas
- **Cluster:** cluster0.mflxz4m.mongodb.net
- **Database:** ecruitment_dashboard
- **Collections:** candidates, jobs, interviews, callrecords
- **Dual-Persistence:** If network drops, gracefully maintains in-memory store and re-syncs once reconnected.
