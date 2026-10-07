import React, { useState, useMemo, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Clock, 
  Sparkles,
  Phone,
  AlertCircle,
  Video,
  RefreshCw,
  Check,
  Link2,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Candidate, InterviewSchedule, InterviewRoundType, InterviewPlatform } from '../../types';
import { communicationApi } from '../../services/api';
import { useRecruitment } from '../../context/RecruitmentContext';

interface CandidateCommunicationsTabProps {
  candidate: Candidate;
  scheduledInterviews: InterviewSchedule[];
}

// Helper: Generates instant free Jitsi video call room (100% reliable, zero login)
export function generateJitsiLink(candId: string, candName: string = ''): string {
  const cleanId = (candId || 'candidate').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanName = (candName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10);
  const salt = Math.random().toString(36).slice(2, 6);
  return `https://meet.jit.si/urbangaon-${cleanId}${cleanName ? `-${cleanName}` : ''}-${salt}`;
}

// Helper: Calculate Tomorrow's date in YYYY-MM-DD
function getTomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// Helper: Format Google Calendar 1-Click Link
function generateGoogleCalendarUrl({
  title,
  description,
  location,
  date,
  startTime,
  endTime
}: {
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}): string {
  const parseTime = (t: string) => {
    const clean = (t || '10:00 AM').trim();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const meridiem = (match[3] || '').toUpperCase();
      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;
      return { h, m };
    }
    return { h: 10, m: 0 };
  };

  try {
    let year = 2026, month = 10, day = 8;
    if (date && date.includes('-')) {
      const parts = date.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        [year, month, day] = parts;
      }
    }
    const startT = parseTime(startTime);
    const endT = parseTime(endTime);
    const dStart = new Date(year, month - 1, day, startT.h, startT.m, 0);
    const dEnd = new Date(year, month - 1, day, endT.h, endT.m, 0);
    const dtStartStr = dStart.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEndStr = dEnd.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${dtStartStr}/${dtEndStr}`,
      details: description,
      location: location
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch {
    return 'https://calendar.google.com';
  }
}

// Normalize phone number for WhatsApp
function normalizePhone(raw?: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export const CandidateCommunicationsTab: React.FC<CandidateCommunicationsTabProps> = ({
  candidate,
  scheduledInterviews
}) => {
  const { showToast, updateCandidateDetails, scheduleInterview } = useRecruitment();

  // Selected existing interview or "new"
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(
    scheduledInterviews[0]?.id || 'new_custom'
  );

  // Email form state
  const [emailType, setEmailType] = useState<'interview' | 'status' | 'rejection'>('interview');
  const [emailNotes, setEmailNotes] = useState<string>('');
  const [emailStatusTarget, setEmailStatusTarget] = useState<string>('shortlisted');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentResult, setEmailSentResult] = useState<{
    message: string;
    previewUrl?: string;
    subject?: string;
  } | null>(null);

  // WhatsApp form state
  const [whatsappTemplate, setWhatsappTemplate] = useState<'interview' | 'status' | 'rejection'>('interview');
  const [isGeneratingWhatsApp, setIsGeneratingWhatsApp] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- Real-time Editable Interview Configuration ---
  const existingInterview = scheduledInterviews.find((i) => i.id === selectedInterviewId);

  const [interviewRound, setInterviewRound] = useState<InterviewRoundType>(
    existingInterview?.round || 'Round 1: Screening / Technical'
  );
  const [interviewDate, setInterviewDate] = useState<string>(
    existingInterview?.date || getTomorrowDateStr()
  );
  const [interviewTime, setInterviewTime] = useState<string>(
    existingInterview?.startTime || '10:30 AM'
  );
  const [interviewEndTime, setInterviewEndTime] = useState<string>(
    existingInterview?.endTime || '11:30 AM'
  );
  const [interviewPlatform, setInterviewPlatform] = useState<InterviewPlatform>(
    existingInterview?.platform || 'google_meet'
  );
  const getInitialMeetLink = () => {
    if (existingInterview?.meetingLink && !existingInterview.meetingLink.includes('urb-interview')) {
      return existingInterview.meetingLink;
    }
    try {
      const saved = localStorage.getItem('urbangaon_default_meet_link');
      if (saved && saved.startsWith('http')) return saved;
    } catch {}
    return generateJitsiLink(candidate.id, candidate.name);
  };

  const [interviewMeetingLink, setInterviewMeetingLink] = useState<string>(getInitialMeetLink());
  const [interviewerName, setInterviewerName] = useState<string>(
    existingInterview?.interviewerName || candidate.recruiterAssigned || 'Dr Sharmila Yadav'
  );

  // Sync state if selectedInterviewId changes
  useEffect(() => {
    if (selectedInterviewId === 'new_custom' || !existingInterview) {
      if (!interviewMeetingLink || interviewMeetingLink.includes('urb-interview')) {
        setInterviewMeetingLink(getInitialMeetLink());
      }
    } else {
      setInterviewRound(existingInterview.round || 'Round 1: Screening / Technical');
      setInterviewDate(existingInterview.date || getTomorrowDateStr());
      setInterviewTime(existingInterview.startTime || '10:30 AM');
      setInterviewEndTime(existingInterview.endTime || '11:30 AM');
      setInterviewPlatform(existingInterview.platform || 'google_meet');
      setInterviewMeetingLink(
        existingInterview.meetingLink && !existingInterview.meetingLink.includes('urb-interview')
          ? existingInterview.meetingLink
          : getInitialMeetLink()
      );
      setInterviewerName(existingInterview.interviewerName || candidate.recruiterAssigned || 'Dr Sharmila Yadav');
    }
  }, [selectedInterviewId]);

  // Compute active real-time interview object
  const activeInterview: InterviewSchedule = useMemo(() => {
    return {
      id: existingInterview?.id || `int-${Date.now().toString().slice(-6)}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      candidateLocation: candidate.location,
      jobTitle: candidate.jobAppliedFor || 'Open Position',
      jobId: candidate.jobId || 'job-general',
      department: candidate.department || 'General',
      round: interviewRound,
      date: interviewDate,
      startTime: interviewTime,
      endTime: interviewEndTime,
      durationMinutes: 60,
      interviewerName: interviewerName,
      interviewerRole: 'Lead Technical Recruiter',
      interviewerEmail: 'careers@urbangaon.com',
      platform: interviewPlatform,
      meetingLink: interviewMeetingLink,
      meetingId: interviewMeetingLink.replace('https://meet.google.com/', ''),
      status: 'scheduled',
      feedbackStatus: 'pending',
      notes: emailNotes || 'Scheduled via Real-Time Outreach Gateway',
      createdAt: existingInterview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [
    candidate,
    existingInterview,
    interviewRound,
    interviewDate,
    interviewTime,
    interviewEndTime,
    interviewPlatform,
    interviewMeetingLink,
    interviewerName,
    emailNotes
  ]);

  // Real-time Google Calendar 1-Click Link
  const googleCalendarLink = useMemo(() => {
    return generateGoogleCalendarUrl({
      title: `UrbanGaon Interview: ${interviewRound} - ${candidate.name}`,
      description: `Interview for ${candidate.jobAppliedFor} with ${interviewerName}.\nMeeting Link: ${interviewMeetingLink}\nCandidate Contact: ${candidate.phone || candidate.email}`,
      location: interviewMeetingLink,
      date: interviewDate,
      startTime: interviewTime,
      endTime: interviewEndTime
    });
  }, [candidate, interviewRound, interviewerName, interviewMeetingLink, interviewDate, interviewTime, interviewEndTime]);

  // Real-time live WhatsApp message text
  const liveWhatsAppText = useMemo(() => {
    if (whatsappTemplate === 'interview') {
      return [
        `🏡 *URBANGAON CAREERS* - Interview Invitation`,
        ``,
        `Dear *${candidate.name}*,`,
        `Greetings from UrbanGaon! Your interview for *${candidate.jobAppliedFor}* has been confirmed.`,
        ``,
        `📋 *Round*: ${interviewRound}`,
        `📅 *Date*: ${interviewDate}`,
        `⏰ *Time*: ${interviewTime} - ${interviewEndTime} (IST)`,
        `👨‍💼 *Interviewer*: ${interviewerName}`,
        `🔗 *Join Meeting*: ${interviewMeetingLink}`,
        `📅 *Add to Google Calendar*: ${googleCalendarLink}`,
        ``,
        emailNotes ? `📝 *Recruiter Note*: ${emailNotes}\n` : '',
        `Please ensure you join in a quiet environment with high-speed internet and working audio/video.`,
        ``,
        `Best regards,`,
        `*UrbanGaon Talent Acquisition Team*`
      ].filter(Boolean).join('\n');
    } else if (whatsappTemplate === 'status') {
      return [
        `🏡 *URBANGAON CAREERS* - Application Update`,
        ``,
        `Dear *${candidate.name}*,`,
        `🎉 Your application for *${candidate.jobAppliedFor}* has transitioned to: *${emailStatusTarget.toUpperCase()}*.`,
        emailNotes ? `\n📝 *Note*: ${emailNotes}` : '',
        ``,
        `Our recruitment panel will be in touch with subsequent schedule details shortly.`,
        ``,
        `Best regards,`,
        `*UrbanGaon Talent Team*`
      ].join('\n');
    } else {
      return [
        `🏡 *URBANGAON CAREERS* - Application Update`,
        ``,
        `Dear *${candidate.name}*,`,
        `Thank you for taking the time to discuss the *${candidate.jobAppliedFor}* role with UrbanGaon.`,
        ``,
        `While we have decided to advance with another profile for this vacancy, we were genuinely impressed with your credentials. Your profile is retained in our *Priority Talent Pool* for upcoming openings.`,
        ``,
        `We wish you great success ahead!`,
        ``,
        `Warm regards,`,
        `*UrbanGaon Talent Team*`
      ].join('\n');
    }
  }, [
    whatsappTemplate,
    candidate,
    interviewRound,
    interviewDate,
    interviewTime,
    interviewEndTime,
    interviewerName,
    interviewMeetingLink,
    googleCalendarLink,
    emailNotes,
    emailStatusTarget
  ]);

  // Clean phone number for links
  const cleanPhone = normalizePhone(candidate.phone);
  const waWebLink = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(liveWhatsAppText)}`;
  const waUniversalLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(liveWhatsAppText)}`;

  // Handler: Copy text with instant visual feedback
  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    showToast('success', 'Copied to Clipboard', `${label} copied successfully!`);
  };

  // Helper: Ensure interview is recorded in state/MongoDB
  const ensureInterviewScheduled = () => {
    if (!existingInterview) {
      try {
        scheduleInterview({
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          candidateLocation: candidate.location,
          jobTitle: candidate.jobAppliedFor || 'Open Position',
          jobId: candidate.jobId || 'job-general',
          department: candidate.department || 'General',
          round: interviewRound,
          date: interviewDate,
          startTime: interviewTime,
          endTime: interviewEndTime,
          durationMinutes: 60,
          interviewerName: interviewerName,
          interviewerRole: 'Lead Technical Recruiter',
          interviewerEmail: 'careers@urbangaon.com',
          platform: interviewPlatform,
          meetingLink: interviewMeetingLink,
          status: 'scheduled',
          feedbackStatus: 'pending',
          notes: emailNotes || 'Scheduled via Real-Time Outreach Gateway'
        });
      } catch (err) {
        console.warn('Non-fatal context schedule warning:', err);
      }
    }
  };

  // 1. Send Email Handler
  const handleSendEmail = async () => {
    if (!candidate.email) {
      showToast('error', 'Missing Email', 'This candidate does not have a registered email address.');
      return;
    }

    setIsSendingEmail(true);
    setEmailSentResult(null);

    try {
      let res;
      if (emailType === 'interview') {
        // Save interview record in context & MongoDB if not already created
        ensureInterviewScheduled();

        res = await communicationApi.sendInterviewEmail({
          candidateId: candidate.id,
          candidate,
          interview: activeInterview,
          customNotes: emailNotes
        });
      } else if (emailType === 'status') {
        res = await communicationApi.sendStatusEmail({
          candidateId: candidate.id,
          candidate,
          status: emailStatusTarget,
          details: emailNotes
        });
      } else {
        res = await communicationApi.sendRejectionEmail({
          candidateId: candidate.id,
          candidate,
          feedback: emailNotes
        });
      }

      setEmailSentResult({
        message: res.message,
        previewUrl: res.previewUrl,
        subject: res.subject
      });

      // Update candidate activity history
      const newActivity = {
        id: `act-${Date.now()}`,
        action: `Email Sent: ${emailType.toUpperCase()}`,
        details: `${res.message} (${res.subject || ''}) | Meeting: ${interviewMeetingLink}`,
        performedBy: interviewerName || 'Talent Team',
        timestamp: new Date().toISOString(),
        type: 'communication' as const
      };
      await updateCandidateDetails(candidate.id, {
        activityHistory: [newActivity, ...(candidate.activityHistory || [])]
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      showToast('success', 'Email Dispatched', res.message);
    } catch (err: any) {
      showToast('error', 'Delivery Error', err.message || 'Failed to dispatch email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 2. WhatsApp Dispatch Handler
  const handleLaunchWhatsApp = (mode: 'web' | 'app') => {
    if (!candidate.phone) {
      showToast('error', 'Missing Phone Number', 'This candidate does not have a registered phone number.');
      return;
    }

    if (whatsappTemplate === 'interview') {
      ensureInterviewScheduled();
    }

    const targetUrl = mode === 'web' ? waWebLink : waUniversalLink;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Update candidate activity
    const newActivity = {
      id: `act-${Date.now()}`,
      action: `WhatsApp Dispatched: ${whatsappTemplate.toUpperCase()}`,
      details: `Dispatched to ${candidate.phone} with link: ${interviewMeetingLink}`,
      performedBy: interviewerName || 'Talent Team',
      timestamp: new Date().toISOString(),
      type: 'communication' as const
    };
    updateCandidateDetails(candidate.id, {
      activityHistory: [newActivity, ...(candidate.activityHistory || [])]
    }).catch(() => {});

    showToast(
      'success',
      mode === 'web' ? 'WhatsApp Web Launched' : 'WhatsApp App Opened',
      `Conversation opened for ${candidate.name} with real-time meeting invite.`
    );
  };

  // Filter communications from activity history
  const commHistory = (candidate.activityHistory || []).filter(
    (a) => a.type === 'communication' || a.action.includes('Email') || a.action.includes('WhatsApp')
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real-time Outreach Hub */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-Time Outreach Gateway
            </span>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Live Video & Calendar Sync
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-2 flex items-center gap-2">
            Candidate Outreach: {candidate.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: <span className="font-bold text-slate-800">{candidate.jobAppliedFor}</span> • Assigned Recruiter: <span className="font-bold text-blue-700">{interviewerName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs">
            <Mail size={14} className="text-blue-600" />
            <span className="font-bold">{candidate.email || 'No email provided'}</span>
            {candidate.email && (
              <button
                type="button"
                onClick={() => handleCopy(candidate.email, 'email', 'Email')}
                className="hover:text-blue-600 ml-1 cursor-pointer transition text-slate-400 hover:text-slate-700"
                title="Copy email"
              >
                {copiedKey === 'email' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 shadow-2xs">
            <Phone size={14} className="text-emerald-600" />
            <span className="font-bold">{candidate.phone || 'No phone provided'}</span>
            {candidate.phone && (
              <button
                type="button"
                onClick={() => handleCopy(candidate.phone, 'phone', 'Phone number')}
                className="hover:text-emerald-700 ml-1 cursor-pointer transition text-emerald-600"
                title="Copy phone"
              >
                {copiedKey === 'phone' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Live Interview Configuration Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Real-Time Interview Schedule & Meeting Link Engine
              </h4>
              <p className="text-[11px] text-slate-500">
                Instant live link generation with automatic Google Calendar .ics synchronization
              </p>
            </div>
          </div>

          {scheduledInterviews.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Linked Interview:</span>
              <select
                value={selectedInterviewId}
                onChange={(e) => setSelectedInterviewId(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              >
                {scheduledInterviews.map((int) => (
                  <option key={int.id} value={int.id}>
                    {int.round} • {int.date} at {int.startTime}
                  </option>
                ))}
                <option value="new_custom">➕ Set Up New / Custom Slot</option>
              </select>
            </div>
          )}
        </div>

        {/* Live Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Round Selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-[11px]">Interview Round:</label>
            <select
              value={interviewRound}
              onChange={(e) => setInterviewRound(e.target.value as InterviewRoundType)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:border-blue-500 outline-none"
            >
              <option value="Round 1: Screening / Technical">Round 1: Screening / Technical</option>
              <option value="Round 2: System Design & Coding">Round 2: Technical & Domain</option>
              <option value="Round 2: Leadership / Final Evaluation">Round 2: Managerial Discussion</option>
              <option value="Round 3: HR & Culture Fit">Round 3: HR & Culture Fit</option>
              <option value="Round 4: CEO / Leadership Round">Round 4: CEO / Leadership Round</option>
            </select>
          </div>

          {/* Date Picker + Quick Presets */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block text-[11px]">Interview Date:</label>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setInterviewDate(new Date().toISOString().split('T')[0])}
                  className="text-blue-600 hover:underline cursor-pointer font-semibold"
                >
                  Today
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setInterviewDate(getTomorrowDateStr())}
                  className="text-blue-600 hover:underline cursor-pointer font-semibold"
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:border-blue-500 outline-none"
            />
          </div>

          {/* Start Time & Duration */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-[11px]">Time Slot (IST):</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:border-blue-500 outline-none text-center"
              />
              <input
                type="text"
                value={interviewEndTime}
                onChange={(e) => setInterviewEndTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:border-blue-500 outline-none text-center"
              />
            </div>
          </div>

          {/* Interviewer */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-[11px]">Interviewer Assigned:</label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="Dr Sharmila Yadav"
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:border-blue-500 outline-none"
            />
          </div>

        </div>

        {/* Live Meeting Link Generation Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Video size={15} className="text-blue-600" />
              <span className="font-bold text-slate-800 text-xs">Live Video Meeting Room Link:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                interviewMeetingLink.includes('meet.jit.si') 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : interviewMeetingLink.includes('meet.google.com')
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                {interviewMeetingLink.includes('meet.jit.si') 
                  ? '⚡ Instant Room (100% Guaranteed Live)' 
                  : interviewMeetingLink.includes('meet.google.com')
                  ? '📹 Google Meet'
                  : '🔗 Custom Video Link'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const jitsiLink = generateJitsiLink(candidate.id, candidate.name);
                  setInterviewMeetingLink(jitsiLink);
                  showToast('success', 'Instant Video Room Ready', 'Live zero-login video room activated.');
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shadow-2xs ${
                  interviewMeetingLink.includes('meet.jit.si')
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700'
                }`}
                title="Instant room: Never expires, zero login required for candidate or interviewer"
              >
                <Sparkles size={11} />
                <span>Instant Video Room (Zero Login)</span>
              </button>

              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-bold text-[11px] shadow-2xs cursor-pointer transition active:scale-95"
                title="Opens Google Meet to generate an official verified room under your Google account"
              >
                <ExternalLink size={11} />
                <span>Create on Google Meet (meet.new)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (interviewMeetingLink && interviewMeetingLink.startsWith('http')) {
                    localStorage.setItem('urbangaon_default_meet_link', interviewMeetingLink);
                    showToast('success', 'Default Link Saved', 'This meeting link will be auto-used for upcoming candidate invites.');
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] shadow-2xs cursor-pointer transition"
                title="Save this link as your default meeting URL for future candidate invites"
              >
                <span>Save as Default</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={interviewMeetingLink}
                onChange={(e) => setInterviewMeetingLink(e.target.value)}
                placeholder="https://meet.jit.si/... or https://meet.google.com/..."
                className="w-full text-xs font-mono font-bold py-2 pl-3 pr-24 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                Active URL
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(interviewMeetingLink, 'meet_link', 'Meeting Link')}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition"
              title="Copy meeting link"
            >
              {copiedKey === 'meet_link' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>Copy</span>
            </button>

            <a
              href={interviewMeetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
              title="Test open meeting room in new tab"
            >
              <ExternalLink size={13} />
              <span>Test Room</span>
            </a>

            <a
              href={googleCalendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
              title="Open Google Calendar to add this event directly"
            >
              <CalendarDays size={13} />
              <span>Calendar</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5">
            <span className="font-bold text-slate-700">💡 Tip:</span>
            <span>
              {interviewMeetingLink.includes('meet.jit.si')
                ? 'Instant Video Room works 100% on all mobile devices and laptops without login or Google accounts.'
                : 'Google Meet requires a real room created under a Google account. Click "Create on Google Meet (meet.new)" above to initialize one in 1 click.'}
            </span>
          </p>
        </div>

      </div>

      {/* Two Column Layout: Email Dispatcher & WhatsApp Direct Outreach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHANNEL 1: TRANSACTIONAL EMAIL PIPELINE */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mail size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Transactional Email Pipeline
                </h4>
                <p className="text-[11px] text-slate-500">
                  Branded UrbanGaon HTML email with Google Meet & .ics calendar file
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Zero-AWS / Active
            </span>
          </div>

          {/* Email Type Selection */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setEmailType('interview')}
              className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                emailType === 'interview' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Invite
            </button>
            <button
              type="button"
              onClick={() => setEmailType('status')}
              className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                emailType === 'status' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status Update
            </button>
            <button
              type="button"
              onClick={() => setEmailType('rejection')}
              className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                emailType === 'rejection' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejection / Pool
            </button>
          </div>

          {/* Dynamic Configuration Summary based on Email Type */}
          {emailType === 'interview' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Position & Round:</span>
                <span className="font-bold text-slate-800">{interviewRound}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Scheduled Timing:</span>
                <span className="font-bold text-slate-800">📅 {interviewDate} • ⏰ {interviewTime} - {interviewEndTime}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Google Meet Link:</span>
                <a
                  href={interviewMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>{interviewMeetingLink.slice(0, 32)}...</span>
                  <ExternalLink size={10} />
                </a>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Calendar Attachment:</span>
                <span className="font-bold text-emerald-700">✓ .ics File + 1-Click Google Calendar</span>
              </div>
            </div>
          )}

          {emailType === 'status' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Target Pipeline Stage:
              </label>
              <select
                value={emailStatusTarget}
                onChange={(e) => setEmailStatusTarget(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-bold text-slate-800"
              >
                <option value="shortlisted">Shortlisted (Congratulations & Next Steps)</option>
                <option value="screening">Screening Stage</option>
                <option value="interview_r1">Interview Round 1</option>
                <option value="interview_r2">Interview Round 2</option>
                <option value="offered">Formal Offer Extended</option>
                <option value="joined">Welcome to UrbanGaon</option>
              </select>
            </div>
          )}

          {emailType === 'rejection' && (
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1.5 text-xs text-rose-900">
              <p className="font-bold">Polite Rejection & Priority Talent Pool Retention</p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Sends a respectful, encouraging email acknowledging their time, providing constructive closure, and retaining their resume in the active candidate pool.
              </p>
            </div>
          )}

          {/* Optional Recruiter Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Custom Recruiter Notes / Instructions (Optional):
            </label>
            <textarea
              rows={2}
              value={emailNotes}
              onChange={(e) => setEmailNotes(e.target.value)}
              placeholder="e.g. Please bring an identity card or prepare a 5-minute project overview..."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          {/* Send Email Action Button */}
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSendingEmail || !candidate.email}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <Send size={13} className={isSendingEmail ? 'animate-spin' : ''} />
            <span>
              {isSendingEmail
                ? 'Dispatching Email with Real-Time Meet Link...'
                : `Send ${emailType === 'interview' ? 'Interview Invite (.ics + Meet)' : emailType === 'status' ? 'Status Update' : 'Rejection & Talent Pool'} Email`}
            </span>
          </button>

          {/* Delivery Result Confirmation */}
          {emailSentResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Email Successfully Delivered</span>
              </div>
              <p className="text-[11px] text-emerald-700">{emailSentResult.message}</p>
              {emailSentResult.previewUrl && (
                <a
                  href={emailSentResult.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-700 underline font-bold inline-flex items-center gap-1 mt-1"
                >
                  <span>View Delivered HTML Email Preview</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* CHANNEL 2: WHATSAPP STATUS ALERTS & DIRECT OUTREACH */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. WhatsApp Status Alerts
                </h4>
                <p className="text-[11px] text-slate-500">
                  Instant real-time click-to-chat & direct outreach
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Free / Instant
            </span>
          </div>

          {/* WhatsApp Template Switcher */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setWhatsappTemplate('interview')}
              className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                whatsappTemplate === 'interview' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interview Alert
            </button>
            <button
              type="button"
              onClick={() => setWhatsappTemplate('status')}
              className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                whatsappTemplate === 'status' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status Alert
            </button>
            <button
              type="button"
              onClick={() => setWhatsappTemplate('rejection')}
              className={`py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                whatsappTemplate === 'rejection' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Talent Pool
            </button>
          </div>

          {/* Live Message Preview Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-emerald-950 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Real-Time Message Preview:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(liveWhatsAppText, 'wa_text', 'WhatsApp message text')}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs"
              >
                {copiedKey === 'wa_text' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>Copy Full Message</span>
              </button>
            </div>
            
            <div className="p-3 rounded-xl bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed shadow-inner">
              {liveWhatsAppText}
            </div>
          </div>

          {/* WhatsApp Direct Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleLaunchWhatsApp('web')}
              disabled={!candidate.phone}
              className="flex-1 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              title="Directly opens WhatsApp Web with the conversation pre-filled"
            >
              <MessageSquare size={14} />
              <span>Launch WhatsApp Web</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunchWhatsApp('app')}
              disabled={!candidate.phone}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
              title="Open native WhatsApp App on mobile or desktop"
            >
              <span>Open in App</span>
            </button>
          </div>

          {/* Direct Quick Link Copy Bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <span>Direct WhatsApp Click-to-Chat Link:</span>
              <button
                type="button"
                onClick={() => handleCopy(waWebLink, 'deep_link', 'Direct WhatsApp link')}
                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'deep_link' ? <Check size={11} /> : <Copy size={11} />}
                <span>Copy Link</span>
              </button>
            </div>
            <a
              href={waWebLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-mono font-semibold block truncate hover:underline text-[10px]"
            >
              {waWebLink}
            </a>
          </div>

        </div>

      </div>

      {/* CHANNEL 3: COMMUNICATIONS AUDIT LOG */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock size={14} className="text-blue-600" />
          Communications Delivery History ({commHistory.length})
        </h4>

        {commHistory.length > 0 ? (
          <div className="space-y-2">
            {commHistory.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{act.action}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Delivered
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{act.details}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Triggered by: {act.performedBy}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  {new Date(act.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No emails or WhatsApp alerts dispatched yet for this applicant. Use the controls above to trigger candidate communications.
          </div>
        )}
      </div>

    </div>
  );
};
