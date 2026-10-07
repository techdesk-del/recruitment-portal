import { Router } from 'express';
import { Candidate } from '../models/Candidate.js';
import { Interview } from '../models/Interview.js';
import { ensureDBConnected } from '../config/database.js';
import { 
  sendInterviewInviteEmail, 
  sendCandidateStatusEmail, 
  sendRejectionEmail 
} from '../services/emailService.js';
import { 
  buildInterviewWhatsAppMessage, 
  buildStatusWhatsAppMessage, 
  buildRejectionWhatsAppMessage, 
  generateWhatsAppDeepLink, 
  sendWhatsAppAlert,
  generateInstantMeetingLink
} from '../services/whatsappService.js';

const router = Router();

// Helper to log communications to candidate activity history
async function logCandidateCommunication(candidateId, action, details, performedBy = 'Automated System') {
  try {
    await ensureDBConnected();
    const activityItem = {
      id: `act-${Date.now()}`,
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString(),
      type: 'communication'
    };

    await Candidate.findOneAndUpdate(
      { id: candidateId },
      { 
        $set: { lastUpdatedDate: new Date().toISOString() },
        $push: { activityHistory: { $each: [activityItem], $position: 0 } }
      }
    );
  } catch (err) {
    console.warn('Could not log candidate communication activity:', err.message);
  }
}

/**
 * POST /api/communications/email/interview
 * Dispatches interview invite with Google Meet and .ics calendar file
 */
router.post('/email/interview', async (req, res) => {
  try {
    const { candidateId, interviewId, candidate: rawCandidate, interview: rawInterview, customNotes } = req.body;
    await ensureDBConnected();

    let candidate = rawCandidate;
    if (!candidate && candidateId) {
      candidate = await Candidate.findOne({ id: candidateId }).lean();
    }

    let interview = rawInterview;
    if (!interview && interviewId) {
      interview = await Interview.findOne({ id: interviewId }).lean();
    }

    if (!candidate || !candidate.email) {
      return res.status(400).json({ error: 'Candidate with a valid email is required.' });
    }

    if (!interview) {
      interview = {
        id: `int-${Date.now().toString().slice(-6)}`,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone,
        jobTitle: candidate.jobAppliedFor || 'Open Position',
        round: 'Round 1: Screening & Technical',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        platform: 'google_meet',
        meetingLink: generateInstantMeetingLink(candidate.id),
        interviewerName: candidate.recruiterAssigned || 'Dr Sharmila Yadav'
      };
    } else if (!interview.meetingLink || interview.meetingLink.includes('urb-interview')) {
      interview.meetingLink = generateInstantMeetingLink(candidate.id);
    }

    // Persist interview in MongoDB if it has an id
    if (interview.id) {
      await Interview.findOneAndUpdate(
        { id: interview.id },
        { ...interview, candidateId: candidate.id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).catch((err) => console.warn('Could not persist interview in MongoDB:', err.message));
    }

    const emailResult = await sendInterviewInviteEmail({
      candidate,
      interview,
      customNotes
    });

    await logCandidateCommunication(
      candidate.id,
      'Email Sent: Interview Invitation',
      `Invitation for ${interview.round || 'Discussion'} dispatched with Google Meet & .ics calendar invite to ${candidate.email}`,
      interview.interviewerName || 'Talent Team'
    );

    res.json({
      success: true,
      message: `Interview invitation delivered to ${candidate.email}`,
      interview,
      ...emailResult
    });
  } catch (err) {
    console.error('Error in /email/interview:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch interview email.' });
  }
});

/**
 * POST /api/communications/email/status
 * Dispatches candidate status transition notification (e.g. Shortlisted, Offer)
 */
router.post('/email/status', async (req, res) => {
  try {
    const { candidateId, candidate: rawCandidate, status, details } = req.body;
    await ensureDBConnected();

    let candidate = rawCandidate;
    if (!candidate && candidateId) {
      candidate = await Candidate.findOne({ id: candidateId }).lean();
    }

    if (!candidate || !candidate.email) {
      return res.status(400).json({ error: 'Candidate with a valid email is required.' });
    }

    const emailResult = await sendCandidateStatusEmail({
      candidate,
      status: status || candidate.status,
      details
    });

    await logCandidateCommunication(
      candidate.id,
      `Email Sent: Status (${status.toUpperCase()})`,
      `Status update sent to ${candidate.email} (${status.toUpperCase()})`,
      'Talent Team'
    );

    res.json({
      success: true,
      message: `Status update email delivered to ${candidate.email}`,
      ...emailResult
    });
  } catch (err) {
    console.error('Error in /email/status:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch status email.' });
  }
});

/**
 * POST /api/communications/email/rejection
 * Dispatches polite rejection and priority talent pool retainment email
 */
router.post('/email/rejection', async (req, res) => {
  try {
    const { candidateId, candidate: rawCandidate, feedback } = req.body;
    await ensureDBConnected();

    let candidate = rawCandidate;
    if (!candidate && candidateId) {
      candidate = await Candidate.findOne({ id: candidateId }).lean();
    }

    if (!candidate || !candidate.email) {
      return res.status(400).json({ error: 'Candidate with a valid email is required.' });
    }

    const emailResult = await sendRejectionEmail({
      candidate,
      feedback
    });

    await logCandidateCommunication(
      candidate.id,
      'Email Sent: Application Feedback',
      `Feedback & Talent Network retainment email dispatched to ${candidate.email}`,
      'Talent Team'
    );

    res.json({
      success: true,
      message: `Application feedback delivered to ${candidate.email}`,
      ...emailResult
    });
  } catch (err) {
    console.error('Error in /email/rejection:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch rejection email.' });
  }
});

/**
 * POST /api/communications/whatsapp/interview
 * Generates WhatsApp notification for interview schedule
 */
router.post('/whatsapp/interview', async (req, res) => {
  try {
    const { candidateId, interviewId, candidate: rawCandidate, interview: rawInterview } = req.body;
    await ensureDBConnected();

    let candidate = rawCandidate;
    if (!candidate && candidateId) {
      candidate = await Candidate.findOne({ id: candidateId }).lean();
    }

    let interview = rawInterview;
    if (!interview && interviewId) {
      interview = await Interview.findOne({ id: interviewId }).lean();
    }

    if (!candidate || !candidate.phone) {
      return res.status(400).json({ error: 'Candidate phone number is required for WhatsApp alerts.' });
    }

    if (!interview) {
      interview = {
        id: `int-${Date.now().toString().slice(-6)}`,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone,
        jobTitle: candidate.jobAppliedFor || 'Open Position',
        round: 'Round 1: Screening & Technical',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        platform: 'google_meet',
        meetingLink: generateInstantMeetingLink(candidate.id),
        interviewerName: candidate.recruiterAssigned || 'Dr Sharmila Yadav'
      };
    } else if (!interview.meetingLink || interview.meetingLink.includes('urb-interview')) {
      interview.meetingLink = generateInstantMeetingLink(candidate.id);
    }

    // Persist interview in MongoDB if it has an id
    if (interview.id) {
      await Interview.findOneAndUpdate(
        { id: interview.id },
        { ...interview, candidateId: candidate.id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).catch((err) => console.warn('Could not persist interview in MongoDB:', err.message));
    }

    const message = buildInterviewWhatsAppMessage({
      candidateName: candidate.name,
      jobTitle: interview?.jobTitle || candidate.jobAppliedFor,
      round: interview?.round,
      date: interview?.date,
      startTime: interview?.startTime,
      endTime: interview?.endTime,
      meetingLink: interview?.meetingLink,
      interviewerName: interview?.interviewerName
    });

    const alertResult = await sendWhatsAppAlert({
      phone: candidate.phone,
      message,
      candidateId: candidate.id
    });

    await logCandidateCommunication(
      candidate.id,
      'WhatsApp Alert Generated: Interview',
      `WhatsApp interview invitation prepared for ${candidate.phone} (${interview?.round || 'Discussion'})`,
      interview?.interviewerName || 'Talent Team'
    );

    res.json({
      success: true,
      message: 'WhatsApp notification ready',
      interview,
      ...alertResult,
      rawText: message
    });
  } catch (err) {
    console.error('Error in /whatsapp/interview:', err);
    res.status(500).json({ error: err.message || 'Failed to generate WhatsApp alert.' });
  }
});

/**
 * POST /api/communications/whatsapp/status
 * Generates WhatsApp status notification
 */
router.post('/whatsapp/status', async (req, res) => {
  try {
    const { candidateId, candidate: rawCandidate, status, details } = req.body;
    await ensureDBConnected();

    let candidate = rawCandidate;
    if (!candidate && candidateId) {
      candidate = await Candidate.findOne({ id: candidateId }).lean();
    }

    if (!candidate || !candidate.phone) {
      return res.status(400).json({ error: 'Candidate phone number is required.' });
    }

    const message = status === 'rejected'
      ? buildRejectionWhatsAppMessage({ candidateName: candidate.name, jobTitle: candidate.jobAppliedFor })
      : buildStatusWhatsAppMessage({
          candidateName: candidate.name,
          jobTitle: candidate.jobAppliedFor,
          status: status || candidate.status,
          details
        });

    const alertResult = await sendWhatsAppAlert({
      phone: candidate.phone,
      message,
      candidateId: candidate.id
    });

    await logCandidateCommunication(
      candidate.id,
      `WhatsApp Alert: Status (${status.toUpperCase()})`,
      `WhatsApp status message generated for ${candidate.phone}`,
      'Talent Team'
    );

    res.json({
      success: true,
      message: 'WhatsApp alert ready',
      ...alertResult,
      rawText: message
    });
  } catch (err) {
    console.error('Error in /whatsapp/status:', err);
    res.status(500).json({ error: err.message || 'Failed to generate WhatsApp status alert.' });
  }
});

export default router;
