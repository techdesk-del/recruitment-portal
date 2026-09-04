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

export interface EvaluationCriteriaRating {
  rp: number; // 1-5, 0 = unrated
  yt: number; // 1-5, 0 = unrated
  ss: number; // 1-5, 0 = unrated
  comments: string;
}

export interface DetailedInterviewEvaluation {
  conductedBy: string;
  interviewDate: string;
  interviewStartTime: string;
  department: string;
  currentSalary: string;
  expectedSalary: string;
  
  // 6 Questions from 2025/HRD/EF/Version-1
  coreValues: EvaluationCriteriaRating;
  personality: EvaluationCriteriaRating;
  communication: EvaluationCriteriaRating;
  adaptability: EvaluationCriteriaRating;
  technical: EvaluationCriteriaRating;
  overallImpression: EvaluationCriteriaRating;

  positives: [string, string, string];
  negatives: [string, string, string];

  overallRecommendation: 'strong_hire' | 'hire' | 'neutral' | 'do_not_hire';
  finalComments: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

export interface Scorecard {
  technical: number;       // 1-5
  problemSolving?: number;  // 1-5
  communication: number;   // 1-5
  cultureFit?: number;      // 1-5
  overallRecommendation: 'strong_hire' | 'hire' | 'neutral' | 'do_not_hire';
  evaluationNotes: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  detailed?: DetailedInterviewEvaluation;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
  type: 'status' | 'note' | 'scorecard' | 'interview' | 'ingestion' | 'call';
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
  callingDetails?: CandidateCallingDetails;
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

export type InterviewRoundType = 
  | 'Round 1: Screening / Technical'
  | 'Round 2: System Design & Coding'
  | 'Round 3: HR & Culture Fit'
  | 'Round 4: CEO / Leadership Round';

export type InterviewPlatform = 'google_meet' | 'zoom' | 'teams' | 'onsite' | 'phone';

export type InterviewStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'rescheduled' | 'cancelled';

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateLocation?: string;
  candidateAvatar?: string;
  jobTitle: string;
  jobId: string;
  department: string;
  round: InterviewRoundType;
  date: string; // YYYY-MM-DD (e.g. 2026-08-29)
  startTime: string; // e.g. "10:30 AM" or "10:30"
  endTime: string; // e.g. "11:30 AM" or "11:30"
  durationMinutes?: number; // e.g. 45 or 60
  interviewerName: string;
  interviewerRole: string;
  interviewerEmail: string;
  platform: InterviewPlatform;
  meetingLink?: string;
  meetingId?: string;
  meetingPasscode?: string;
  location?: string;
  status: InterviewStatus;
  feedbackStatus: 'pending' | 'submitted';
  notes?: string;
  atsMatchScore?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Candidate Telecalling & Telephonic Screening Types
export type CallDisposition =
  | 'connected_interested'            // Connected - Interested & Qualified
  | 'connected_screening_passed'       // Screening Passed - Move to R1 Interview
  | 'connected_hold'                  // Connected - Kept on Hold / Decision Pending
  | 'connected_callback_requested'     // Call Back Later / Follow-up Scheduled
  | 'connected_not_interested'         // Connected - Not Interested / Declined
  | 'connected_screening_failed'       // Screening Failed - Rejected
  | 'ringing_no_answer'               // Ringing / Not Picked Up
  | 'busy'                            // Busy / Call Waiting
  | 'switched_off'                    // Switched Off / Out of Coverage
  | 'wrong_number';                   // Wrong Number / Invalid

export type CallingOverallStatus =
  | 'pending'
  | 'in_progress'
  | 'connected'
  | 'follow_up'
  | 'on_hold'
  | 'qualified'
  | 'disqualified'
  | 'unreachable';

export interface CallRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  jobTitle: string;
  jobId?: string;
  recruiterName: string;
  callTime: string; // ISO string
  durationSeconds: number; // e.g. 185 (3m 5s)
  disposition: CallDisposition;
  notes: string;
  followUpDate?: string; // YYYY-MM-DD
  followUpTime?: string; // e.g. "03:30 PM"
  confirmedCurrentCtc?: string;
  confirmedExpectedCtc?: string;
  confirmedNoticePeriod?: string;
  relocationPreference?: 'Immediate Relocate' | 'Prefers Remote' | 'Current City Only' | 'Open to Hybrid';
  communicationRating?: number; // 1-5
  technicalFitRating?: number; // 1-5
  tags?: string[];
}

export interface CandidateCallingDetails {
  totalCalls: number;
  lastCallTime?: string;
  lastDisposition?: CallDisposition;
  lastCallNotes?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  callStatus: CallingOverallStatus;
  confirmedCurrentSalary?: string;
  confirmedExpectedSalary?: string;
  confirmedNoticePeriod?: string;
  callHistory: CallRecord[];
}

