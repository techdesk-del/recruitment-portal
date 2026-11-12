import { Router } from 'express';

/**
 * Enterprise Google Gemini ATS Resume Intelligence Engine
 * Built to Google Senior Staff AI & ATS Systems Standards
 * - Supports Gemini 1.5 Flash, Gemini 2.0 Flash, and Gemini 1.5 Pro with automatic fallback
 * - Dual input: Native multimodal PDF inspection + clean OCR text layer
 * - Few-shot prompt engineering tuned specifically for Indian recruitment formats
 * - Strict structural JSON schema with zero hallucination enforcement
 */
const router = Router();

const SUPPORTED_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-flash-latest'
].filter(Boolean);

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Full legal name of the candidate. NEVER "Resume", "CV", or father\'s name.' },
    email: { type: 'STRING', description: 'Candidate\'s personal email address (e.g. name@gmail.com). Cleaned, no spaces, no mailto.' },
    phone: { type: 'STRING', description: 'Candidate\'s 10-digit Indian mobile number with +91 country code (e.g. +91 78919 26000). Candidate\'s OWN number, not father/referee.' },
    alternatePhone: { type: 'STRING', description: 'Secondary mobile or WhatsApp number if provided in resume.' },
    location: { type: 'STRING', description: 'Current city & state (e.g. "Jaipur, Rajasthan", "Noida, UP").' },
    currentCompany: { type: 'STRING', description: 'Most recent employer / company name.' },
    currentDesignation: { type: 'STRING', description: 'Candidate\'s actual recent job title (e.g. "Driver", "Civil Supervisor", "Senior Sales Manager", "Head of Architecture").' },
    appliedRole: { type: 'STRING', description: 'Target job title applied for, or derived primary profession.' },
    experienceYears: { type: 'NUMBER', description: 'Total verified years of work experience as a decimal number (e.g. 5.5). Freshers should be 0.' },
    currentSalary: { type: 'STRING', description: 'Current CTC / salary if stated in resume.' },
    expectedSalary: { type: 'STRING', description: 'Expected CTC if stated.' },
    noticePeriod: { type: 'STRING', description: 'Notice period (e.g. "Immediate", "15 Days", "30 Days") if stated.' },
    linkedin: { type: 'STRING', description: 'LinkedIn profile URL if available.' },
    summary: { type: 'STRING', description: 'Precise 2-3 sentence executive profile summary.' },
    skills: { 
      type: 'ARRAY', 
      items: { type: 'STRING' },
      description: 'Specific technical, operational, and domain skills actually listed in the resume.' 
    },
    workExperience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          company: { type: 'STRING' },
          role: { type: 'STRING' },
          duration: { type: 'STRING' },
          location: { type: 'STRING' },
          highlights: { type: 'ARRAY', items: { type: 'STRING' } }
        }
      }
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          degree: { type: 'STRING' },
          institution: { type: 'STRING' },
          year: { type: 'STRING' },
          grade: { type: 'STRING' }
        }
      }
    }
  },
  required: ['name', 'email', 'phone', 'currentDesignation', 'experienceYears', 'skills']
};

const SYSTEM_INSTRUCTION = `You are an elite Google ATS Resume Parser trained on millions of Indian and global job applications across Real Estate, Construction, Logistics, Sales, Engineering, and Corporate operations.

Your mission is 100% extraction accuracy with ZERO hallucinations:

1. CANDIDATE NAME:
- Extract the person's full name from the document header or personal details section.
- NEVER use document titles like "CURRICULUM VITAE", "RESUME", "BIODATA", "PROFILE", or "CAREER OBJECTIVE" as a name.
- If a candidate has a title like "Ar.", "Er.", "Dr.", include it (e.g. "Ar. Jitendra Kumawat").
- Distinguish between candidate name and father's name (e.g. "S/o Shri Rameshwar" -> the candidate is NOT Rameshwar).

2. EMAIL ADDRESS (STRICTLY TOP HEADER / TITLE ZONE):
- Extract candidate's personal email from the TOP HEADER / TITLE section of the resume (next to or directly below their name).
- Repair split characters or OCR artifacts (e.g. "k p a n c h o l i 3 9 7 @ g m a i l . c o m" -> "kpancholi397@gmail.com").
- Strip "mailto:", whitespace, and glued trailing words like "Mobile" or "Phone".
- NEVER pick up emails listed under past companies, client projects, or organizational footers in the experience section.
- If no valid email exists in the document, return "".

3. PHONE NUMBER (STRICTLY TOP HEADER / TITLE ZONE):
- Extract candidate's primary personal mobile number from the TOP HEADER / TITLE section (e.g. "+91 78919 26000" or "+91 98280 96530").
- Candidates ALWAYS place their personal mobile in the top header on page 1. Extract from the TOP HEADER ONLY.
- NEVER extract phone numbers, landlines, or helpline numbers from the "Work Experience", "Past Employers", "Project descriptions", or "References" sections.
- Candidate's OWN number ONLY. Ignore Father's phone, Guardian's phone, or Reference contact numbers.
- Ignore 10-12 digit numbers that are Aadhaar numbers, Pincodes (e.g. 302020), PF/UAN numbers, or date ranges.
- If an alternate personal number exists in the header (e.g. "7891926000 / 9414351314"), put the second in "alternatePhone".

4. ROLE & DESIGNATION ACCURACY (CRITICAL):
- Extract candidate's TRUE recent designation and primary vocation without confusion:
  * If candidate is a Driver / Commercial Chauffeur -> currentDesignation: "Driver" (NEVER label a driver as "Sales").
  * If candidate is a Civil Supervisor / Site Engineer -> currentDesignation: "Site Supervisor (Civil)" or "Civil Engineer".
  * If candidate is an Architect -> currentDesignation: "Architect" or "Junior Architect".
  * If candidate is in Purchase / Procurement -> currentDesignation: "Purchase Manager".
  * If candidate is in Sales / Marketing -> currentDesignation: "Sales & Marketing Manager" or "Sales Officer".
- DO NOT misclassify candidates based on random words in past job descriptions. Prioritize their most recent role or their stated objective.

5. EXPERIENCE YEARS:
- Calculate total professional experience precisely from employment history dates (e.g. "Jan 2019 to Present" in 2026 = 7.0 years).
- If the resume explicitly states "Total Experience: 9.6 Years", use 9.6.
- If candidate is a fresher or recent student, experienceYears: 0.

6. STRICT FIDELITY:
- If a field is not present in the resume, return "" or empty array.
- NEVER invent placeholder data or fake emails.`;

function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
    }
    return null;
  }
}

// Check AI status
router.get('/status', (req, res) => {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    aiConfigured: configured,
    model: SUPPORTED_MODELS[0] || 'gemini-1.5-flash',
    supportedModels: SUPPORTED_MODELS
  });
});

// Test an API key provided by user or in env
router.post('/test-key', async (req, res) => {
  const apiKey = req.body?.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'No API key provided.' });
  }

  let lastError = '';
  for (const model of SUPPORTED_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const testResp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with exactly: {"status":"ok"}' }] }],
          generationConfig: { temperature: 0 }
        })
      });

      if (testResp.ok) {
        return res.json({ 
          success: true, 
          model,
          message: `Google Gemini AI (${model}) is active and verified!` 
        });
      }

      const errBody = await testResp.text();
      lastError = `Model ${model} (${testResp.status}): ${errBody.slice(0, 160)}`;
    } catch (err) {
      lastError = err.message || 'Connection failed';
    }
  }

  return res.status(400).json({ success: false, error: `Google API Error: ${lastError}` });
});

// Parse resume with Gemini AI
router.post('/parse', async (req, res) => {
  const apiKey = req.body?.apiKey || req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      aiConfigured: false,
      error: 'GEMINI_API_KEY is not configured on the server or in the request.'
    });
  }

  const { fileName = 'resume', mimeType = '', base64 = '', text = '' } = req.body || {};
  const isPdf = /pdf/i.test(mimeType) || /\.pdf$/i.test(fileName);

  const parts = [];
  // Multimodal PDF inspection (Gemini native vision)
  if (isPdf && base64 && base64.length < 19_000_000) {
    parts.push({ inline_data: { mime_type: 'application/pdf', data: base64 } });
    if (text && text.trim().length > 30) {
      parts.push({
        text: `Cross-reference Text Layer extracted from this PDF (use this to verify exact spelling of email, phone digits, and dates):\n${String(text).slice(0, 25000)}`
      });
    }
  } else if (text && text.trim().length > 20) {
    parts.push({
      text: `Candidate Resume File: ${fileName}\nFull Document Content:\n${String(text).slice(0, 35000)}`
    });
  } else {
    return res.status(400).json({ success: false, error: 'No readable resume content provided.' });
  }

  let lastError = '';
  let successfulResult = null;
  let modelUsed = '';

  // Try supported models in order (gemini-1.5-flash -> gemini-2.0-flash -> gemini-1.5-pro)
  for (const model of SUPPORTED_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.05,
          topP: 0.95,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA
        }
      };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 40000);

      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!r.ok) {
        const errText = await r.text();
        lastError = `Model ${model} returned HTTP ${r.status}: ${errText.slice(0, 250)}`;
        console.warn(`[Gemini Engine] ${lastError}, attempting next model...`);
        continue;
      }

      const data = await r.json();
      const out = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
      const parsed = extractJson(out);

      if (parsed && (parsed.name || parsed.email || parsed.phone || parsed.currentDesignation)) {
        successfulResult = parsed;
        modelUsed = model;
        break;
      } else {
        lastError = `Model ${model} returned unparseable output`;
      }
    } catch (err) {
      lastError = err?.name === 'AbortError' ? `Timeout on ${model}` : (err?.message || String(err));
      console.warn(`[Gemini Engine] Error on ${model}:`, lastError);
    }
  }

  if (successfulResult) {
    return res.json({
      success: true,
      aiConfigured: true,
      model: modelUsed,
      data: successfulResult
    });
  }

  console.warn('[Gemini AI Parser] All models failed:', lastError);
  return res.status(502).json({
    success: false,
    aiConfigured: true,
    error: lastError || 'Failed to extract structured resume details from Gemini.'
  });
});

// Parse Job Description (JD) Document with Gemini AI
const JD_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', description: 'Exact job title from the JD' },
    department: { type: 'STRING', description: 'Department (e.g. Civil, Sales & Marketing, Architecture, Project Management, Operations, Accounts, IT, Logistics)' },
    location: { type: 'STRING', description: 'Job location (e.g. Jaipur, Rajasthan)' },
    type: { type: 'STRING', description: 'Employment type: Full-time, Hybrid, Remote, Contract' },
    experienceRequired: { type: 'STRING', description: 'Experience requirement string, e.g. 3-5 Years, 7-10 Years' },
    salaryRange: { type: 'STRING', description: 'Salary range, e.g. ₹8,00,000 - ₹12,00,000 P.A. or Competitive' },
    openPositions: { type: 'NUMBER', description: 'Number of vacancies, default 1' },
    rolePurpose: { type: 'STRING', description: 'Summary of role purpose and scope' },
    mandatoryQualification: { type: 'STRING', description: 'Mandatory educational qualifications or certifications' },
    preferredQualification: { type: 'STRING', description: 'Preferred qualifications or bonuses' },
    reportsTo: { type: 'STRING', description: 'Reporting manager or director' },
    industry: { type: 'STRING', description: 'Industry or sector, e.g. Real Estate Development' },
    responsibilities: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Key job responsibilities' },
    competencies: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Key skills, competencies, and tool proficiencies' },
    keyResultAreas: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          area: { type: 'STRING' },
          kpi: { type: 'STRING' },
          target: { type: 'STRING' },
          weight: { type: 'STRING' },
          raw: { type: 'STRING' }
        }
      },
      description: 'Key Result Areas & Performance Indicators (KRAs / KPIs) if stated in the JD'
    }
  },
  required: ['title', 'department', 'responsibilities', 'competencies']
};

const JD_SYSTEM_INSTRUCTION = `You are an elite Talent Acquisition & HR Director for UrbanGaon Real Estate & Infrastructure Development.
Your mission is to extract complete, exact job opening specifications from this Job Description (JD) document:
1. TITLE: Exact role title (e.g. "Assistant Manager – Sales", "Sales & Marketing Manager", "Supervisor (Civil)", "Head of Architecture").
2. DEPARTMENT: Best matching department [Civil, Sales & Marketing, Architecture & Design, Project Management, Procurement / Supply Chain & Contracts, Finance & Accounts, Administration / Corporate HR, AI, IT & Research, Executive Office].
3. LOCATION: Location of role (default "Jaipur, Rajasthan (On-Site)" if not explicitly stated).
4. EXPERIENCE REQUIRED: Precise years range (e.g. "4 - 7 years", "3-5 Years", "7-10 Years").
5. SALARY RANGE: If stated (e.g. "₹12,00,000 - ₹18,00,000 P.A."), otherwise "₹6,00,000 - ₹12,00,000 P.A.".
6. OPEN POSITIONS: Number of vacancies if stated, otherwise 1.
7. RESPONSIBILITIES: Detailed bullet points of all primary duties and responsibilities mentioned in the JD.
8. KEY RESULT AREAS & PERFORMANCE INDICATORS: Extract table rows with area, metric/kpi, target, and weight percentage.
9. COMPETENCIES: Specific skills, tools, and domain competencies.
10. ROLE PURPOSE: 2-3 sentence clear summary of the role's purpose and mandate.
Return strictly valid JSON only.`;

router.post('/parse-jd', async (req, res) => {
  const apiKey = req.body?.apiKey || req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  const { fileName = 'JobDescription', mimeType = '', base64 = '', text = '' } = req.body || {};

  const isPdf = /pdf/i.test(mimeType) || /\.pdf$/i.test(fileName);
  const parts = [];

  if (isPdf && base64 && base64.length < 19_000_000) {
    parts.push({ inline_data: { mime_type: 'application/pdf', data: base64 } });
    if (text && text.trim().length > 30) {
      parts.push({ text: `Cross-reference Text Layer extracted from this JD:\n${String(text).slice(0, 25000)}` });
    }
  } else if (text && text.trim().length > 20) {
    parts.push({ text: `Job Description File: ${fileName}\nFull Document Content:\n${String(text).slice(0, 35000)}` });
  } else {
    return res.status(400).json({ success: false, error: 'No readable JD content provided.' });
  }

  if (apiKey) {
    for (const model of SUPPORTED_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          system_instruction: { parts: [{ text: JD_SYSTEM_INSTRUCTION }] },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.05,
            topP: 0.95,
            responseMimeType: 'application/json',
            responseSchema: JD_RESPONSE_SCHEMA
          }
        };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 40000);

        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!r.ok) continue;

        const data = await r.json();
        const out = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
        const parsed = extractJson(out);

        if (parsed && parsed.title) {
          return res.json({
            success: true,
            model,
            data: {
              ...parsed,
              location: parsed.location || 'Jaipur, Rajasthan',
              openPositions: Number(parsed.openPositions) || 1,
              type: parsed.type || 'Full-time',
              status: 'active',
              platforms: ['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon']
            }
          });
        }
      } catch (err) {
        console.warn(`[JD Parser] Error with model ${model}:`, err.message);
      }
    }
  }

  // Fallback: Robust deterministic text parsing engine with multi-role support
  const cleanDoc = (text || '').replace(/\r/g, '');

  const repairOcr = (str) => {
    return (str || '')
      .replace(/\bCoordinat\s+e\b/gi, 'Coordinate')
      .replace(/\bdocument\s+ation\b/gi, 'documentation')
      .replace(/\bcus\s+tomer\b/gi, 'customer')
      .replace(/\bfollow\s*-\s*up\b/gi, 'follow-up')
      .replace(/\bStron\s+g\b/gi, 'Strong')
      .replace(/\bGoo\s+d\b/gi, 'Good')
      .replace(/\bRes\s+ilient\b/gi, 'Resilient')
      .replace(/\bEn\s+sure\b/gi, 'Ensure')
      .replace(/\brelationship\s*-\s*building\b/gi, 'relationship-building')
      .replace(/\bself\s*-\s*motivated\b/gi, 'self-motivated')
      .replace(/\btarget\s*-\s*driven\b/gi, 'Target-driven')
      .replace(/\btarget\s*-\s*based\b/gi, 'target-based')
      .replace(/\bend\s*-\s*to\s*-\s*end\b/gi, 'end-to-end');
  };

  const rawRoleBlocks = cleanDoc
    .split(/(?=(?:^|\n)\s*Role\s*Overview\s*[:—–-]+)/i)
    .map((b) => b.trim())
    .filter(Boolean);

  let targetDoc = cleanDoc;
  if (rawRoleBlocks.length > 0) {
    if (fileName) {
      const cleanFn = fileName.toLowerCase().replace(/[-_]+/g, ' ');
      const words = cleanFn.split(/\s+/).filter((w) => w.length > 3 && !['role', 'overview', 'pdf', 'docx'].includes(w));
      let bestBlock = rawRoleBlocks[0];
      let maxMatches = -1;

      rawRoleBlocks.forEach((b) => {
        const headerLine = (b.split('\n')[0] || '').toLowerCase();
        const matchCount = words.filter((w) => headerLine.includes(w)).length;
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestBlock = b;
        }
      });
      targetDoc = maxMatches > 0 ? bestBlock : rawRoleBlocks[0];
    } else {
      targetDoc = rawRoleBlocks[0];
    }
  }

  const extractField = (doc, pattern) => {
    const match = doc.match(pattern);
    if (!match) return '';
    return match[1].replace(/^[—–\s:-]+|[—–\s:-]+$/g, '').trim();
  };

  // 1. Position / Job Title
  let title = extractField(targetDoc, /(?:^|\n)\s*Position\s*[:—–-]?\s*([^\n]+)/i);
  if (!title) {
    title = extractField(targetDoc, /(?:^|\n)\s*(?:Job\s*Title|Role\s*Title)\s*[:—–-]?\s*([^\n]+)/i);
  }
  if (!title) {
    title = extractField(targetDoc, /(?:^|\n)\s*Role\s*Overview\s*[:—–-]+\s*([^\n]+)/i);
  }
  if (!title) {
    title = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/^Role\s*Overview\s*[-_—–]+/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
  }

  // 2. Department
  const rawDept = extractField(targetDoc, /(?:^|\n)\s*Department\s*[:—–-]?\s*([^\n]+)/i);
  const lDept = (rawDept || title).toLowerCase();
  let department = 'Sales & Marketing';

  if (/\b(ai|it|research|software|data science|computer|tech)\b/i.test(lDept)) {
    department = 'AI, IT & Research';
  } else if (/\b(architect|architecture|interior|design|bim|revit)\b/i.test(lDept)) {
    department = 'Architecture & Design';
  } else if (/\b(project\s*manager|deputy\s*project|dpm|pm)\b/i.test(lDept) && !lDept.includes('civil')) {
    department = 'Project Management';
  } else if (/\b(civil|site|construction|structural|surveyor)\b/i.test(lDept)) {
    department = 'Civil';
  } else if (/\b(procure|supply|purchase|vendor|contracts|buying)\b/i.test(lDept)) {
    department = 'Procurement / Supply Chain & Contracts';
  } else if (/\b(sale|sales|market|marketing|branding|crm|lead|business development|bdd|bde)\b/i.test(lDept)) {
    department = 'Sales & Marketing';
  } else if (/\b(director|executive|ea to|leadership|ceo|board|secretariat)\b/i.test(lDept)) {
    department = 'Executive Office';
  } else if (/\b(account|finance|ca\b|audit|taxation|commercial|billing)\b/i.test(lDept)) {
    department = 'Finance & Accounts';
  } else if (/\b(hr|human|admin|people|recruitment|talent|payroll)\b/i.test(lDept)) {
    department = 'Administration / Corporate HR';
  }

  // 3. Reports To
  const reportsTo = extractField(targetDoc, /(?:^|\n)\s*Reports\s*To\s*[:—–-]?\s*([^\n]+)/i) || 'Leadership / Management';

  // 4. Industry
  const industry = extractField(targetDoc, /(?:^|\n)\s*Industry\s*[:—–-]?\s*([^\n]+)/i) || 'Real Estate Development';

  // 5. Location
  let location = extractField(targetDoc, /(?:^|\n)\s*Location\s*[:—–-]?\s*([^\n]+)/i) || 'Jaipur, Rajasthan (On-Site)';
  if (!location.toLowerCase().includes('on-site') && !location.toLowerCase().includes('remote')) {
    location = `${location} (On-Site)`;
  }

  // 6. Mandatory Qualification
  const mandatoryQualification = extractField(targetDoc, /(?:^|\n)\s*Mandatory\s*Qualification\s*[:—–-]?\s*([^\n]+)/i);

  // 7. Preferred Qualification
  const preferredQualification = extractField(targetDoc, /(?:^|\n)\s*Preferred\s*Qualification\s*[:—–-]?\s*([^\n]+)/i);

  // 8. Experience
  let experienceRequired = '3-5 Years';
  const expMatch = targetDoc.match(/(?:^|\n)\s*Experience\s*[:—–-]?\s*([^\n]+(?:\n[^\n]+)?)/i);
  if (expMatch && expMatch[1]) {
    const rawExp = expMatch[1].trim();
    const expRange =
      rawExp.match(/\d+[\s–-]+\d+\s*(?:years?|yrs?)/i) ||
      rawExp.match(/\d+\+?\s*(?:years?|yrs?)/i);
    experienceRequired = expRange ? expRange[0].replace(/–/g, '-').trim() : rawExp.slice(0, 40).trim();
  }

  // 9. Normalize structural section markers (matching whole line headers)
  const structured = targetDoc
    .replace(/(?:^|\n)\s*Role\s*Purpose[^\n]*/gi, '\n§§ROLE_PURPOSE§§\n')
    .replace(/(?:^|\n)\s*Key\s*Responsibili[^\n]*/gi, '\n§§RESPONSIBILITIES§§\n')
    .replace(/(?:^|\n)\s*Key\s*Result\s*Areas[^\n]*/gi, '\n§§KRA§§\n')
    .replace(/(?:^|\n)\s*(?:Competencies|Key\s*Skills)[^\n]*/gi, '\n§§COMPETENCIES§§\n');

  // Role Purpose
  const purpMatch = structured.match(/§§ROLE_PURPOSE§§\s*([\s\S]*?)(?=(?:§§RESPONSIBILITIES§§|§§KRA§§|§§COMPETENCIES§§|$))/i);
  let rolePurpose = '';
  if (purpMatch && purpMatch[1]) {
    rolePurpose = repairOcr(purpMatch[1].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim());
  } else {
    rolePurpose = `${title || 'Position'} responsible for key operational deliverables at UrbanGaon.`;
  }

  // Key Responsibilities
  const respMatch = structured.match(/§§RESPONSIBILITIES§§\s*([\s\S]*?)(?=(?:§§KRA§§|§§COMPETENCIES§§|$))/i);
  let responsibilities = [];
  if (respMatch && respMatch[1]) {
    responsibilities = respMatch[1]
      .split('\n')
      .map((l) => repairOcr(l.replace(/^[\s●•\-\*\d\.\)\u25cf\uf0b7\u2022]+/, '').trim()))
      .filter((l) => l.length > 5 && !/^(kra area|kpi|target|measure|wt\b|key responsibilities)/i.test(l));
  }

  // Key Result Areas & Performance Indicators (KRAs)
  const kraMatch = structured.match(/§§KRA§§\s*([\s\S]*?)(?=(?:§§COMPETENCIES§§|§§RESPONSIBILITIES§§|$))/i);
  const keyResultAreas = [];
  if (kraMatch && kraMatch[1]) {
    const kraLines = kraMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5 && !/^(kra area|kpi\s*\/\s*measure|target|wt\b)/i.test(l));

    kraLines.forEach((line) => {
      const wtMatch = line.match(/\s+(\d+%\s*)$/);
      if (wtMatch) {
        const weight = wtMatch[1].trim();
        const rest = line.slice(0, wtMatch.index).trim();
        keyResultAreas.push({
          raw: repairOcr(line),
          weight,
          details: repairOcr(rest)
        });
      } else {
        keyResultAreas.push({
          raw: repairOcr(line),
          weight: '',
          details: repairOcr(line)
        });
      }
    });
  }

  // Competencies
  const compMatch = structured.match(/§§COMPETENCIES§§\s*([\s\S]*?)(?=(?:§§KRA§§|§§RESPONSIBILITIES§§|§§ROLE_PURPOSE§§|$))/i);
  let competencies = [];
  if (compMatch && compMatch[1]) {
    competencies = compMatch[1]
      .split('\n')
      .map((l) => repairOcr(l.replace(/^[\s●•\-\*\d\.\)\u25cf\uf0b7\u2022]+/, '').trim()))
      .filter((l) => l.length > 3 && !/^(?:competencies|we are looking for|key skills|skills\b)/i.test(l));
  }

  // Salary Range
  const salaryMatch =
    targetDoc.match(/(?:₹|INR|Rs\.?)\s*\d+[\d,]*(?:\s*-\s*(?:₹|INR|Rs\.?)?\s*\d+[\d,]*)?\s*(?:P\.?A\.?|per\s*annum|LPA)?/i) ||
    targetDoc.match(/\d+(?:\.\d+)?\s*(?:-\s*\d+(?:\.\d+)?\s*)?LPA/i);
  const salaryRange = salaryMatch ? salaryMatch[0].trim() : '₹6,00,000 - ₹12,00,000 P.A.';

  // Job Type
  let jobType = 'Full-time';
  if (/hybrid/i.test(targetDoc)) jobType = 'Hybrid';
  else if (/remote/i.test(targetDoc)) jobType = 'Remote';
  else if (/contract/i.test(targetDoc)) jobType = 'Contract';

  return res.json({
    success: true,
    model: 'offline-nlp',
    data: {
      title: title || 'New Job Requisition',
      department,
      location,
      type: jobType,
      experienceRequired,
      salaryRange,
      openPositions: 1,
      rolePurpose,
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Execute key operational objectives'],
      keyResultAreas,
      competencies: competencies.length > 0 ? competencies : ['Strategic Execution', 'Team Collaboration'],
      mandatoryQualification,
      preferredQualification,
      reportsTo,
      industry,
      status: 'active',
      platforms: ['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon']
    }
  });
});

export default router;
