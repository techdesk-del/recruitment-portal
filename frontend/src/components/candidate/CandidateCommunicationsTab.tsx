import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Clock, 
  FileText, 
  Sparkles,
  Phone,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Candidate, InterviewSchedule } from '../../types';
import { communicationApi } from '../../services/api';
import { useRecruitment } from '../../context/RecruitmentContext';

interface CandidateCommunicationsTabProps {
  candidate: Candidate;
  scheduledInterviews: InterviewSchedule[];
}

export const CandidateCommunicationsTab: React.FC<CandidateCommunicationsTabProps> = ({
  candidate,
  scheduledInterviews
}) => {
  const { showToast, updateCandidateDetails } = useRecruitment();

  // Email form state
  const [emailType, setEmailType] = useState<'interview' | 'status' | 'rejection'>('interview');
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>(
    scheduledInterviews[0]?.id || ''
  );
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
  const [customWhatsAppText, setCustomWhatsAppText] = useState<string>('');
  const [isGeneratingWhatsApp, setIsGeneratingWhatsApp] = useState(false);
  const [lastWhatsAppResult, setLastWhatsAppResult] = useState<{
    deepLink: string;
    waMeLink: string;
    rawText: string;
  } | null>(null);

  const matchedInterview = scheduledInterviews.find((i) => i.id === selectedInterviewId) || scheduledInterviews[0];

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
        if (!matchedInterview) {
          showToast('warning', 'No Interview Found', 'Please schedule an interview first or create one.');
          setIsSendingEmail(false);
          return;
        }
        res = await communicationApi.sendInterviewEmail({
          candidateId: candidate.id,
          candidate,
          interview: matchedInterview,
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
        details: `${res.message} (${res.subject || ''})`,
        performedBy: 'Talent Team',
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

  // 2. Generate WhatsApp Alert
  const handleGenerateWhatsApp = async (openDirectly = false) => {
    if (!candidate.phone) {
      showToast('error', 'Missing Phone Number', 'This candidate does not have a registered phone number.');
      return;
    }

    setIsGeneratingWhatsApp(true);
    try {
      let res;
      if (whatsappTemplate === 'interview') {
        res = await communicationApi.sendWhatsAppInterview({
          candidateId: candidate.id,
          candidate,
          interview: matchedInterview
        });
      } else {
        res = await communicationApi.sendWhatsAppStatus({
          candidateId: candidate.id,
          candidate,
          status: whatsappTemplate === 'rejection' ? 'rejected' : emailStatusTarget,
          details: emailNotes
        });
      }

      setLastWhatsAppResult({
        deepLink: res.deepLink,
        waMeLink: res.waMeLink,
        rawText: res.rawText
      });

      // Log activity
      const newActivity = {
        id: `act-${Date.now()}`,
        action: `WhatsApp Alert Prepared: ${whatsappTemplate.toUpperCase()}`,
        details: `Direct message generated for ${candidate.phone}`,
        performedBy: 'Talent Team',
        timestamp: new Date().toISOString(),
        type: 'communication' as const
      };
      await updateCandidateDetails(candidate.id, {
        activityHistory: [newActivity, ...(candidate.activityHistory || [])]
      });

      if (openDirectly) {
        window.open(res.waMeLink, '_blank', 'noopener,noreferrer');
        showToast('success', 'WhatsApp Launched', `Opening WhatsApp conversation for ${candidate.name}...`);
      } else {
        showToast('info', 'WhatsApp Ready', 'WhatsApp deep link & formatted template generated.');
      }
    } catch (err: any) {
      showToast('error', 'WhatsApp Error', err.message || 'Failed to generate WhatsApp notification.');
    } finally {
      setIsGeneratingWhatsApp(false);
    }
  };

  // Copy text helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied to Clipboard', `${label} copied successfully!`);
  };

  // Filter communications from activity history
  const commHistory = (candidate.activityHistory || []).filter(
    (a) => a.type === 'communication' || a.action.includes('Email') || a.action.includes('WhatsApp')
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Candidate Contact & Readiness */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Automated Communications Gateway
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            Outreach Channels for {candidate.name}
          </h3>
          <p className="text-xs text-slate-500">
            Deliver transactional emails with Google Meet & calendar invites, plus instant WhatsApp status alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-700">
            <Mail size={13} className="text-blue-600" />
            <span className="font-semibold">{candidate.email || 'No email provided'}</span>
            {candidate.email && (
              <button
                type="button"
                onClick={() => handleCopyText(candidate.email, 'Email')}
                className="hover:text-blue-600 ml-1 cursor-pointer"
                title="Copy email"
              >
                <Copy size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-xs font-medium text-emerald-800 border border-emerald-200">
            <Phone size={13} className="text-emerald-600" />
            <span className="font-semibold">{candidate.phone || 'No phone provided'}</span>
            {candidate.phone && (
              <button
                type="button"
                onClick={() => handleCopyText(candidate.phone, 'Phone number')}
                className="hover:text-emerald-700 ml-1 cursor-pointer"
                title="Copy phone"
              >
                <Copy size={12} />
              </button>
            )}
          </div>
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
                  Branded UrbanGaon HTML email with .ics calendar attachment
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Zero-AWS / Free
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

          {/* Dynamic Configuration based on Email Type */}
          {emailType === 'interview' && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2.5">
              <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-600" />
                Select Scheduled Interview to Link:
              </span>

              {scheduledInterviews.length > 0 ? (
                <select
                  value={selectedInterviewId}
                  onChange={(e) => setSelectedInterviewId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-blue-200 text-slate-800 font-semibold focus:outline-none"
                >
                  {scheduledInterviews.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.round} • {int.date} at {int.startTime} ({int.interviewerName})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-amber-600" />
                  <span>No interview record found. An instant interview invite will be prepared automatically.</span>
                </div>
              )}

              {matchedInterview && (
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Google Meet:</span>
                    <a
                      href={matchedInterview.meetingLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      {(matchedInterview.meetingLink || 'https://meet.google.com').slice(0, 30)}...
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Calendar Sync:</span>
                    <span className="font-bold text-emerald-700">✓ .ics File Attached</span>
                  </div>
                </div>
              )}
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
                ? 'Dispatching Email...'
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
                  Instant click-to-chat deep link & direct outreach
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

          {/* Message Preview Box */}
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <span>WhatsApp Message Preview:</span>
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    lastWhatsAppResult?.rawText ||
                      `🏡 *URBANGAON CAREERS* - Interview Invitation\n\nDear *${candidate.name}*,\nYour interview for *${candidate.jobAppliedFor}* has been confirmed!\nDate: ${matchedInterview?.date || 'Upcoming'}\nMeet: ${matchedInterview?.meetingLink || 'https://meet.google.com/urb-interview'}`,
                    'WhatsApp template text'
                  )
                }
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <Copy size={11} />
                <span>Copy Text</span>
              </button>
            </div>
            
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 whitespace-pre-line max-h-36 overflow-y-auto">
              {lastWhatsAppResult?.rawText || (
                whatsappTemplate === 'interview'
                  ? `🏡 *URBANGAON CAREERS* - Interview Invitation\n\nDear *${candidate.name}*,\nYour interview for *${candidate.jobAppliedFor}* has been confirmed.\n\n📋 *Round*: ${matchedInterview?.round || 'Technical Round'}\n📅 *Date*: ${matchedInterview?.date || 'Upcoming'}\n⏰ *Time*: ${matchedInterview?.startTime || '10:00 AM'} (IST)\n🔗 *Google Meet*: ${matchedInterview?.meetingLink || 'https://meet.google.com/urb-interview'}\n\nBest regards,\n*UrbanGaon Talent Acquisition Team*`
                  : `🏡 *URBANGAON CAREERS* - Application Update\n\nDear *${candidate.name}*,\nYour application for *${candidate.jobAppliedFor}* has transitioned to: *${(whatsappTemplate === 'rejection' ? 'REJECTED' : emailStatusTarget).toUpperCase()}*.\n\nBest regards,\n*UrbanGaon Talent Team*`
              )}
            </div>
          </div>

          {/* WhatsApp Direct Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleGenerateWhatsApp(true)}
              disabled={isGeneratingWhatsApp || !candidate.phone}
              className="flex-1 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <MessageSquare size={14} />
              <span>Launch WhatsApp Web / App</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerateWhatsApp(false)}
              disabled={isGeneratingWhatsApp || !candidate.phone}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Generate link without opening window"
            >
              Prepare Link
            </button>
          </div>

          {lastWhatsAppResult && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Generated Deep Link:</span>
              <a
                href={lastWhatsAppResult.waMeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold block truncate hover:underline"
              >
                {lastWhatsAppResult.waMeLink}
              </a>
            </div>
          )}

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
