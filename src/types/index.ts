export type CandidateSource = 'naukri' | 'linkedin' | 'indeed' | 'apna' | 'urbangaon' | 'internshala' | 'referral';

export type CandidateStatus = 
  | 'applied' 
  | 'screening' 
  | 'shortlisted' 
  | 'interview_r1' 
  | 'interview_r2' 
  | 'offered' 
  | 'joined' 
  | 'rejected';

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  location: string;
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface ResumeData {
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications?: string[];
  projects?: { title: string; desc: string; link?: string }[];
  languages?: string[];
}

export interface Scorecard {
  technical: number;       // 1-5
  problemSolving: number;  // 1-5
  communication: number;   // 1-5
  cultureFit: number;      // 1-5
  overallRecommendation: 'strong_hire' | 'hire' | 'neutral' | 'do_not_hire';
  evaluationNotes: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  type: 'status' | 'note' | 'scorecard' | 'interview' | 'ingestion';
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  source: CandidateSource;
  sourceId?: string; // external ID from Naukri, LinkedIn, etc.
  jobAppliedFor: string;
  jobId: string;
  department: string;
  appliedDate: string;
  lastUpdatedDate: string;
  status: CandidateStatus;
  atsMatchScore: number; // 0-100
  rating: number; // 1-5
  experienceYears: number;
  currentCompany?: string;
  currentDesignation?: string;
  currentSalary?: string;
  expectedSalary: string;
  noticePeriod: string;
  recruiterAssigned: string;
  tags: string[];
  notes: string;
  profileUrl?: string; // LinkedIn URL or portfolio
  resumeUrl?: string;
  resumeData: ResumeData;
  scorecard?: Scorecard;
  activityHistory: ActivityLog[];
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Remote' | 'Hybrid' | 'Contract';
  experienceRequired: string;
  salaryRange: string;
  openPositions: number;
  postedDate: string;
  status: 'active' | 'paused' | 'closed';
  platforms: CandidateSource[];
  applicantsCount: number;
  hiredCount: number;
}

export interface DashboardMetrics {
  totalApplications: number;
  activeCandidates: number;
  avgTimeToHireDays: number;
  overallConversionRate: number;
  openPositionsCount: number;
  activeInterviews: number;
  offerAcceptanceRate: number;
  sourceBreakdown: Record<CandidateSource, number>;
  statusBreakdown: Record<CandidateStatus, number>;
  monthlyTrend: { date: string; applications: number; hires: number }[];
}

export interface FilterState {
  searchQuery: string;
  source: CandidateSource | 'all';
  status: CandidateStatus | 'all';
  jobId: string | 'all';
  experienceRange: string | 'all'; // '0-2', '3-5', '6-10', '10+'
  recruiter: string | 'all';
  dateRange: 'all' | 'today' | '7d' | '30d' | '90d';
  minRating: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}
