import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  performedBy: { type: String, default: 'Lead Recruiter' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  type: {
    type: String,
    enum: ['status', 'note', 'scorecard', 'interview', 'ingestion', 'call'],
    default: 'status'
  }
}, { _id: false });

const WorkExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, default: '' },
  location: { type: String, default: '' },
  highlights: [{ type: String }]
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, default: '' },
  grade: { type: String }
}, { _id: false });

const ResumeDataSchema = new mongoose.Schema({
  summary: { type: String, default: '' },
  skills: [{ type: String }],
  experience: [WorkExperienceSchema],
  education: [EducationSchema],
  certifications: [{ type: String }],
  projects: [{
    title: String,
    desc: String,
    link: String
  }],
  languages: [{ type: String }]
}, { _id: false });

const EvaluationRatingSchema = new mongoose.Schema({
  rp: { type: Number, default: 0 },
  yt: { type: Number, default: 0 },
  ss: { type: Number, default: 0 },
  comments: { type: String, default: '' }
}, { _id: false });

const DetailedInterviewEvaluationSchema = new mongoose.Schema({
  conductedBy: { type: String, default: '' },
  interviewDate: { type: String, default: '' },
  interviewStartTime: { type: String, default: '' },
  department: { type: String, default: '' },
  currentSalary: { type: String, default: '' },
  expectedSalary: { type: String, default: '' },
  coreValues: EvaluationRatingSchema,
  personality: EvaluationRatingSchema,
  communication: EvaluationRatingSchema,
  adaptability: EvaluationRatingSchema,
  technical: EvaluationRatingSchema,
  overallImpression: EvaluationRatingSchema,
  positives: [{ type: String }],
  negatives: [{ type: String }],
  overallRecommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'neutral', 'do_not_hire'],
    default: 'hire'
  },
  finalComments: { type: String, default: '' },
  evaluatedBy: { type: String, default: '' },
  evaluatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

const ScorecardSchema = new mongoose.Schema({
  technical: { type: Number, min: 1, max: 5, default: 4 },
  problemSolving: { type: Number, min: 1, max: 5, default: 4 },
  communication: { type: Number, min: 1, max: 5, default: 4 },
  cultureFit: { type: Number, min: 1, max: 5, default: 4 },
  overallRecommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'neutral', 'do_not_hire'],
    default: 'hire'
  },
  evaluationNotes: { type: String, default: '' },
  evaluatedBy: { type: String, default: 'Interviewer' },
  evaluatedAt: { type: String, default: () => new Date().toISOString() },
  detailed: DetailedInterviewEvaluationSchema
}, { _id: false });

const EmployeeReferralSchema = new mongoose.Schema({
  employeeName: { type: String, default: '' },
  employeeId: { type: String, default: '' },
  designation: { type: String, default: '' },
  department: { type: String, default: '' },
  email: { type: String, default: '' },
  dateReferred: { type: String, default: '' },
  relation: { type: String, default: '' },
  bonusStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Paid', 'In Review'],
    default: 'In Review'
  },
  notes: { type: String, default: '' }
}, { _id: false });

const CallRecordHistorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  candidateId: { type: String, required: true },
  candidateName: { type: String, default: '' },
  candidatePhone: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  jobId: { type: String, default: '' },
  recruiterName: { type: String, default: 'Dr Sharmila Yadav' },
  callTime: { type: String, default: () => new Date().toISOString() },
  durationSeconds: { type: Number, default: 0 },
  disposition: { type: String, default: 'connected_interested' },
  notes: { type: String, default: '' },
  followUpDate: { type: String },
  followUpTime: { type: String },
  confirmedCurrentCtc: { type: String },
  confirmedExpectedCtc: { type: String },
  confirmedNoticePeriod: { type: String },
  isNegotiable: { type: String, enum: ['yes', 'no'] },
  reasonForLeaving: { type: String },
  confirmedLocation: { type: String },
  tentativeInterviewDate: { type: String },
  relocationPreference: { type: String },
  communicationRating: { type: Number },
  technicalFitRating: { type: Number },
  tags: [{ type: String }]
}, { _id: false });

const CandidateCallingDetailsSchema = new mongoose.Schema({
  totalCalls: { type: Number, default: 0 },
  lastCallTime: { type: String },
  lastDisposition: { type: String },
  lastCallNotes: { type: String, default: '' },
  nextFollowUpDate: { type: String },
  nextFollowUpTime: { type: String },
  callStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'connected', 'follow_up', 'on_hold', 'qualified', 'disqualified', 'unreachable'],
    default: 'pending'
  },
  confirmedCurrentSalary: { type: String },
  confirmedExpectedSalary: { type: String },
  confirmedNoticePeriod: { type: String },
  isNegotiable: { type: String, enum: ['yes', 'no'] },
  reasonForLeaving: { type: String },
  confirmedLocation: { type: String },
  tentativeInterviewDate: { type: String },
  callHistory: [CallRecordHistorySchema]
}, { _id: false });

const CandidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, default: 'India' },
  source: {
    type: String,
    enum: ['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon', 'internshala', 'referral', 'newspaper', 'other'],
    required: true,
    index: true
  },
  sourceId: { type: String },
  referralDetails: EmployeeReferralSchema,
  jobAppliedFor: { type: String, required: true },
  jobId: { type: String, required: true, index: true },
  department: { type: String, default: 'Engineering' },
  appliedDate: { type: String, default: () => new Date().toISOString() },
  lastUpdatedDate: { type: String, default: () => new Date().toISOString() },
  status: {
    type: String,
    enum: ['applied', 'screening', 'shortlisted', 'interview_r1', 'interview_r2', 'offered', 'joined', 'rejected'],
    default: 'applied',
    index: true
  },
  atsMatchScore: { type: Number, default: 85 },
  rating: { type: Number, min: 1, max: 5, default: 4 },
  experienceYears: { type: Number, default: 0 },
  currentCompany: { type: String, default: '' },
  currentDesignation: { type: String, default: '' },
  currentSalary: { type: String, default: '' },
  expectedSalary: { type: String, default: '' },
  noticePeriod: { type: String, default: '30 Days' },
  recruiterAssigned: { type: String, default: 'Dr Sharmila Yadav' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  profileUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  resumeData: { type: ResumeDataSchema, default: () => ({}) },
  scorecard: ScorecardSchema,
  callingDetails: CandidateCallingDetailsSchema,
  isCallingQueued: { type: Boolean, default: false },
  isSalaryNegotiable: { type: String, enum: ['yes', 'no'] },
  reasonForLeaving: { type: String },
  tentativeInterviewDate: { type: String },
  activityHistory: [ActivityLogSchema]
}, {
  timestamps: true,
  strict: false // Allow dynamic extra fields gracefully without silent loss
});

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
