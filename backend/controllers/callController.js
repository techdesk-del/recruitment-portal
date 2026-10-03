import { CallRecord } from '../models/CallRecord.js';
import { Candidate } from '../models/Candidate.js';
import { getMongoConnectionStatus } from '../config/database.js';

export async function getCalls(req, res) {
  try {
    if (getMongoConnectionStatus()) {
      const calls = await CallRecord.find().sort({ callTime: -1 });
      return res.json(calls);
    }
  } catch (err) {
    console.error('Error fetching call records from MongoDB:', err);
  }
  res.json([]);
}

export async function createCall(req, res) {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `call-${Date.now().toString().slice(-6)}`;
    }
    if (!data.callTime) {
      data.callTime = new Date().toISOString();
    }

    if (getMongoConnectionStatus()) {
      const saved = await CallRecord.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Map call disposition to overall calling status
      let callStatus = 'connected';
      if (['connected_interested', 'connected_screening_passed'].includes(data.disposition)) {
        callStatus = 'qualified';
      } else if (data.disposition === 'connected_callback_requested' || data.followUpDate) {
        callStatus = 'follow_up';
      } else if (['ringing_no_answer', 'busy', 'switched_off'].includes(data.disposition)) {
        callStatus = 'unreachable';
      } else if (['connected_screening_failed', 'connected_not_interested'].includes(data.disposition)) {
        callStatus = 'disqualified';
      }

      const activityItem = {
        id: `act-${Date.now()}`,
        action: `Telephonic Screening: ${data.disposition.replace(/_/g, ' ').toUpperCase()}`,
        details: `Duration: ${Math.floor(data.durationSeconds / 60)}m ${data.durationSeconds % 60}s. Notes: ${data.notes || 'Screening logged.'}`,
        performedBy: data.recruiterName || 'Priya Sharma',
        timestamp: new Date().toISOString(),
        type: 'call'
      };

      // Sync candidate calling details and activity history in MongoDB
      await Candidate.findOneAndUpdate(
        { id: data.candidateId },
        {
          $inc: { 'callingDetails.totalCalls': 1 },
          $set: {
            'callingDetails.lastCallTime': data.callTime,
            'callingDetails.lastDisposition': data.disposition,
            'callingDetails.lastCallNotes': data.notes,
            'callingDetails.callStatus': callStatus,
            'callingDetails.nextFollowUpDate': data.followUpDate || '',
            'callingDetails.nextFollowUpTime': data.followUpTime || '',
            'callingDetails.confirmedCurrentSalary': data.confirmedCurrentCtc || '',
            'callingDetails.confirmedExpectedSalary': data.confirmedExpectedCtc || '',
            'callingDetails.confirmedNoticePeriod': data.confirmedNoticePeriod || '',
            'callingDetails.confirmedLocation': data.confirmedLocation || '',
            'callingDetails.isNegotiable': data.isNegotiable || 'yes',
            'callingDetails.reasonForLeaving': data.reasonForLeaving || '',
            'callingDetails.tentativeInterviewDate': data.tentativeInterviewDate || '',
            isCallingQueued: false,
            lastUpdatedDate: new Date().toISOString(),
            ...(data.promoteToInterview && { status: 'shortlisted' })
          },
          $push: {
            'callingDetails.callHistory': { $each: [data], $position: 0 },
            activityHistory: { $each: [activityItem], $position: 0 }
          }
        }
      ).catch((err) => console.warn('Candidate sync after call warning:', err.message));

      return res.status(201).json(saved);
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('Error logging call record in MongoDB:', err);
    res.status(500).json({ error: 'Failed to log call record' });
  }
}

export async function deleteCall(req, res) {
  const { id } = req.params;
  try {
    if (getMongoConnectionStatus()) {
      await CallRecord.findOneAndDelete({ id });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting call record in MongoDB:', err);
    res.status(500).json({ error: 'Failed to delete call record' });
  }
}
