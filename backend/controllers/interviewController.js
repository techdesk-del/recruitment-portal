import { Interview } from '../models/Interview.js';
import { Candidate } from '../models/Candidate.js';
import { ensureDBConnected, getMongoConnectionStatus } from '../config/database.js';
import { broadcastInterviewCreated, broadcastInterviewUpdated, broadcastInterviewDeleted } from '../sockets/socketHandler.js';
import { sendInterviewInviteEmail } from '../services/emailService.js';
import { buildInterviewWhatsAppMessage, sendWhatsAppAlert } from '../services/whatsappService.js';

export async function getInterviews(req, res) {
  try {
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const interviews = await Interview.find().sort({ date: -1, startTime: -1 });
      return res.json(interviews);
    }
  } catch (err) {
    console.error('Error fetching interviews from MongoDB:', err);
  }
  res.json([]);
}

export async function createInterview(req, res) {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `int-${Date.now().toString().slice(-6)}`;
    }
    const isConnected = await ensureDBConnected();
    if (isConnected) {
      const saved = await Interview.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Log activity on the candidate in MongoDB
      const activityItem = {
        id: `act-${Date.now()}`,
        action: `Interview Scheduled: ${data.round}`,
        details: `${data.date} at ${data.startTime} with ${data.interviewerName} (${data.platform})`,
        performedBy: data.interviewerName || 'Lead Recruiter',
        timestamp: new Date().toISOString(),
        type: 'interview'
      };

      const candDoc = await Candidate.findOneAndUpdate(
        { id: data.candidateId },
        { 
          $set: { status: 'interview_r1', lastUpdatedDate: new Date().toISOString() },
          $push: { activityHistory: { $each: [activityItem], $position: 0 } }
        },
        { new: true }
      ).catch(() => null);

      // Non-blocking Automated Communications (Email & Calendar Invite & WhatsApp)
      (async () => {
        try {
          const candidateData = candDoc || {
            id: data.candidateId,
            name: data.candidateName,
            email: data.candidateEmail,
            phone: data.candidatePhone,
            jobAppliedFor: data.jobTitle
          };

          if (candidateData.email) {
            await sendInterviewInviteEmail({
              candidate: candidateData,
              interview: saved || data,
              customNotes: data.notes || ''
            });
            console.log(`📧 [Auto-Comm] Automated interview invitation delivered to ${candidateData.email}`);
          }

          if (candidateData.phone) {
            const msg = buildInterviewWhatsAppMessage({
              candidateName: candidateData.name,
              jobTitle: data.jobTitle || candidateData.jobAppliedFor,
              round: data.round,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              meetingLink: data.meetingLink,
              interviewerName: data.interviewerName
            });
            await sendWhatsAppAlert({
              phone: candidateData.phone,
              message: msg,
              candidateId: candidateData.id
            });
          }
        } catch (commErr) {
          console.warn('⚠️ [Auto-Comm] Non-fatal notification delivery warning:', commErr.message);
        }
      })();

      broadcastInterviewCreated(saved);
      return res.status(201).json(saved);
    }
    broadcastInterviewCreated(data);
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating interview in MongoDB:', err);
    res.status(500).json({ error: 'Failed to create interview' });
  }
}

export async function updateInterview(req, res) {
  const { id } = req.params;
  const updates = req.body;
  try {
    if (getMongoConnectionStatus()) {
      const updated = await Interview.findOneAndUpdate(
        { id },
        { $set: { ...updates, updatedAt: new Date().toISOString() } },
        { new: true }
      );
      broadcastInterviewUpdated(updated || { id, ...updates });
      return res.json({ success: true, interview: updated });
    }
    broadcastInterviewUpdated({ id, ...updates });
    res.json({ success: true, id, updates });
  } catch (err) {
    console.error('Error updating interview in MongoDB:', err);
    res.status(500).json({ error: 'Failed to update interview' });
  }
}

export async function deleteInterview(req, res) {
  const { id } = req.params;
  try {
    if (getMongoConnectionStatus()) {
      await Interview.findOneAndDelete({ id });
    }
    broadcastInterviewDeleted(id);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting interview in MongoDB:', err);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
}
