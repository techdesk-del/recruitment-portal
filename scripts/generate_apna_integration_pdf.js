import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apna.co Real-Time Webhook Integration - Technical Q&A Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 12mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11.5px;
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title h1 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 3px 0;
      letter-spacing: -0.5px;
    }
    .header-title p {
      font-size: 10.5px;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin: 12px 0 8px 0;
      padding-bottom: 3px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title span {
      display: inline-flex;
      width: 18px;
      height: 18px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 5px;
      font-size: 10px;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }
    .qa-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .question {
      font-size: 12px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 4px;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .question-tag {
      font-size: 9.5px;
      font-weight: 800;
      background: #dbeafe;
      color: #1e40af;
      padding: 1.5px 5px;
      border-radius: 4px;
    }
    .answer {
      font-size: 11px;
      color: #334155;
      line-height: 1.48;
    }
    .answer strong {
      color: #0f172a;
    }
    .code-box {
      font-family: 'JetBrains Mono', monospace;
      background: #0f172a;
      color: #f8fafc;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 10px;
      margin: 5px 0;
      overflow-x: auto;
      line-height: 1.4;
    }
    .code-box .key { color: #93c5fd; }
    .code-box .str { color: #86efac; }
    .code-box .num { color: #fde047; }
    .code-box .comment { color: #64748b; font-style: italic; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin: 6px 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #1e293b;
    }
    .pill {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }
    .pill-req { background: #fee2e2; color: #991b1b; }
    .pill-opt { background: #f1f5f9; color: #475569; }
    .footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    .page-break {
      page-break-before: always;
      height: 0;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="header">
    <div class="header-title">
      <span class="badge">Technical Specification & Interview Cheat Sheet</span>
      <h1>Apna.co Real-Time Webhook Integration Guide</h1>
      <p>UrbanGaon ATS & Recruitment Dashboard • Developer Integration Q&A Document</p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: 700; color: #0f172a;">URBANGAON TECHNOLOGIES</div>
      <div style="font-size: 10px; color: #64748b;">Protocol: Webhook (HTTP POST)</div>
    </div>
  </div>

  <div class="section-title">
    <span>1</span> Executive Overview & Integration Objectives
  </div>
  <p style="margin-top: 0; color: #475569;">
    This document outlines the exact technical questions that the <strong>Apna.co Engineering / Integration Team</strong> will ask during your technical alignment call, along with the precise, production-ready answers you should provide. It ensures seamless, zero-latency synchronization of applicants and resume PDFs from Apna into your recruitment dashboard.
  </p>

  <div class="section-title">
    <span>2</span> Developer Alignment Q&A (What Apna Dev Team Will Ask)
  </div>

  <!-- Q1 -->
  <div class="qa-card">
    <div class="question">
      <span class="question-tag">Q1</span>
      "What is your target Webhook Endpoint URL and HTTP method?"
    </div>
    <div class="answer">
      <strong>Answer:</strong><br>
      We have an HTTPS webhook endpoint deployed and waiting for inbound payloads:<br>
      • <strong>Target URL:</strong> <code>https://&lt;YOUR-DOMAIN&gt;/api/webhook/apna</code><br>
      • <strong>HTTP Method:</strong> <code>POST</code><br>
      • <strong>Request Header:</strong> <code>Content-Type: application/json</code><br>
      • <strong>Network Protocol:</strong> Standard TLS/HTTPS (Port 443)
    </div>
  </div>

  <!-- Q2 -->
  <div class="qa-card">
    <div class="question">
      <span class="question-tag">Q2</span>
      "What candidate attributes and payload fields do you require from Apna?"
    </div>
    <div class="answer">
      <strong>Answer:</strong><br>
      We require the following JSON payload schema whenever an applicant applies for any job:
      <table>
        <thead>
          <tr>
            <th>Field Name</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Description & Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>candidate_name</code> / <code>name</code></td>
            <td>String</td>
            <td><span class="pill pill-req">Mandatory</span></td>
            <td>Full name of the candidate (e.g., "Aakash Sharma")</td>
          </tr>
          <tr>
            <td><code>mobile_number</code> / <code>phone</code></td>
            <td>String</td>
            <td><span class="pill pill-req">Mandatory</span></td>
            <td>10-digit mobile number with or without +91 prefix</td>
          </tr>
          <tr>
            <td><code>candidate_email</code> / <code>email</code></td>
            <td>String</td>
            <td><span class="pill pill-req">Mandatory</span></td>
            <td>Candidate email address for interview invites</td>
          </tr>
          <tr>
            <td><code>job_title</code> / <code>job_id</code></td>
            <td>String</td>
            <td><span class="pill pill-req">Mandatory</span></td>
            <td>Applied requisition title or internal job identifier</td>
          </tr>
          <tr>
            <td><code>total_experience_years</code></td>
            <td>Number</td>
            <td><span class="pill pill-req">Mandatory</span></td>
            <td>Years of relevant experience (e.g., 4.5)</td>
          </tr>
          <tr>
            <td><strong><code>resume_url</code></strong></td>
            <td>String</td>
            <td><span class="pill pill-req">CRITICAL</span></td>
            <td><strong>Public or signed download URL for Candidate Resume PDF</strong></td>
          </tr>
          <tr>
            <td><code>current_company</code></td>
            <td>String</td>
            <td><span class="pill pill-opt">Optional</span></td>
            <td>Current employer or last organization</td>
          </tr>
          <tr>
            <td><code>notice_period</code></td>
            <td>String</td>
            <td><span class="pill pill-opt">Optional</span></td>
            <td>Availability status (e.g., "Immediate", "15 Days", "30 Days")</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Q3 -->
  <div class="qa-card">
    <div class="question">
      <span class="question-tag">Q3</span>
      "What security, authentication, or signature headers do you require?"
    </div>
    <div class="answer">
      <strong>Answer:</strong><br>
      • We support any standard webhook security header provided by Apna, such as <code>x-api-key: &lt;SECRET_TOKEN&gt;</code> or <code>Authorization: Bearer &lt;TOKEN&gt;</code>.<br>
      • Alternatively, if Apna uses an HMAC-SHA256 signature header (e.g. <code>x-apna-signature</code>), please provide your signing secret and documentation so our backend can verify incoming payloads.
    </div>
  </div>

  <div class="footer">
    <div>UrbanGaon Technologies Pvt. Ltd. • Recruitment Dashboard Infrastructure</div>
    <div>Page 1 of 2</div>
  </div>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <div class="header">
    <div class="header-title">
      <span class="badge">Payload Specifications</span>
      <h1>Apna.co Real-Time Webhook Integration Guide</h1>
      <p>Payload Schema • Response Specifications • Troubleshooting</p>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: 700; color: #0f172a;">TECHNICAL ARCHITECTURE</div>
      <div style="font-size: 10px; color: #64748b;">Page 2 of 2</div>
    </div>
  </div>

  <!-- Q4 -->
  <div class="qa-card">
    <div class="question">
      <span class="question-tag">Q4</span>
      "What HTTP status and response body does your server return upon receiving a webhook?"
    </div>
    <div class="answer">
      <strong>Answer:</strong><br>
      Our server processes the event asynchronously and responds immediately with <strong>HTTP 200 OK</strong> within &lt;100ms to prevent timeout retries:
      <div class="code-box">
{
  <span class="key">"success"</span>: <span class="num">true</span>,
  <span class="key">"message"</span>: <span class="str">"Candidate saved in MongoDB and pushed to Dashboard via WebSocket"</span>,
  <span class="key">"candidateId"</span>: <span class="str">"apna-094125"</span>
}
      </div>
    </div>
  </div>

  <!-- Q5 -->
  <div class="qa-card">
    <div class="question">
      <span class="question-tag">Q5</span>
      "Can we send a sample test event / sandbox ping to verify connectivity?"
    </div>
    <div class="answer">
      <strong>Answer:</strong><br>
      Yes, absolutely. Please trigger a test payload anytime. Once fired, our backend will acknowledge with HTTP 200, save the record to our MongoDB Atlas database, and our recruiters will immediately see the applicant card appear in real-time on our Live ATS Dashboard via WebSockets.
    </div>
  </div>

  <div class="section-title">
    <span>3</span> Standard Sample Payload from Apna (Reference Schema)
  </div>
  <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">
    Here is the standard JSON payload format our backend controller (<code>handleApnaWebhook</code>) is already designed to parse:
  </p>

  <div class="code-box">
<span class="comment">// Inbound HTTP POST to: /api/webhook/apna</span>
{
  <span class="key">"candidate_name"</span>: <span class="str">"Rahul Verma"</span>,
  <span class="key">"mobile_number"</span>: <span class="str">"+919829012345"</span>,
  <span class="key">"candidate_email"</span>: <span class="str">"rahul.verma@example.com"</span>,
  <span class="key">"city"</span>: <span class="str">"Jaipur, Rajasthan"</span>,
  <span class="key">"job_title"</span>: <span class="str">"Assistant Manager – Sales"</span>,
  <span class="key">"job_id"</span>: <span class="str">"job-am-sales"</span>,
  <span class="key">"total_experience_years"</span>: <span class="num">4.5</span>,
  <span class="key">"current_company"</span>: <span class="str">"Retail Solutions Pvt Ltd"</span>,
  <span class="key">"expected_salary"</span>: <span class="str">"₹8.5 LPA"</span>,
  <span class="key">"notice_period"</span>: <span class="str">"15 Days"</span>,
  <span class="key">"resume_url"</span>: <span class="str">"https://storage.apna.co/resumes/2026/10/rahul_verma_cv.pdf"</span>
}
  </div>

  <div class="section-title">
    <span>4</span> What to Request from Apna Dev Team During the Call
  </div>
  <div class="qa-card" style="background: #eff6ff; border-color: #bfdbfe;">
    <div style="font-size: 12px; color: #1e3a8a; line-height: 1.6;">
      <strong>Checklist of Items to Ask the Apna Developer:</strong><br>
      1. <em>"Please share your official Webhook Documentation PDF or Swagger URL."</em><br>
      2. <em>"Please confirm if your system sends direct resume download URLs (<code>resume_url</code>) or base64 attachments."</em><br>
      3. <em>"What is your retry policy if our server experiences temporary network latency (e.g. 3 retries with exponential backoff)?"</em><br>
      4. <em>"Can you configure our production webhook URL on our Employer Account ID immediately?"</em>
    </div>
  </div>

  <div class="footer">
    <div>Confidential & Proprietary • UrbanGaon Recruitment Operations</div>
    <div>Generated on October 7, 2026 • Ready for Apna Technical Call</div>
  </div>

</body>
</html>
`;

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const htmlFilePath = path.join(docsDir, 'Apna_Integration_Technical_QA_Guide.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML written to:', htmlFilePath);

const pdfFilePath = path.join(docsDir, 'Apna_Integration_Technical_QA_Guide.pdf');
const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgeExe = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserExe = fs.existsSync(chromeExe) ? chromeExe : edgeExe;

console.log('Using browser executable:', browserExe);

const cmd = `"${browserExe}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfFilePath}" --print-to-pdf-no-header "${htmlFilePath}"`;

console.log('Generating PDF...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfFilePath)) {
  const stats = fs.statSync(pdfFilePath);
  console.log('SUCCESS! PDF generated successfully:', pdfFilePath);
  console.log('File size:', (stats.size / 1024).toFixed(1), 'KB');
} else {
  console.error('ERROR: PDF file not found after print command');
}
