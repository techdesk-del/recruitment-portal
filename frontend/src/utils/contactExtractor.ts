// Pure, dependency-free contact extraction helpers (unit-testable in Node).

// ---------------------------------------------------------------------------
// CONTACT EXTRACTION (deterministic, literal — prioritizes top header/title zone)
// ---------------------------------------------------------------------------

const KNOWN_TLDS = ['co.in', 'ac.in', 'org.in', 'net.in', 'gov.in', 'edu.in', 'com', 'in', 'org', 'net', 'edu', 'co', 'info', 'biz', 'io', 'ai', 'me', 'us', 'uk', 'live', 'online', 'tech'];
const EMAIL_STRICT = /^[a-z0-9][a-z0-9._%+-]*@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,10}$/i;

/** Validate an email address string. */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (!EMAIL_STRICT.test(e)) return false;
  if (/@(example|domain|email|candidate)\.(com|org)$/.test(e)) return false;
  return true;
}

/** Repair common PDF text-layer artefacts around emails ("name @ gmail . com", "mailto:", glued words). */
export function normalizeForEmail(text: string): string {
  return (text || '')
    .replace(/mailto:/gi, ' ')
    .replace(/\s*(?:\[at\]|\(at\)|\{at\})\s*/gi, '@')
    .replace(/\s*(?:\[dot\]|\(dot\))\s*/gi, '.')
    .replace(/([a-z0-9._%+-])\s+@/gi, '$1@')
    .replace(/@\s+([a-z0-9])/gi, '@$1')
    .replace(/(@[a-z0-9-]+(?:\.[a-z0-9-]+)*)\s*\.\s*([a-z]{2,6})\b/gi, '$1.$2')
    .replace(/(@[a-z0-9-]+)\s+(com|in|org|net|co\.in)\b/gi, '$1.$2');
}

/** Trim junk glued to the end of an email, e.g. "abc@gmail.comMobile" → "abc@gmail.com". */
function trimEmailTail(raw: string): string {
  let e = raw.replace(/^[._%+-]+/, '').replace(/[._-]+$/, '');
  const at = e.indexOf('@');
  if (at < 0) return e;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  const labels = domain.split('.');
  // Known freemail providers → force exact domain
  const fm = domain.match(/^(gmail|yahoo|ymail|hotmail|outlook|rediffmail|icloud|live|aol|protonmail|zoho)\.(co\.in|com|in)/i);
  if (fm) return `${local}@${fm[0]}`.toLowerCase();
  // Last label glued with text (e.g. "comphone") → cut to the longest known TLD prefix
  const last = labels[labels.length - 1];
  if (last.length > 3) {
    const tld = KNOWN_TLDS.filter((t) => !t.includes('.')).sort((a, b) => b.length - a.length).find((t) => last.toLowerCase().startsWith(t));
    if (tld) labels[labels.length - 1] = tld;
  }
  return `${local}@${labels.join('.')}`.toLowerCase();
}

/**
 * Isolates the Top Header / Contact zone of a resume.
 * This is where candidate's own identity lives (before experience, job history, projects).
 */
export function extractHeaderZone(text: string): string {
  if (!text) return '';
  // Cut off at first occurrence of experience / employment section header
  const experienceHeader = text.search(/(?:^|\n)\s*(?:work\s+experience|professional\s+experience|employment\s+history|career\s+history|experience\s*[:\n]|projects\s*[:\n])/i);
  if (experienceHeader > 80) {
    return text.slice(0, experienceHeader);
  }
  // Otherwise take top 1400 characters (typically page 1 header)
  return text.slice(0, 1400);
}

/** Extract candidate emails — prioritizes top header/title section. */
export function extractAllEmails(text: string): string[] {
  const norm = normalizeForEmail(text);
  const regex = /[a-z0-9][a-z0-9._%+-]*@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;
  
  // 1. First check the top header / title zone
  const headerText = normalizeForEmail(extractHeaderZone(text));
  const headerEmails: string[] = [];
  for (const m of headerText.match(regex) || []) {
    const e = trimEmailTail(m);
    if (isValidEmail(e) && !headerEmails.includes(e)) headerEmails.push(e);
  }
  if (headerEmails.length > 0) return headerEmails;

  // 2. Fallback to full document if not found in header
  const out: string[] = [];
  for (const m of norm.match(regex) || []) {
    const e = trimEmailTail(m);
    if (isValidEmail(e) && !out.includes(e)) out.push(e);
  }
  return out;
}

// Extract email from text with strict regex (Top title / header takes priority)
export function extractEmail(text: string, _candidateName?: string): string {
  return extractAllEmails(text)[0] || '';
}

/** Normalise any phone string to a canonical 10-digit Indian mobile (or '' if not a valid mobile). */
export function normalizeIndianMobile(raw: string | undefined | null): string {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  else if (d.length === 13 && d.startsWith('091')) d = d.slice(3);
  if (d.length !== 10 || !/^[6-9]/.test(d)) return '';
  if (/^(\d)\1{9}$/.test(d)) return '';           // 9999999999
  if (d === '9829000000' || d === '9829012345') return ''; // legacy placeholders
  return d;
}

export function formatIndianMobile(tenDigits: string): string {
  return tenDigits.length === 10 ? `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}` : tenDigits;
}

/** 
 * Extract candidate mobile numbers with TOP HEADER / TITLE ZONE PRIORITY.
 * Numbers appearing at the top of the resume near the candidate name get maximum score,
 * completely preventing past experience / company phone numbers from overriding the candidate.
 */
export function extractAllPhones(text: string): string[] {
  const src = text || '';
  const scored = new Map<string, number>();
  const re = /(?<![\d])(?:(?:\+|00)?\s*91[\s\-.)]*|0)?\(?[6-9](?:[\s\-.)(]{0,2}\d){9}(?![\d])/g;
  
  // Find where experience begins so we know the header boundary
  const expIndex = src.search(/(?:^|\n)\s*(?:work\s+experience|professional\s+experience|employment\s+history|experience\s*[:\n])/i);
  const headerBoundary = expIndex > 100 ? expIndex : 1200;

  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const num = normalizeIndianMobile(m[0]);
    if (!num) continue;
    const before = src.slice(Math.max(0, m.index - 50), m.index).toLowerCase();
    const hasLabel = /(mob|mobile|phone|ph\b|ph\.|contact|cell|tel|whatsapp|call|📞|☎)/.test(before);
    
    // Numbers broken into many groups (e.g. "6 2019 2020 2") are usually dates/tables, not phones
    const core = m[0].replace(/^(?:(?:\+|00)?\s*91[\s\-.)]*|0)/, '');
    const separatorGroups = (core.match(/[\s\-.)(]+/g) || []).length;
    if (separatorGroups > 3 && !hasLabel) continue;

    let score = 10;
    if (hasLabel) score += 35;

    // TOP HEADER PRIORITY: If number is in top header zone (before experience), give massive boost!
    if (m.index < headerBoundary) {
      score += 100; // Unstoppable boost for top header contact
      score += Math.max(0, 30 - Math.floor(m.index / 20));
    } else {
      // Numbers far down in the experience section are heavily penalised
      score -= 40;
    }

    if (/(father|mother|reference|referee|guardian|husband|spouse|emergency)/.test(before)) score -= 60;
    if (/\b(date|dob|pin|pincode|zip|aadhaar|aadhar|pan|passport|account|a\/c|ifsc|uan)\b/.test(before)) score -= 50;

    scored.set(num, Math.max(scored.get(num) ?? -999, score) + (scored.has(num) ? 5 : 0));
  }

  const ranked = [...scored.entries()]
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => formatIndianMobile(n));

  if (ranked.length > 0) return ranked;

  // International fallback (e.g. +971 50 123 4567) in header zone first
  const intl = src.slice(0, headerBoundary).match(/\+(?!91)\d{1,3}[\s-]?\(?\d{1,4}\)?(?:[\s-]?\d{2,5}){2,4}/g) || 
               src.match(/\+(?!91)\d{1,3}[\s-]?\(?\d{1,4}\)?(?:[\s-]?\d{2,5}){2,4}/g) || [];
  return intl.map((p) => p.replace(/\s+/g, ' ').trim()).filter((p) => {
    const len = p.replace(/\D/g, '').length;
    return len >= 9 && len <= 15;
  });
}

// Extract primary candidate mobile (Strictly Top Header / Title Zone first)
export function extractPhone(text: string): string {
  return extractAllPhones(text)[0] || '';
}
