import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  performedBy: { type: String, default: 'System' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  type: {
    type: String,
    enum: ['status', 'note', 'scorecard', 'interview', 'ingestion'],
    default: 'status'
  }
  //
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
  evaluatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

const CandidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, default: 'India' },
  source: {
    type: String,
    enum: ['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon', 'internshala', 'referral'],
    required: true,
    index: true
  },
  sourceId: { type: String },
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
  recruiterAssigned: { type: String, default: '' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  profileUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  resumeData: { type: ResumeDataSchema, default: () => ({}) },
  scorecard: { type: ScorecardSchema },
  activityHistory: [ActivityLogSchema]
}, {
  timestamps: true
});

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
