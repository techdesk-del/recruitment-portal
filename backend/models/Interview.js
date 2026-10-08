import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  candidateId: { type: String, required: true, index: true },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  candidatePhone: { type: String, default: '' },
  candidateLocation: { type: String, default: '' },
  candidateAvatar: { type: String },
  jobTitle: { type: String, required: true },
  jobId: { type: String, required: true },
  department: { type: String, default: 'Engineering' },
  round: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, default: 60 },
  interviewerName: { type: String, required: true },
  interviewerRole: { type: String, default: 'Engineering Lead' },
  interviewerEmail: { type: String, required: true },
  platform: { 
    type: String, 
    enum: ['zoom', 'google_meet', 'teams', 'onsite', 'phone'],
    default: 'zoom' 
  },
  meetingLink: { type: String, default: '' },
  meetingId: { type: String, default: '' },
  meetingPasscode: { type: String, default: '' },
  location: { type: String, default: '' },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'rescheduled', 'cancelled'],
    default: 'scheduled'
  },
  feedbackStatus: {
    type: String,
    enum: ['pending', 'submitted'],
    default: 'pending'
  },
  notes: { type: String, default: '' },
  atsMatchScore: { type: Number, default: 85 },
  tags: [{ type: String }],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true,
  strict: false
});

export const Interview = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
