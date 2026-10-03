import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get base64 data url for images
function getImageDataUrl(relPath) {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
    const base64 = fs.readFileSync(fullPath).toString('base64');
    return `data:${mime};base64,${base64}`;
  }
  return '';
}

const logoUrbanGaon = getImageDataUrl('public/urbangaon-logo.png');
const iconUrbanGaon = getImageDataUrl('public/urbangaon-icon.png');
const logoNaukri = getImageDataUrl('public/naukri-logo.png');
const logoIndeed = getImageDataUrl('public/indeed-logo.png');
const logoApna = getImageDataUrl('public/apna-logo.jpg');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Unified Recruitment & Talent Intelligence Platform - Executive Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e40af;
      --primary-dark: #0f172a;
      --primary-light: #3b82f6;
      --secondary: #0ea5e9;
      --accent: #6366f1;
      --success: #059669;
      --warning: #d97706;
      --danger: #dc2626;
      --surface: #ffffff;
      --bg: #f8fafc;
      --card-border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #475569;
      --text-light: #64748b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f1f5f9;
      color: var(--text-main);
      font-size: 13.5px;
      line-height: 1.6;
      padding: 0;
      margin: 0;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 16mm 18mm 15mm 18mm;
      margin: 0 auto;
      background: #ffffff;
      position: relative;
      page-break-after: always;
      page-break-inside: avoid;
      break-after: page;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      box-sizing: border-box;
    }

    @media screen {
      .page {
        margin: 20px auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        border-radius: 4px;
      }
    }

    /* Header & Footer on Inner Pages */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 24px;
      border-bottom: 1.5px solid #e2e8f0;
    }

    .page-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-header-logo {
      height: 24px;
      width: auto;
      object-fit: contain;
    }

    .page-header-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
    }

    .page-header-badge {
      font-size: 10px;
      font-weight: 700;
      color: #1e40af;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      margin-top: auto;
      border-top: 1px solid #e2e8f0;
      font-size: 10.5px;
      color: #94a3b8;
    }

    .page-content {
      flex: 1;
    }

    /* Typography */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    h1 { font-size: 26px; line-height: 1.25; margin-bottom: 12px; }
    h2 { font-size: 18px; line-height: 1.3; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    h3 { font-size: 14.5px; line-height: 1.35; margin-bottom: 8px; font-weight: 700; }
    p { margin-bottom: 10px; color: var(--text-muted); }

    /* Badges & Tags */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-primary { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .badge-purple { background: #f5f3ff; color: #5b21b6; border: 1px solid #ddd6fe; }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .card-highlight {
      background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
      border: 1px solid #bfdbfe;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    /* KPI Stat Boxes */
    .stat-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      position: relative;
      overflow: hidden;
    }
    .stat-box::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--primary);
    }
    .stat-box.green::before { background: var(--success); }
    .stat-box.sky::before { background: var(--secondary); }
    .stat-box.amber::before { background: var(--warning); }
    .stat-box.purple::before { background: var(--accent); }

    .stat-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .stat-desc {
      font-size: 10.5px;
      color: #64748b;
    }

    /* Feature Item Lists */
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12.5px;
      color: #334155;
    }
    .feature-item svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: #2563eb;
    }

    /* Tables */
    .styled-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 12px;
    }
    .styled-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 9px 12px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 10.5px;
      letter-spacing: 0.5px;
    }
    .styled-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: middle;
    }
    .styled-table tr:last-child td {
      border-bottom: none;
    }
    .styled-table tr:nth-child(even) td {
      background: #fafcff;
    }

    /* Portal Badge */
    .portal-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .portal-naukri { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .portal-linkedin { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }
    .portal-indeed { background: #ede9fe; color: #5b21b6; border: 1px solid #ddd6fe; }
    .portal-apna { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .portal-urbangaon { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .portal-internshala { background: #cffafe; color: #0e7490; border: 1px solid #a5f3fc; }

    /* Callout Alert */
    .callout {
      padding: 12px 14px;
      border-radius: 10px;
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      margin: 10px 0 14px 0;
      font-size: 12.5px;
      color: #1e3a8a;
    }
    .callout-success {
      background: #ecfdf5;
      border-left-color: #059669;
      color: #064e3b;
    }

    /* Cover Page */
    .cover-page {
      background: linear-gradient(145deg, #091224 0%, #0f1e3d 50%, #172e5c 100%);
      color: #ffffff;
      padding: 24mm 22mm 22mm 22mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .cover-page::before {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 450px; height: 450px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 70%);
      pointer-events: none;
    }
    .cover-page::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%);
      pointer-events: none;
    }
    .cover-top {
      position: relative;
      z-index: 10;
    }
    .cover-logo-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .cover-logo {
      height: 38px;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }
    .cover-tag {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #93c5fd;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .cover-hero {
      position: relative;
      z-index: 10;
      margin-top: 20px;
    }
    .cover-category {
      font-size: 13px;
      font-weight: 800;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .cover-title {
      font-size: 34px;
      line-height: 1.18;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    .cover-title span {
      background: linear-gradient(90deg, #60a5fa, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover-subtitle {
      font-size: 15px;
      line-height: 1.55;
      color: #94a3b8;
      max-width: 580px;
      margin-bottom: 30px;
    }
    .cover-highlights {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 30px;
    }
    .cover-pill-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 14px;
      backdrop-filter: blur(6px);
    }
    .cover-pill-val {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 2px;
    }
    .cover-pill-lbl {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }
    .cover-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 20px;
    }
    .author-title {
      font-size: 11px;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .author-name {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }
    .author-role {
      font-size: 12px;
      color: #38bdf8;
      font-weight: 600;
    }
    .doc-meta {
      text-align: right;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }

    /* Visual Process Pipeline */
    .pipeline-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 16px 0;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 10px;
    }
    .flow-step {
      text-align: center;
      flex: 1;
      padding: 0 4px;
    }
    .flow-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 6px auto;
      font-weight: 800;
      font-size: 12px;
      border: 1px solid #bfdbfe;
    }
    .flow-step.active .flow-icon {
      background: #2563eb;
      color: #ffffff;
    }
    .flow-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }
    .flow-sub {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }
    .flow-arrow {
      color: #cbd5e1;
      font-size: 14px;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- ========================================================
       PAGE 1: COVER PAGE
       ======================================================== -->
  <div class="page cover-page">
    <div class="cover-top">
      <div class="cover-logo-row">
        <div>
          ${logoUrbanGaon ? `<img src="${logoUrbanGaon}" alt="UrbanGaon Logo" class="cover-logo">` : `<div style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">UrbanGaon <span style="color: #38bdf8;">Talent</span></div>`}
        </div>
        <div class="cover-tag">Enterprise Edition v2.4</div>
      </div>

      <div class="cover-hero">
        <div class="cover-category">Official Executive System Architecture & Operations Manual</div>
        <h1 class="cover-title">Unified Recruitment & <span>Talent Intelligence</span> Platform</h1>
        <p class="cover-subtitle">
          Ek centralized, multi-channel recruitment operating system jo company ke sabhi hiring channels (LinkedIn, Naukri, Indeed, Apna, Internshala & Careers Page) ko ek smart, real-time command dashboard me integrate karta hai.
        </p>

        <div class="cover-highlights">
          <div class="cover-pill-box">
            <div class="cover-pill-val">6+ Portals</div>
            <div class="cover-pill-lbl">Unified Ingestion Hub</div>
          </div>
          <div class="cover-pill-box">
            <div class="cover-pill-val">40% Faster</div>
            <div class="cover-pill-lbl">Hiring Cycle Velocity</div>
          </div>
          <div class="cover-pill-box">
            <div class="cover-pill-val">Zero Silos</div>
            <div class="cover-pill-lbl">Single Source of Truth</div>
          </div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <div class="author-title">Architected & Authored By</div>
        <div class="author-name">Akash Das</div>
        <div class="author-role">Chief Executive Officer & SDE-3 Lead</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">UrbanGaon Technologies Pvt. Ltd.</div>
      </div>
      <div class="doc-meta">
        <div><strong>Document Status:</strong> Complete & Live</div>
        <div><strong>Target Audience:</strong> Founders, Board & HR Heads</div>
        <div><strong>Date:</strong> September 2026</div>
        <div><strong>Classification:</strong> Confidential / Internal Executive</div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       PAGE 2: EXECUTIVE SUMMARY & STRATEGIC PROBLEM STATEMENT
       ======================================================== -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${iconUrbanGaon ? `<img src="${iconUrbanGaon}" class="page-header-logo" alt="Logo">` : ''}
        <span class="page-header-title">Executive Overview & Business Value</span>
      </div>
      <div class="page-header-badge">Strategic Brief</div>
    </div>

    <div class="page-content">
      <h2>
        <span style="color: #2563eb;">01.</span> Executive Summary & The Problem We Solved
      </h2>

      <p style="font-size: 13.5px; line-height: 1.6; color: #334155; margin-bottom: 14px;">
        Pehle hamari recruitment team multiple alag-alag tabs aur websites par dependent thi—jaise <strong>Naukri, LinkedIn, Indeed, Apna, aur company email inboxes</strong>. Is manual process ki wajah se 3 bade business losses ho rahe the:
      </p>

      <div class="grid-3">
        <div class="card card-highlight">
          <div style="font-size: 24px; margin-bottom: 6px;">⏳</div>
          <h3 style="color: #1e3a8a;">4-5 Ghante Daily Waste</h3>
          <p style="font-size: 12px; margin: 0; color: #475569;">HRs ka adha din alag portals login karne, CSV download karne aur candidate list manually maintain karne me ja raha tha.</p>
        </div>
        <div class="card card-highlight">
          <div style="font-size: 24px; margin-bottom: 6px;">📉</div>
          <h3 style="color: #1e3a8a;">Candidate Drop-off</h3>
          <p style="font-size: 12px; margin: 0; color: #475569;">Delayed responses aur missed follow-ups ki wajah se top 10% high-quality talent dusri companies me select ho jata tha.</p>
        </div>
        <div class="card card-highlight">
          <div style="font-size: 24px; margin-bottom: 6px;">🚫</div>
          <h3 style="color: #1e3a8a;">Zero Hiring Analytics</h3>
          <p style="font-size: 12px; margin: 0; color: #475569;">Leadership ko pata nahi chal pata tha ki kaun sa hiring channel sabse sasta aur sabse best conversion de raha hai.</p>
        </div>
      </div>

      <div class="callout callout-success">
        <strong>Hamara Solution (CEO Perspective):</strong> Humne ek <strong>Single Unified Operating System</strong> design kiya jo sabhi job boards ko API, Webhooks aur Automated Email Parsers ke zariye real-time connect karta hai. Ab kisi bhi recruiter ko 5 alag windows kholne ki jarurat nahi hai.
      </div>

      <h3 style="margin-top: 18px; margin-bottom: 8px;">Recruitment Pipeline Flow: Candidate Application to Onboarding</h3>
      
      <div class="pipeline-flow">
        <div class="flow-step">
          <div class="flow-icon">1</div>
          <div class="flow-label">Multi-Portal Ingestion</div>
          <div class="flow-sub">Naukri, LinkedIn, etc.</div>
        </div>
        <div class="flow-arrow">➔</div>
        <div class="flow-step">
          <div class="flow-icon">2</div>
          <div class="flow-label">Smart ATS Screening</div>
          <div class="flow-sub">Auto Match Score</div>
        </div>
        <div class="flow-arrow">➔</div>
        <div class="flow-step active">
          <div class="flow-icon">3</div>
          <div class="flow-label">Live Telecalling</div>
          <div class="flow-sub">Screening & Notes</div>
        </div>
        <div class="flow-arrow">➔</div>
        <div class="flow-step">
          <div class="flow-icon">4</div>
          <div class="flow-label">Interview Hub</div>
          <div class="flow-sub">Meet / Zoom / Scorecard</div>
        </div>
        <div class="flow-arrow">➔</div>
        <div class="flow-step">
          <div class="flow-icon">5</div>
          <div class="flow-label">Offer & Joining</div>
          <div class="flow-sub">Hired Candidate</div>
        </div>
      </div>

      <h3 style="margin-top: 18px; margin-bottom: 10px;">Executive Business Impact Numbers</h3>
      <div class="grid-4">
        <div class="stat-box">
          <div class="stat-title">Time to Hire</div>
          <div class="stat-value" style="color: #1e40af;">40% Faster</div>
          <div class="stat-desc">From 24 days down to 14 days</div>
        </div>
        <div class="stat-box green">
          <div class="stat-title">HR Productivity</div>
          <div class="stat-value" style="color: #059669;">+65% Boost</div>
          <div class="stat-desc">Zero manual data copy-pasting</div>
        </div>
        <div class="stat-box sky">
          <div class="stat-title">Candidate Reach</div>
          <div class="stat-value" style="color: #0284c7;">100% Capture</div>
          <div class="stat-desc">Zero application loss via webhooks</div>
        </div>
        <div class="stat-box purple">
          <div class="stat-title">Cost Per Hire</div>
          <div class="stat-value" style="color: #6366f1;">-35% Cost</div>
          <div class="stat-desc">Optimized portal spend allocation</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>Unified Recruitment Platform • Executive Architecture & Operations Manual</div>
      <div>Page 2</div>
    </div>
  </div>

  <!-- ========================================================
       PAGE 3: THE 8 CORE PILLARS & FUNCTIONAL MODULES
       ======================================================== -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${iconUrbanGaon ? `<img src="${iconUrbanGaon}" class="page-header-logo" alt="Logo">` : ''}
        <span class="page-header-title">Platform Features & Functional Modules</span>
      </div>
      <div class="page-header-badge">Modules Overview</div>
    </div>

    <div class="page-content">
      <h2>
        <span style="color: #2563eb;">02.</span> Complete Implementation Breakdown (The 8 Pillars)
      </h2>
      <p style="color: #475569; margin-bottom: 16px;">
        Is pure project me humne end-to-end recruitment process ko 8 comprehensive functional modules me divide aur implement kia hai:
      </p>

      <div class="grid-2">
        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="badge badge-primary">Pillar 1</span>
            <h3 style="margin: 0;">Multi-Channel Aggregator</h3>
          </div>
          <p style="font-size: 12px; color: #475569;">
            Naukri, LinkedIn, Indeed, Apna, Internshala aur direct company career page se aane wale sabhi applicants automatically ek central repository me merge hote hain.
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>Automated LinkedIn IMAP Parser:</strong> Recruiters ko emails se resume download nahi karna padta; backend auto-parse karke database me store karta hai.
            </li>
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>Live Webhook Ingestion:</strong> Indeed aur Apna ke leads millisecond me dashboard par popup hote hain.
            </li>
          </ul>
        </div>

        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="badge badge-success">Pillar 2</span>
            <h3 style="margin: 0;">Intelligent ATS Match Scoring</h3>
          </div>
          <p style="font-size: 12px; color: #475569;">
            Candidate ke skills, experience aur background ko automatically job requirements ke sath compare karke <strong>0-100% Match Score</strong> calculate karta hai.
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>Instant Visual Highlighting:</strong> 85%+ walo ko green highlight milti hai taaki HR unhe turant call kare.
            </li>
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>Smart Skill Badging:</strong> React, Node, Python, Sales jaise primary tags visual roop me dikhte hain.
            </li>
          </ul>
        </div>

        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="badge badge-purple">Pillar 3</span>
            <h3 style="margin: 0;">Dual Pipeline Management</h3>
          </div>
          <p style="font-size: 12px; color: #475569;">
            Do alag views provide kiye gaye hain: <strong>Dynamic Interactive Table</strong> (bulk operations ke liye) aur <strong>Visual Kanban Board</strong> (stage-by-stage movement ke liye).
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>8 Hiring Stages:</strong> Applied, Screening, Shortlisted, Round 1, Round 2, Offered, Joined, Rejected.
            </li>
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>Portal-Specific Filters:</strong> 1-Click se sirf Naukri ya sirf LinkedIn ke candidates dekhein.
            </li>
          </ul>
        </div>

        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="badge badge-warning">Pillar 4</span>
            <h3 style="margin: 0;">Integrated Calling & Screening Desk</h3>
          </div>
          <p style="font-size: 12px; color: #475569;">
            Browser ke andar hi complete Calling Suite implement kia gaya hai jisme live call timer, call disposition aur screening questions shamil hain.
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>Compensation Audit:</strong> Current CTC, Expected CTC aur Notice Period turant verify aur lock karein.
            </li>
            <li class="feature-item">
              <span style="color: #10b981;">✔</span> <strong>1-Click Interview Scheduling:</strong> Call khatam hote hi sidhe Round 1 interview book ho jata hai.
            </li>
          </ul>
        </div>
      </div>

      <div class="card card-highlight" style="margin-top: 6px;">
        <h4 style="color: #1e3a8a; margin-bottom: 6px;">Non-Tech Simplicity Note:</h4>
        <p style="font-size: 12px; color: #334155; margin: 0;">
          Recruiters ko koi technical knowledge nahi chahiye. UI bilkul modern consumer apps (jaise WhatsApp ya Swiggy) jaisa clean aur intuitive banaya gaya hai jisme har action single-click me complete hota hai.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <div>Unified Recruitment Platform • Executive Architecture & Operations Manual</div>
      <div>Page 3</div>
    </div>
  </div>

  <!-- ========================================================
       PAGE 4: INTERVIEW HUB, EVALUATION & TELECALLING
       ======================================================== -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${iconUrbanGaon ? `<img src="${iconUrbanGaon}" class="page-header-logo" alt="Logo">` : ''}
        <span class="page-header-title">Deep Dive: Calling Desk & Interview Hub</span>
      </div>
      <div class="page-header-badge">Core Operations</div>
    </div>

    <div class="page-content">
      <h2>
        <span style="color: #2563eb;">03.</span> Telecalling Desk & Interview Operations Hub
      </h2>
      <p style="color: #475569; margin-bottom: 14px;">
        Recruitment ka sabse critical phase hota hai: <strong>Candidate Calling aur Interview Rounds</strong>. Hamne is pure workflow ko completely digitize aur automate kar diya hai:
      </p>

      <div class="grid-2">
        <!-- Telecalling Module Box -->
        <div class="card" style="border-top: 3px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="color: #065f46; margin: 0;">📞 Telecalling & Screening Suite</h3>
            <span class="badge badge-success">Live in Browser</span>
          </div>
          <p style="font-size: 12px; color: #475569; margin-bottom: 8px;">
            Recruiter ko phone uthane ya number dial karne me time waste nahi karna:
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span style="color: #059669;">✔</span> <strong>Direct Dialing Interface:</strong> 1-Click dialer with live call duration counter & mute toggle.
            </li>
            <li class="feature-item">
              <span style="color: #059669;">✔</span> <strong>Call Outcome (Disposition):</strong> Connected & Screening Passed, Call Back Requested, Busy / Not Reachable, Screening Failed.
            </li>
            <li class="feature-item">
              <span style="color: #059669;">✔</span> <strong>Salary & Notice Lock:</strong> Recruiter candidate ka Current CTC, Expected CTC aur Notice period turant log karta hai.
            </li>
            <li class="feature-item">
              <span style="color: #059669;">✔</span> <strong>Rating Matrix:</strong> Communication skills (1-5 stars) aur Technical readiness (1-5 stars) par immediate rating.
            </li>
            <li class="feature-item">
              <span style="color: #059669;">✔</span> <strong>Instant Follow-up Reminder:</strong> Agar candidate ne kaha "call at 4 PM", system automated callback queue create karta hai.
            </li>
          </ul>
        </div>

        <!-- Interview Hub Box -->
        <div class="card" style="border-top: 3px solid #2563eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="color: #1e40af; margin: 0;">📅 Full Interview Management Hub</h3>
            <span class="badge badge-primary">Calendar & Video</span>
          </div>
          <p style="font-size: 12px; color: #475569; margin-bottom: 8px;">
            Google Calendar aur Zoom ki tarah customized complete interview scheduling environment:
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span style="color: #2563eb;">✔</span> <strong>Multi-Calendar Views:</strong> Month View, Week View, Day View, aur List View with live ticking system clock.
            </li>
            <li class="feature-item">
              <span style="color: #2563eb;">✔</span> <strong>Multi-Round Support:</strong> Screening, Technical Round 1, Technical Round 2, Leadership Round, HR Culture Round.
            </li>
            <li class="feature-item">
              <span style="color: #2563eb;">✔</span> <strong>1-Click Video Connect:</strong> Google Meet, Zoom, MS Teams aur Office In-Person meet links auto-generated.
            </li>
            <li class="feature-item">
              <span style="color: #2563eb;">✔</span> <strong>Reschedule & Cancellation Tracking:</strong> Kisi bhi round ko reschedule ya cancel karne par reason log maintain hota hai.
            </li>
            <li class="feature-item">
              <span style="color: #2563eb;">✔</span> <strong>Direct Candidate Card Access:</strong> Interview card par click karte hi candidate ka full profile aur resume samne aa jata hai.
            </li>
          </ul>
        </div>
      </div>

      <h3 style="margin-top: 14px; margin-bottom: 8px;">Standardized Interview Scorecard (Biased-Free Hiring)</h3>
      <p style="font-size: 12.5px; color: #475569;">
        Interviewers ab random feedback nahi dete; platform me <strong>Objective Evaluation Matrix</strong> implement kia gaya hai:
      </p>

      <table class="styled-table">
        <thead>
          <tr>
            <th>Evaluation Pillar</th>
            <th>What is Measured</th>
            <th>Scoring Scale</th>
            <th>Executive Benefit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Technical Competence</strong></td>
            <td>Role-specific skills, coding, architecture knowledge</td>
            <td>1 to 5 Stars</td>
            <td>Skill mismatch risk eliminated</td>
          </tr>
          <tr>
            <td><strong>Problem Solving</strong></td>
            <td>Logical thinking, troubleshooting, case scenarios</td>
            <td>1 to 5 Stars</td>
            <td>Hires engineers who solve real issues</td>
          </tr>
          <tr>
            <td><strong>Cultural & Team Fit</strong></td>
            <td>Ownership mindset, company values alignment</td>
            <td>1 to 5 Stars</td>
            <td>Reduces 90-day employee attrition</td>
          </tr>
          <tr>
            <td><strong>Final Recommendation</strong></td>
            <td>Strong Hire, Hire, Re-Interview, Reject</td>
            <td>Categorical Verdict</td>
            <td>Clear decision-making for leadership</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <div>Unified Recruitment Platform • Executive Architecture & Operations Manual</div>
      <div>Page 4</div>
    </div>
  </div>

  <!-- ========================================================
       PAGE 5: RESUME ENGINE, BULK ACTIONS & CHANNELS
       ======================================================== -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${iconUrbanGaon ? `<img src="${iconUrbanGaon}" class="page-header-logo" alt="Logo">` : ''}
        <span class="page-header-title">Resume Processing & Multi-Portal Architecture</span>
      </div>
      <div class="page-header-badge">Productivity Suite</div>
    </div>

    <div class="page-content">
      <h2>
        <span style="color: #2563eb;">04.</span> Resume Intelligence & Multi-Portal Channels
      </h2>

      <p style="color: #475569; margin-bottom: 14px;">
        Recruiters aur Hiring Managers ko candidate profiles share karne me hone wali preshani ko door karne ke liye humne <strong>In-House Resume Generation & Bulk Processing Engine</strong> build kiya hai:
      </p>

      <div class="grid-3">
        <div class="card">
          <h3 style="color: #1e40af; font-size: 13.5px;">📄 Live Resume Viewer</h3>
          <p style="font-size: 11.5px; color: #475569;">
            Candidate ke original resume ko modal ke andar interactive preview me dekhein bina computer me download kiye hard drive bhare.
          </p>
        </div>
        <div class="card">
          <h3 style="color: #059669; font-size: 13.5px;">🖨️ 1-Click PDF Generator</h3>
          <p style="font-size: 11.5px; color: #475569;">
            Built-in standardized PDF exporter candidate ki complete details, work history aur skills ko ek clean corporate PDF document me convert karta hai.
          </p>
        </div>
        <div class="card">
          <h3 style="color: #6366f1; font-size: 13.5px;">📦 Bulk Operations Engine</h3>
          <p style="font-size: 11.5px; color: #475569;">
            20 candidates ko ek sath Select All karke Bulk Shortlist, Bulk Reject ya Bulk Resume Zip download karein. 1-Click Excel CSV Export bhi available hai.
          </p>
        </div>
      </div>

      <h3 style="margin-top: 14px; margin-bottom: 10px;">Supported Job Portals & Ingestion Methods</h3>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Integration Mode</th>
            <th>How It Works</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="portal-chip portal-naukri">
                ${logoNaukri ? `<img src="${logoNaukri}" style="height:14px;" alt="Naukri">` : '🔵'} Naukri.com
              </span>
            </td>
            <td>API & Webhooks</td>
            <td>Direct integration parses resumes, contact numbers and current location.</td>
            <td><span class="badge badge-success">Active Live</span></td>
          </tr>
          <tr>
            <td>
              <span class="portal-chip portal-linkedin">
                💼 LinkedIn Jobs
              </span>
            </td>
            <td>Automated IMAP Email Parser</td>
            <td>Background bot checks Gmail inbox every 5 mins, extracts applicant profile & resume PDF.</td>
            <td><span class="badge badge-success">Active Live</span></td>
          </tr>
          <tr>
            <td>
              <span class="portal-chip portal-indeed">
                ${logoIndeed ? `<img src="${logoIndeed}" style="height:14px;" alt="Indeed">` : '🔷'} Indeed
              </span>
            </td>
            <td>Real-Time Webhooks</td>
            <td>Instant payload received jab bhi candidate "Easy Apply" par click karta hai.</td>
            <td><span class="badge badge-success">Active Live</span></td>
          </tr>
          <tr>
            <td>
              <span class="portal-chip portal-apna">
                ${logoApna ? `<img src="${logoApna}" style="height:14px; border-radius: 2px;" alt="Apna">` : '🟢'} Apna.co
              </span>
            </td>
            <td>REST API Webhook</td>
            <td>High-volume sales and operations candidates instant sync with phone verification.</td>
            <td><span class="badge badge-success">Active Live</span></td>
          </tr>
          <tr>
            <td>
              <span class="portal-chip portal-urbangaon">
                🏠 UrbanGaon Careers
              </span>
            </td>
            <td>Native Database Sync</td>
            <td>Company website career portal se aane wale zero-cost applications.</td>
            <td><span class="badge badge-success">Active Live</span></td>
          </tr>
          <tr>
            <td>
              <span class="portal-chip portal-internshala">
                🎓 Internshala
              </span>
            </td>
            <td>Inbound Webhook Feed</td>
            <td>Campus hiring aur freshers ke applications automated pipeline me link hote hain.</td>
            <td><span class="badge badge-success">Active Live</span></td>
          </tr>
        </tbody>
      </table>

      <div class="callout" style="margin-top: 14px;">
        <strong>Confidence & Morale Feature:</strong> Jab bhi koi candidate select hota hai ya offer accept karke <em>"Joined / Hired"</em> stage par move karta hai, system <strong>confetti celebrations</strong> trigger karta hai taaki recruitment team ka morale aur energy high rahe!
      </div>
    </div>

    <div class="page-footer">
      <div>Unified Recruitment Platform • Executive Architecture & Operations Manual</div>
      <div>Page 5</div>
    </div>
  </div>

  <!-- ========================================================
       PAGE 6: REAL-TIME ARCHITECTURE & USER WORKFLOWS
       ======================================================== -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${iconUrbanGaon ? `<img src="${iconUrbanGaon}" class="page-header-logo" alt="Logo">` : ''}
        <span class="page-header-title">Architecture & Daily Operating Workflows</span>
      </div>
      <div class="page-header-badge">How It Works</div>
    </div>

    <div class="page-content">
      <h2>
        <span style="color: #2563eb;">05.</span> System Architecture (Non-Tech View) & Workflows
      </h2>

      <p style="color: #475569; margin-bottom: 14px;">
        Leadership aur management ke understanding ke liye, yahan explain kia gaya hai ki system background me kaise securely aur bina kisi lag ke chalta hai:
      </p>

      <div class="grid-2">
        <div class="card card-highlight">
          <h3 style="color: #1e3a8a; margin-bottom: 6px;">⚡ Real-Time Live Sync (WebSockets)</h3>
          <p style="font-size: 12px; color: #334155;">
            Agar Recruiter A ne kisi candidate ka status change kia ya interview schedule kia, to Recruiter B ke screen par <strong>bina page refresh kiye</strong> wo update 0.1 second me reflect ho jata hai. Isse duplicate calling ya double scheduling zero ho gayi hai.
          </p>
        </div>
        <div class="card card-highlight">
          <h3 style="color: #1e3a8a; margin-bottom: 6px;">🛡️ Zero Data Loss (Local + Cloud Sync)</h3>
          <p style="font-size: 12px; color: #334155;">
            Har activity ka double backup hai: instant local cache (taaki internet thoda slow ho tab bhi dashboard super-fast rahe) aur backend MongoDB database jahan data permanently secure rehta hai.
          </p>
        </div>
      </div>

      <h3 style="margin-top: 16px; margin-bottom: 10px;">Day-in-the-Life Workflows for Your Team</h3>

      <div class="card" style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="badge badge-primary">Role 1</span>
          <h4 style="margin: 0;">Recruiter / Talent Acquisition Specialist</h4>
        </div>
        <p style="font-size: 12px; color: #475569; margin: 0;">
          <strong>Morning (10:00 AM):</strong> Dashboard open karein -> "Pending Calls" tab me filter karein -> Calling Desk se direct call lagayein -> 2 minute me CTC, Notice Period aur score bharein -> Direct "Round 1 Schedule" click karein.
        </p>
      </div>

      <div class="card" style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="badge badge-success">Role 2</span>
          <h4 style="margin: 0;">Technical Interviewer / Department Lead</h4>
        </div>
        <p style="font-size: 12px; color: #475569; margin: 0;">
          <strong>Interview Time:</strong> Calendar me click karein -> 1-Click se Google Meet join karein -> Samne candidate ka resume aur ATS score dekhein -> Interview complete hote hi scorecard me rating aur feedback submit karein.
        </p>
      </div>

      <div class="card" style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="badge badge-purple">Role 3</span>
          <h4 style="margin: 0;">CEO & Leadership (Management View)</h4>
        </div>
        <p style="font-size: 12px; color: #475569; margin: 0;">
          <strong>Weekly Review:</strong> "Overview Dashboard" par jayein -> Total applications, Offer-to-Join ratio aur portal ROI dekhein -> Pata lagayein kaun sa channel sabse profitable hiring de raha hai aur decision lein.
        </p>
      </div>

      <div class="callout callout-success" style="margin-top: 14px;">
        <strong>Total Training Time Required:</strong> Naye HR team member ko is dashboard ko chalane me sirf <strong>15 minute ki initial training</strong> lagti hai kyunki UI intuitive self-explanatory design pattern par bana hai.
      </div>
    </div>

    <div class="page-footer">
      <div>Unified Recruitment Platform • Executive Architecture & Operations Manual</div>
      <div>Page 6</div>
    </div>
  </div>

  <!-- ========================================================
       PAGE 7: BUSINESS ROI, ROADMAP & SIGN-OFF
       ======================================================== -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${iconUrbanGaon ? `<img src="${iconUrbanGaon}" class="page-header-logo" alt="Logo">` : ''}
        <span class="page-header-title">ROI Analysis & Future Innovations</span>
      </div>
      <div class="page-header-badge">Executive Sign-Off</div>
    </div>

    <div class="page-content">
      <h2>
        <span style="color: #2563eb;">06.</span> Business ROI Comparison & Future Roadmap
      </h2>

      <p style="color: #475569; margin-bottom: 14px;">
        Is unified platform ke implement hone se pehle aur baad ka direct comparison:
      </p>

      <table class="styled-table">
        <thead>
          <tr>
            <th>Recruitment Metric</th>
            <th>Before (Old Manual Process)</th>
            <th>Now (Unified Platform)</th>
            <th>Direct Business Benefit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Application Ingestion</strong></td>
            <td>5 alag logins, CSV download</td>
            <td>Single consolidated feed</td>
            <td>Zero portal jumping</td>
          </tr>
          <tr>
            <td><strong>Time to First Contact</strong></td>
            <td>48 to 72 hours</td>
            <td>Under 2 hours</td>
            <td>Top talent converted faster</td>
          </tr>
          <tr>
            <td><strong>Candidate Screening</strong></td>
            <td>Pen-paper / messy notes</td>
            <td>Built-in digital dialer & form</td>
            <td>100% structured data</td>
          </tr>
          <tr>
            <td><strong>Interview Coordination</strong></td>
            <td>Email to-and-fro, missed links</td>
            <td>1-Click Calendar & Meet links</td>
            <td>Zero interview no-shows</td>
          </tr>
          <tr>
            <td><strong>Leadership Visibility</strong></td>
            <td>Monthly manual Excel reports</td>
            <td>Live real-time KPI metrics</td>
            <td>Instant data-driven decisions</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin-top: 18px; margin-bottom: 8px;">🚀 Future Roadmap (Next Planned Innovations)</h3>
      <div class="grid-3">
        <div class="card">
          <h4 style="color: #1e40af; font-size: 13px;">🤖 AI Voice Screening Bot</h4>
          <p style="font-size: 11px; color: #475569; margin: 0;">
            Incoming candidates ko initial 2-minute automated voice call karke CTC, Notice Period aur location verify karne wala bot.
          </p>
        </div>
        <div class="card">
          <h4 style="color: #059669; font-size: 13px;">📲 WhatsApp Automated Bot</h4>
          <p style="font-size: 11px; color: #475569; margin: 0;">
            Interview scheduling aur Google Meet links candidate ke WhatsApp par automated notification ke zariye bhejna.
          </p>
        </div>
        <div class="card">
          <h4 style="color: #6366f1; font-size: 13px;">🔍 1-Click Background Check</h4>
          <p style="font-size: 11px; color: #475569; margin: 0;">
            Selected candidates ka automated PAN, Aadhaar aur past employment verification partner APIs ke sath integration.
          </p>
        </div>
      </div>

      <!-- Sign-off Block -->
      <div style="margin-top: 24px; padding: 18px 20px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.8px;">Architectural Approval & Executive Sign-off</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">Akash Das</div>
          <div style="font-size: 12px; color: #2563eb; font-weight: 700;">Chief Executive Officer & SDE-3 Lead</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">UrbanGaon Technologies Pvt. Ltd.</div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; padding: 8px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 1px;">System Status</div>
            <div style="font-size: 14px; font-weight: 800; color: #047857; margin-top: 1px;">LIVE & DEPLOYED</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>Unified Recruitment Platform • Executive Architecture & Operations Manual</div>
      <div>Page 7 • End of Documentation</div>
    </div>
  </div>

</body>
</html>
`;

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
const htmlFilePath = path.join(docsDir, 'Unified_Recruitment_Platform_Overview.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML documentation written to:', htmlFilePath);

// Now generate PDF using Chrome headless
const pdfFilePath = path.join(docsDir, 'Unified_Recruitment_Platform_Overview.pdf');
const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgeExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserExe = fs.existsSync(chromeExe) ? chromeExe : edgeExe;

console.log('Using browser executable:', browserExe);

const cmd = '"' + browserExe + '" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfFilePath + '" --print-to-pdf-no-header "' + htmlFilePath + '"';

console.log('Running PDF export command...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfFilePath)) {
  const stats = fs.statSync(pdfFilePath);
  console.log('SUCCESS! PDF generated successfully:', pdfFilePath);
  console.log('File size:', (stats.size / 1024).toFixed(1), 'KB');
} else {
  console.error('ERROR: PDF file not found after print command');
}
