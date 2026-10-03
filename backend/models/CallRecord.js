import mongoose from 'mongoose';

const CallRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  candidateId: { type: String, required: true, index: true },
  candidateName: { type: String, required: true },
  candidatePhone: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobId: { type: String, default: '' },
  recruiterName: { type: String, default: 'Dr Sharmila Yadav' },
  callTime: { type: String, default: () => new Date().toISOString() },
  durationSeconds: { type: Number, default: 0 },
  disposition: {
    type: String,
    enum: [
      'connected_interested',
      'connected_screening_passed',
      'connected_hold',
      'connected_callback_requested',
      'connected_not_interested',
      'connected_screening_failed',
      'ringing_no_answer',
      'busy',
      'switched_off',
      'wrong_number'
    ],
    default: 'connected_interested'
  },
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
  relocationPreference: {
    type: String,
    enum: ['Immediate Relocate', 'Prefers Remote', 'Current City Only', 'Open to Hybrid']
  },
  communicationRating: { type: Number, min: 0, max: 5, default: 0 },
  technicalFitRating: { type: Number, min: 0, max: 5, default: 0 },
  tags: [{ type: String }]
}, {
  timestamps: true,
  strict: false
});

export const CallRecord = mongoose.models.CallRecord || mongoose.model('CallRecord', CallRecordSchema);
