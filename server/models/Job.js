import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Full-time', 'Remote', 'Hybrid', 'Contract'],
    default: 'Full-time'
  },
  experienceRequired: { type: String, default: '3-5 Years' },
  salaryRange: { type: String, default: 'Competitive' },
  openPositions: { type: Number, default: 1 },
  postedDate: { type: String, default: () => new Date().toISOString() },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  platforms: [{ 
    type: String, 
    enum: ['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon', 'internshala', 'referral'] 
  }],
  applicantsCount: { type: Number, default: 0 },
  hiredCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
