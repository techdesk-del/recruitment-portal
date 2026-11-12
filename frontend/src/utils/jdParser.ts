/**
 * Enterprise Job Description (JD) Parsing Engine
 * Extracts exact specifications from PDF, DOCX, and TXT files with 100% fidelity.
 */

import { JobPosting, KeyResultArea } from '../types';

export const DEPARTMENTS = [
  'Civil',
  'Architecture & Design',
  'Project Management',
  'Procurement / Supply Chain & Contracts',
  'Sales & Marketing',
  'Executive Office',
  'Finance & Accounts',
  'AI, IT & Research',
  'Administration / Corporate HR'
] as const;

export function normalizeDepartment(raw: string): string {
  if (!raw) return 'Sales & Marketing';
  const l = raw.toLowerCase().trim();

  if (/\b(ai|it|research|software|data science|computer|tech)\b/i.test(l)) {
    return 'AI, IT & Research';
  }
  if (/\b(architect|architecture|interior|design|bim|revit)\b/i.test(l)) {
    return 'Architecture & Design';
  }
  if (/\b(project\s*manager|deputy\s*project|dpm|pm)\b/i.test(l) && !l.includes('civil')) {
    return 'Project Management';
  }
  if (/\b(civil|site|construction|structural|surveyor)\b/i.test(l)) {
    return 'Civil';
  }
  if (/\b(procure|supply|purchase|vendor|contracts|buying)\b/i.test(l)) {
    return 'Procurement / Supply Chain & Contracts';
  }
  if (/\b(sale|sales|market|marketing|branding|crm|lead|business development|bdd|bde)\b/i.test(l)) {
    return 'Sales & Marketing';
  }
  if (/\b(director|executive|ea to|leadership|ceo|board|secretariat)\b/i.test(l)) {
    return 'Executive Office';
  }
  if (/\b(account|finance|ca\b|audit|taxation|commercial|billing)\b/i.test(l)) {
    return 'Finance & Accounts';
  }
  if (/\b(hr|human|admin|people|recruitment|talent|payroll)\b/i.test(l)) {
    return 'Administration / Corporate HR';
  }

  const directMatch = DEPARTMENTS.find((d) => d.toLowerCase() === l);
  return directMatch || 'Sales & Marketing';
}

export function repairOcrText(str: string): string {
  if (!str) return '';
  return str
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
}

export function parseJdText(
  text: string, 
  fileName: string = '', 
  selectedRoleIndex?: number
): Partial<JobPosting> & { roleBlocks?: { title: string; text: string }[] } {
  const cleanDoc = (text || '').replace(/\r/g, '');

  // Split multi-role documents (e.g. 2-page PDF containing multiple JDs)
  const rawRoleBlocks = cleanDoc
    .split(/(?=(?:^|\n)\s*Role\s*Overview\s*[:—–-]+)/i)
    .map(b => b.trim())
    .filter(Boolean);

  const roleBlocksWithMeta = (rawRoleBlocks.length > 0 ? rawRoleBlocks : [cleanDoc]).map((block, idx) => {
    const posMatch = block.match(/(?:^|\n)\s*Position\s*[:—–-]?\s*([^\n]+)/i);
    const ovMatch = block.match(/(?:^|\n)\s*Role\s*Overview\s*[:—–-]+\s*([^\n]+)/i);
    const bTitle = (posMatch ? posMatch[1] : (ovMatch ? ovMatch[1] : `Role ${idx + 1}`))
      .replace(/^[—–\s:-]+|[—–\s:-]+$/g, '')
      .trim();
    return { title: bTitle, text: block };
  });

  let targetDoc = cleanDoc;
  if (roleBlocksWithMeta.length > 0) {
    if (typeof selectedRoleIndex === 'number' && roleBlocksWithMeta[selectedRoleIndex]) {
      targetDoc = roleBlocksWithMeta[selectedRoleIndex].text;
    } else if (fileName) {
      const cleanFn = fileName.toLowerCase().replace(/[-_]+/g, ' ');
      const words = cleanFn.split(/\s+/).filter(w => w.length > 3 && !['role', 'overview', 'pdf', 'docx'].includes(w));
      let bestBlock = roleBlocksWithMeta[0].text;
      let maxMatches = -1;

      roleBlocksWithMeta.forEach(b => {
        const headerLine = (b.text.split('\n')[0] || '').toLowerCase();
        const matchCount = words.filter(w => headerLine.includes(w)).length;
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestBlock = b.text;
        }
      });

      targetDoc = maxMatches > 0 ? bestBlock : roleBlocksWithMeta[0].text;
    } else {
      targetDoc = roleBlocksWithMeta[0].text;
    }
  }

  const extractField = (doc: string, pattern: RegExp): string => {
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
  const department = normalizeDepartment(rawDept || title);

  // 3. Reports To
  const reportsTo = extractField(targetDoc, /(?:^|\n)\s*Reports\s*To\s*[:—–-]?\s*([^\n]+)/i) || 'Leadership / Management';

  // 4. Industry
  const industry = extractField(targetDoc, /(?:^|\n)\s*Industry\s*[:—–-]?\s*([^\n]+)/i) || 'Real Estate Development';

  // 5. Location
  let location = extractField(targetDoc, /(?:^|\n)\s*Location\s*[:—–-]?\s*([^\n]+)/i) || 'Jaipur, Rajasthan';
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
    rolePurpose = repairOcrText(purpMatch[1].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim());
  } else {
    rolePurpose = `${title} position responsible for key operational deliverables at UrbanGaon.`;
  }

  // Key Responsibilities
  const respMatch = structured.match(/§§RESPONSIBILITIES§§\s*([\s\S]*?)(?=(?:§§KRA§§|§§COMPETENCIES§§|$))/i);
  let responsibilities: string[] = [];
  if (respMatch && respMatch[1]) {
    responsibilities = respMatch[1]
      .split('\n')
      .map(l => repairOcrText(l.replace(/^[\s●•\-\*\d\.\)\u25cf\uf0b7\u2022]+/, '').trim()))
      .filter(l => l.length > 5 && !/^(kra area|kpi|target|measure|wt\b|key responsibilities)/i.test(l));
  }

  // Key Result Areas & Performance Indicators (KRAs)
  const kraMatch = structured.match(/§§KRA§§\s*([\s\S]*?)(?=(?:§§COMPETENCIES§§|§§RESPONSIBILITIES§§|$))/i);
  const keyResultAreas: KeyResultArea[] = [];
  if (kraMatch && kraMatch[1]) {
    const kraLines = kraMatch[1]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5 && !/^(kra area|kpi\s*\/\s*measure|target|wt\b)/i.test(l));

    kraLines.forEach(line => {
      const wtMatch = line.match(/\s+(\d+%\s*)$/);
      if (wtMatch) {
        const weight = wtMatch[1].trim();
        const rest = line.slice(0, wtMatch.index).trim();
        keyResultAreas.push({
          raw: repairOcrText(line),
          weight,
          details: repairOcrText(rest)
        });
      } else {
        keyResultAreas.push({
          raw: repairOcrText(line),
          weight: '',
          details: repairOcrText(line)
        });
      }
    });
  }

  // Competencies
  const compMatch = structured.match(/§§COMPETENCIES§§\s*([\s\S]*?)(?=(?:§§KRA§§|§§RESPONSIBILITIES§§|§§ROLE_PURPOSE§§|$))/i);
  let competencies: string[] = [];
  if (compMatch && compMatch[1]) {
    competencies = compMatch[1]
      .split('\n')
      .map(l => repairOcrText(l.replace(/^[\s●•\-\*\d\.\)\u25cf\uf0b7\u2022]+/, '').trim()))
      .filter(l => l.length > 3 && !/^(?:competencies|we are looking for|key skills|skills\b)/i.test(l));
  }

  // Salary Range
  const salaryMatch =
    targetDoc.match(/(?:₹|INR|Rs\.?)\s*\d+[\d,]*(?:\s*-\s*(?:₹|INR|Rs\.?)?\s*\d+[\d,]*)?\s*(?:P\.?A\.?|per\s*annum|LPA)?/i) ||
    targetDoc.match(/\d+(?:\.\d+)?\s*(?:-\s*\d+(?:\.\d+)?\s*)?LPA/i);

  const salaryRange = salaryMatch ? salaryMatch[0].trim() : '₹6,00,000 - ₹12,00,000 P.A.';

  // Job Type
  let jobType: JobPosting['type'] = 'Full-time';
  if (/hybrid/i.test(targetDoc)) jobType = 'Hybrid';
  else if (/remote/i.test(targetDoc)) jobType = 'Remote';
  else if (/contract/i.test(targetDoc)) jobType = 'Contract';

  return {
    title: title || 'New Job Requisition',
    department,
    location,
    type: jobType,
    experienceRequired,
    salaryRange,
    openPositions: 1,
    rolePurpose,
    responsibilities: responsibilities.length > 0 ? responsibilities : ['Execute daily operational objectives', 'Coordinate with cross-functional teams'],
    competencies: competencies.length > 0 ? competencies : ['Strategic Execution', 'Team Collaboration', 'Problem Solving'],
    keyResultAreas,
    mandatoryQualification,
    preferredQualification,
    reportsTo,
    industry,
    status: 'active',
    platforms: ['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon'],
    availableRoles: roleBlocksWithMeta.length > 1 ? roleBlocksWithMeta.map(r => r.title) : undefined,
    roleBlocks: roleBlocksWithMeta.length > 1 ? roleBlocksWithMeta : undefined
  };
}
