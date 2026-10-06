import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../backend/config/database.js';
import { Job } from '../backend/models/Job.js';
import { Candidate } from '../backend/models/Candidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read parsed roles
let rawParsed = fs.readFileSync(path.join(__dirname, '../parsed_roles_detail.json'), 'utf8');
if (rawParsed.charCodeAt(0) === 0xFEFF) rawParsed = rawParsed.slice(1);
const parsedRoles = JSON.parse(rawParsed);

// Map each parsed role to a structured JobPosting object
const newJobs = [
  {
    id: 'job-am-sales',
    title: 'Assistant Manager – Sales',
    department: 'Sales',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '4–7 Years',
    salaryRange: '₹8,00,000 - ₹14,00,000 P.A.',
    openPositions: 2,
    postedDate: '2026-09-10T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'apna', 'linkedin', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Leadership / Management',
    industry: 'Real Estate Development',
    mandatoryQualification: 'Graduate — mandatory',
    preferredQualification: 'MBA — preferred, not mandatory',
    rolePurpose: 'Responsible for driving sales closures across UrbanGaon developments by managing lead follow-up, site visits, channel partner coordination, and customer counselling, while maintaining CRM discipline and ensuring accurate booking documentation and a smooth handoff to collections and customer service.',
    responsibilities: parsedRoles[0].responsibilities,
    competencies: parsedRoles[0].competencies
  },
  {
    id: 'job-am-marketing',
    title: 'Assistant Manager – Marketing & Branding',
    department: 'Marketing & Branding',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '4–7 Years',
    salaryRange: '₹8,00,000 - ₹13,00,000 P.A.',
    openPositions: 2,
    postedDate: '2026-09-11T09:00:00.000Z',
    status: 'active',
    platforms: ['linkedin', 'naukri', 'apna', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Leadership / Management',
    industry: 'Real Estate Development',
    mandatoryQualification: 'Graduate — mandatory',
    preferredQualification: 'MBA in Marketing — preferred, not mandatory',
    rolePurpose: 'Responsible for owning and driving brand campaigns and marketing execution across UrbanGaon developments — including project launch support, digital and social media presence, creative collateral, events, agency coordination, customer communication, and campaign performance tracking — to build strong brand visibility and support sales and business objectives.',
    responsibilities: parsedRoles[1].responsibilities,
    competencies: parsedRoles[1].competencies
  },
  {
    id: 'job-ea-director',
    title: 'EA to Director',
    department: "Administration / Director's Office",
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '8–10 Years',
    salaryRange: '₹10,00,000 - ₹16,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-12T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Director',
    industry: 'Real Estate Development',
    mandatoryQualification: 'Graduate in any discipline — mandatory',
    preferredQualification: 'MBA preferred',
    rolePurpose: "Responsible for managing the Director's calendar, confidential correspondence, meeting minutes, travel, and communication — including MIS reporting, cross-functional action tracking, document preparation, and priority coordination — to ensure seamless and efficient support to the Director.",
    responsibilities: parsedRoles[2].responsibilities,
    competencies: parsedRoles[2].competencies
  },
  {
    id: 'job-head-ai-it',
    title: 'Head of AI Adoption, IT & Research',
    department: 'AI, IT & Research',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '10–15+ Years',
    salaryRange: '₹24,00,000 - ₹35,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-14T09:00:00.000Z',
    status: 'active',
    platforms: ['linkedin', 'naukri', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Leadership / Management',
    industry: 'Real Estate Development',
    mandatoryQualification: 'B.Tech / MCA — mandatory',
    preferredQualification: 'MBA-Tech hybrid or additional certification in AI/digital transformation — preferred, not mandatory',
    rolePurpose: 'Responsible for leading practical AI adoption, IT systems, automation, and research intelligence across UrbanGaon, driving digital productivity tools, vendor selection, cybersecurity hygiene, and cross-functional training to enable a technology-forward, data-driven organisation.',
    responsibilities: parsedRoles[3].responsibilities,
    competencies: parsedRoles[3].competencies
  },
  {
    id: 'job-head-architecture',
    title: 'Head of Architecture',
    department: 'Architecture & Design',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '12–18+ Years',
    salaryRange: '₹20,00,000 - ₹30,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-15T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Leadership / Management',
    industry: 'Real Estate Development',
    mandatoryQualification: 'Bachelor of Architecture (B.Arch.) with valid Council of Architecture registration',
    preferredQualification: 'Master of Architecture (M.Arch.), BIM / Sustainable Design / Project Management Certification',
    rolePurpose: 'Responsible for leading the complete architectural function across all UrbanGaon developments by driving concept design, design development, consultant coordination, statutory approvals, value engineering, execution support and design governance while ensuring quality, compliance, cost optimization and timely project delivery.',
    responsibilities: parsedRoles[4].responsibilities,
    competencies: parsedRoles[4].competencies
  },
  {
    id: 'job-research-analyst',
    title: 'In-house Research Analyst',
    department: 'AI, IT & Research',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '3–6 Years',
    salaryRange: '₹7,00,000 - ₹12,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-16T09:00:00.000Z',
    status: 'active',
    platforms: ['linkedin', 'naukri', 'internshala', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Head of AI Adoption, IT & Research',
    industry: 'Real Estate Development',
    mandatoryQualification: 'Graduate in Computer Science / IT / AI / Data Science / Engineering (or related technical discipline) — mandatory',
    preferredQualification: 'MCA / M.Tech in AI, Data Science, IT, or Business Analytics — preferred, not mandatory',
    rolePurpose: 'Responsible for driving in-house research intelligence covering market, competitor, and technology trends to support strategic decision-making across UrbanGaon, delivering timely and actionable insights to leadership and cross-functional teams.',
    responsibilities: parsedRoles[5].responsibilities,
    competencies: parsedRoles[5].competencies
  },
  {
    id: 'job-project-manager',
    title: 'Project Manager',
    department: 'Civil',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '10–15 Years',
    salaryRange: '₹18,00,000 - ₹26,00,000 P.A.',
    openPositions: 2,
    postedDate: '2026-09-18T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'referral', 'linkedin'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Leadership / Management',
    industry: 'Real Estate Development',
    mandatoryQualification: 'B.E. / B.Tech / Diploma in Civil Engineering, with a strong execution background — mandatory',
    preferredQualification: 'Additional certification in project management (e.g., PMP) — an added advantage',
    rolePurpose: 'Responsible for owning end-to-end project execution across UrbanGaon developments — including scheduling, contractor management, site coordination, quality and safety compliance, cost tracking, billing coordination, and project reporting — to ensure timely and quality delivery of project milestones.',
    responsibilities: parsedRoles[6].responsibilities,
    competencies: parsedRoles[6].competencies
  },
  {
    id: 'job-purchase-officer-china',
    title: 'Purchase Officer – International Procurement (China Exposure)',
    department: 'Procurement / Supply Chain',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '5–10 Years',
    salaryRange: '₹9,00,000 - ₹15,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-19T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Procurement Manager',
    industry: 'Consumer Electronics / Real Estate',
    mandatoryQualification: 'Graduate — mandatory',
    preferredQualification: 'Supply Chain / Commerce / Engineering background — an added advantage',
    rolePurpose: 'Responsible for sourcing materials from China and international suppliers — including preparing RFQs, comparing landed costs, negotiating terms, coordinating samples, verifying vendors, managing import documentation and logistics, and monitoring quality and supplier performance — to ensure timely, cost-effective, and quality procurement.',
    responsibilities: parsedRoles[7].responsibilities,
    competencies: parsedRoles[7].competencies
  },
  {
    id: 'job-supervisor-civil',
    title: 'Supervisor (Civil)',
    department: 'Civil',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '3–8 Years',
    salaryRange: '₹4,50,000 - ₹7,50,000 P.A.',
    openPositions: 3,
    postedDate: '2026-09-20T09:00:00.000Z',
    status: 'active',
    platforms: ['newspaper', 'naukri', 'apna'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Project Manager',
    industry: 'Real Estate Development',
    mandatoryQualification: '10+2 with relevant site experience — mandatory',
    preferredQualification: 'Diploma in Civil Engineering — preferred',
    rolePurpose: 'Responsible for supervising daily site activity — including labor and vendor coordination, drawing execution, material tracking, quality checks, safety discipline, and daily progress reporting — and escalating site issues promptly to ensure smooth on-site execution.',
    responsibilities: parsedRoles[8].responsibilities,
    competencies: parsedRoles[8].competencies
  },
  {
    id: 'job-accounts-manager-head',
    title: 'Accounts Manager (Head)',
    department: 'Accounts & Finance',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '4–8 Years',
    salaryRange: '₹8,00,000 - ₹14,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-21T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'linkedin', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Leadership / Management',
    industry: 'Construction / Real Estate Development',
    mandatoryQualification: 'Commerce Post Graduate (M.Com) — mandatory',
    preferredQualification: 'CA Inter — preferred, not mandatory',
    rolePurpose: 'Responsible for leading the accounts function across UrbanGaon construction projects by ensuring accurate bookkeeping, timely statutory compliance, project-wise cost and vendor accounting, and reliable financial reporting, while maintaining strong internal controls and supporting management with MIS and audit readiness.',
    responsibilities: parsedRoles[9].responsibilities,
    competencies: parsedRoles[9].competencies
  },
  {
    id: 'job-deputy-project-manager',
    title: 'Deputy Project Manager',
    department: 'Civil',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '4–9 Years',
    salaryRange: '₹12,00,000 - ₹18,00,000 P.A.',
    openPositions: 2,
    postedDate: '2026-09-22T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'apna', 'referral'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Project Manager / Head – Projects',
    industry: 'Real Estate Development',
    mandatoryQualification: 'B.E. / B.Tech / Diploma in Civil Engineering, with a solid site execution background — mandatory',
    preferredQualification: 'PMP or similar project management certification; MS Project / Primavera — an added advantage',
    rolePurpose: "Responsible for supporting the Project Manager in project execution across UrbanGaon developments — including site management, scheduling, contractor coordination, quality and safety compliance, cost monitoring, billing support, and reporting — and leading the project in the Project Manager's absence.",
    responsibilities: parsedRoles[10].responsibilities,
    competencies: parsedRoles[10].competencies
  },
  {
    id: 'job-purchase-manager-construction',
    title: 'Purchase Manager – Construction Procurement',
    department: 'Procurement / Supply Chain & Contracts',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    experienceRequired: '5–10 Years',
    salaryRange: '₹12,00,000 - ₹18,00,000 P.A.',
    openPositions: 1,
    postedDate: '2026-09-23T09:00:00.000Z',
    status: 'active',
    platforms: ['naukri', 'referral', 'linkedin'],
    applicantsCount: 0,
    hiredCount: 0,
    reportsTo: 'Head of Procurement / Project Director',
    industry: 'Construction / Infrastructure & Real Estate Development',
    mandatoryQualification: 'Graduate — mandatory',
    preferredQualification: 'B.E. / B.Tech (Civil) or MBA in Supply Chain / Materials Management — an added advantage',
    rolePurpose: 'Responsible for planning and managing the procurement of construction materials, equipment, and subcontract packages across projects — including preparing RFQs and tender comparisons, negotiating rates and terms, developing and evaluating vendors and subcontractors, coordinating site deliveries, and ensuring material quality and compliance — to deliver timely, cost-effective, and quality procurement within project budgets and schedules.',
    responsibilities: parsedRoles[11].responsibilities,
    competencies: parsedRoles[11].competencies
  }
];

// Mapping old candidate jobId & jobAppliedFor to new jobs
const candidateJobMap = {
  'job-dpm': { id: 'job-deputy-project-manager', title: 'Deputy Project Manager', dept: 'Civil' },
  'job-ea': { id: 'job-ea-director', title: 'EA to Director', dept: "Administration / Director's Office" },
  'job-driver': { id: 'job-supervisor-civil', title: 'Supervisor (Civil)', dept: 'Civil' },
  'job-civil-sup': { id: 'job-supervisor-civil', title: 'Supervisor (Civil)', dept: 'Civil' },
  'job-talent': { id: 'job-ea-director', title: 'EA to Director', dept: "Administration / Director's Office" },
  'job-sales-mkt': { id: 'job-am-sales', title: 'Assistant Manager – Sales', dept: 'Sales' },
  'job-pm': { id: 'job-project-manager', title: 'Project Manager', dept: 'Civil' },
  'job-purchase': { id: 'job-purchase-manager-construction', title: 'Purchase Manager – Construction Procurement', dept: 'Procurement / Supply Chain & Contracts' },
  'job-architect': { id: 'job-head-architecture', title: 'Head of Architecture', dept: 'Architecture & Design' },
  'job-general': { id: 'job-head-ai-it', title: 'Head of AI Adoption, IT & Research', dept: 'AI, IT & Research' }
};

async function runMigration() {
  console.log('🚀 Starting Job Requisition Migration...');
  await connectDB();

  // 1. Delete old jobs from MongoDB
  const delRes = await Job.deleteMany({});
  console.log(`🗑️ Deleted ${delRes.deletedCount} old jobs from MongoDB.`);

  // 2. Update candidates in MongoDB to reference new jobs
  const candidates = await Candidate.find({});
  let updatedCandidatesCount = 0;
  for (const cand of candidates) {
    const mapping = candidateJobMap[cand.jobId];
    if (mapping) {
      cand.jobId = mapping.id;
      cand.jobAppliedFor = mapping.title;
      cand.department = mapping.dept;
      await cand.save();
      updatedCandidatesCount++;
    }
  }
  console.log(`🔄 Updated ${updatedCandidatesCount} candidates in MongoDB with new job mappings.`);

  // 3. Count applicants per new job
  for (const job of newJobs) {
    const count = await Candidate.countDocuments({ jobId: job.id });
    job.applicantsCount = count;
  }

  // 4. Insert 12 new jobs into MongoDB
  await Job.insertMany(newJobs);
  console.log(`✅ Inserted ${newJobs.length} new jobs into MongoDB.`);

  // 5. Update backend/data/seedData.json
  const seedPath = path.join(__dirname, '../backend/data/seedData.json');
  const seedRaw = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  seedRaw.jobs = newJobs;
  if (Array.isArray(seedRaw.candidates)) {
    seedRaw.candidates = seedRaw.candidates.map(c => {
      const mapping = candidateJobMap[c.jobId];
      if (mapping) {
        return {
          ...c,
          jobId: mapping.id,
          jobAppliedFor: mapping.title,
          department: mapping.dept
        };
      }
      return c;
    });
  }
  fs.writeFileSync(seedPath, JSON.stringify(seedRaw, null, 2), 'utf8');
  console.log(`📁 Updated backend/data/seedData.json with ${newJobs.length} jobs.`);

  // 6. Save clean json for frontend mockData
  fs.writeFileSync(
    path.join(__dirname, '../new_jobs_seed.json'),
    JSON.stringify(newJobs, null, 2),
    'utf8'
  );

  console.log('✨ Job migration script completed successfully!');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
