import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Phone, 
  PhoneForwarded, 
  PhoneMissed, 
  PhoneOff, 
  PauseCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  ShieldCheck, 
  RotateCcw, 
  Trash2,
  Send,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate, CallRecord, CallDisposition } from '../types';

interface CandidateCallTabProps {
  candidate: Candidate;
  onCallLogged?: () => void;
}

export const CandidateCallTab: React.FC<CandidateCallTabProps> = ({ candidate, onCallLogged }) => {
  const { 
    callRecords, 
    logCallRecord, 
    deleteCallRecord, 
    showToast 
  } = useRecruitment();

  // Call Tracker / Live Timer state
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0); // seconds
  const [recruiterName, setRecruiterName] = useState(candidate.recruiterAssigned || 'Priya Sharma');

  // Selected Disposition
  const [disposition, setDisposition] = useState<CallDisposition>('connected_interested');

  // Compensation & Notice Verification (Prefilled from candidate)
  const [confirmedCurrentCtc, setConfirmedCurrentCtc] = useState(
    candidate.callingDetails?.confirmedCurrentSalary || candidate.currentSalary || ''
  );
  const [confirmedExpectedCtc, setConfirmedExpectedCtc] = useState(
    candidate.callingDetails?.confirmedExpectedSalary || candidate.expectedSalary || ''
  );
  const [confirmedNoticePeriod, setConfirmedNoticePeriod] = useState(
    candidate.callingDetails?.confirmedNoticePeriod || candidate.noticePeriod || '30 Days'
  );

  // Ratings
  const [commRating, setCommRating] = useState<number>(4);
  const [techRating, setTechRating] = useState<number>(4);

  // Notes & Tags
  const [callNotes, setCallNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Follow-up for Callback or Hold
  const [followUpDate, setFollowUpDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [followUpTime, setFollowUpTime] = useState('03:30 PM');

  // Fast-track Round 1 Interview state
  const [scheduleR1, setScheduleR1] = useState(false);
  const [interviewDate, setInterviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [interviewTime, setInterviewTime] = useState('11:30 AM');
  const [interviewerName, setInterviewerName] = useState('Akash Das');

  // Specific reason chips
  const [holdReason, setHoldReason] = useState<string>('Candidate reviewing offer options');
  const [declineReason, setDeclineReason] = useState<string>('Expected CTC higher than budget');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Merge candidate call history
  const candidateCallHistory = [
    ...callRecords.filter(
      (r) => r.candidateId === candidate.id || r.candidateName.toLowerCase() === candidate.name.toLowerCase()
    ),
    ...(candidate.callingDetails?.callHistory || [])
  ]
    .filter((call, index, self) => index === self.findIndex((c) => c.id === call.id))
    .sort((a, b) => new Date(b.callTime).getTime() - new Date(a.callTime).getTime());

  // Format timer
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick tag addition to notes
  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
      setCallNotes((prev) => (prev ? `${prev} • [${tag}]` : `[${tag}]`));
    }
  };

  // Handle Log Call Save
  const handleSaveCall = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalDuration = callDuration > 0 ? callDuration : 180;
      let noteContent = callNotes.trim();

      if (disposition === 'connected_hold' && holdReason) {
        noteContent = `[HOLD REASON: ${holdReason}] ${noteContent}`.trim();
      } else if (disposition === 'connected_not_interested' && declineReason) {
        noteContent = `[DECLINE REASON: ${declineReason}] ${noteContent}`.trim();
      }

      if (!noteContent) {
        noteContent = `Telephonic screening call logged with disposition: ${disposition.replace(/_/g, ' ')}.`;
      }

      const allTags = [...selectedTags, disposition.replace(/_/g, ' ')];
      if (confirmedNoticePeriod) allTags.push(confirmedNoticePeriod);

      logCallRecord({
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidatePhone: candidate.phone,
        jobTitle: candidate.jobAppliedFor,
        jobId: candidate.jobId,
        recruiterName,
        durationSeconds: finalDuration,
        disposition,
        notes: noteContent,
        followUpDate: ['connected_callback_requested', 'connected_hold'].includes(disposition) ? followUpDate : undefined,
        followUpTime: ['connected_callback_requested', 'connected_hold'].includes(disposition) ? followUpTime : undefined,
        confirmedCurrentCtc,
        confirmedExpectedCtc,
        confirmedNoticePeriod,
        communicationRating: commRating,
        technicalFitRating: techRating,
        tags: allTags,
        promoteToInterview: (disposition === 'connected_screening_passed' || disposition === 'connected_interested') && scheduleR1,
        interviewData: scheduleR1 ? {
          candidateEmail: candidate.email,
          department: candidate.department,
          round: 'Round 1: Screening / Technical',
          date: interviewDate,
          startTime: interviewTime,
          endTime: '12:30 PM',
          interviewerName,
          interviewerRole: 'CEO / SDE-3 Lead',
          interviewerEmail: 'akash.das@urbangaon.com',
          platform: 'google_meet'
        } : undefined
      });

      // Stop call timer
      setIsCallActive(false);
      setCallDuration(0);
      setCallNotes('');
      setSelectedTags([]);

      showToast(
        'success',
        'Call Record Successfully Logged!',
        `${candidate.name}'s call status updated to ${disposition.replace(/_/g, ' ').toUpperCase()}`
      );

      if (onCallLogged) {
        onCallLogged();
      }
    } catch (err) {
      console.error('Error logging call', err);
      showToast('error', 'Error Saving Call', 'Failed to record telephonic call log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean phone number for WhatsApp
  const cleanPhone = candidate.phone.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">

      {/* TOP TELEPHONY COMMAND BAR */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner transition-all ${
              isCallActive 
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/50' 
                : 'bg-blue-600 text-white'
            }`}>
              <PhoneCall size={26} className={isCallActive ? 'animate-bounce' : ''} />
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-lg text-white tracking-tight">{candidate.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {candidate.jobAppliedFor}
                </span>
                {isCallActive && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-400/40 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    CALL IN PROGRESS ({formatTimer(callDuration)})
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Phone size={13} /> {candidate.phone}
                </span>
                <span>•</span>
                <span>Total Calls Logged: <strong className="text-white">{candidateCallHistory.length}</strong></span>
                <span>•</span>
                <span>Assigned HR: <strong className="text-blue-300">{recruiterName}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Hardware / Softphone Dial Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`tel:${candidate.phone}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              title="Trigger device dialer or softphone"
            >
              <Phone size={14} />
              <span>Dial Number</span>
            </a>

            <a
              href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/40 font-bold text-xs shadow-md transition active:scale-95"
              title="Open WhatsApp chat with candidate"
            >
              <span>💬 WhatsApp</span>
            </a>

            {/* Live Call Timer Controller */}
            {!isCallActive ? (
              <button
                type="button"
                onClick={() => {
                  setIsCallActive(true);
                  setCallDuration(0);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Clock size={14} />
                <span>Start Call Timer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCallActive(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer animate-pulse"
              >
                <span>⏹ End Call ({formatTimer(callDuration)})</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* CALL LOGGING FORM & DISPOSITION CONTROLLER */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Log Candidate Call Outcome & Screening Feedback
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select disposition status, verify CTC & notice period, and log conversation outcome.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Logging As:</span>
            <select
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="Priya Sharma">Priya Sharma (Sr. Recruiter)</option>
              <option value="Amit Singh">Amit Singh (Talent Partner)</option>
              <option value="Neha Verma">Neha Verma (HR Associate)</option>
              <option value="Akash Das">Akash Das (CEO / Lead)</option>
              <option value="Rajesh Gupta">Rajesh Gupta (Lead HR)</option>
            </select>
          </div>
        </div>

        {/* 1. DISPOSITION OPTIONS MATRIX (INTERESTED, HOLD, NOT INTERESTED, ETC.) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Candidate Call Disposition / Status</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Click to select outcome</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* OPTION 1: INTERESTED */}
            <button
              type="button"
              onClick={() => {
                setDisposition('connected_interested');
                setScheduleR1(false);
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                disposition === 'connected_interested'
                  ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                disposition === 'connected_interested' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <ThumbsUp size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950">🌟 Interested & Qualified</span>
                  {disposition === 'connected_interested' && <Check size={14} className="text-emerald-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Candidate is keen, matches requirements, and wants to proceed.
                </p>
              </div>
            </button>

            {/* OPTION 2: PUT ON HOLD */}
            <button
              type="button"
              onClick={() => setDisposition('connected_hold')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                disposition === 'connected_hold'
                  ? 'bg-amber-50/80 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                disposition === 'connected_hold' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                <PauseCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-950">⏸️ Put on Hold</span>
                  {disposition === 'connected_hold' && <Check size={14} className="text-amber-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Decision pending, awaiting feedback, or candidate requested time.
                </p>
              </div>
            </button>

            {/* OPTION 3: NOT INTERESTED */}
            <button
              type="button"
              onClick={() => {
                setDisposition('connected_not_interested');
                setScheduleR1(false);
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                disposition === 'connected_not_interested'
                  ? 'bg-rose-50/80 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                disposition === 'connected_not_interested' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                <ThumbsDown size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-rose-950">❌ Not Interested</span>
                  {disposition === 'connected_not_interested' && <Check size={14} className="text-rose-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Declined opportunity, not switching, or salary mismatch.
                </p>
              </div>
            </button>

            {/* OPTION 4: SCREENING PASSED (FAST TRACK R1) */}
            <button
              type="button"
              onClick={() => {
                setDisposition('connected_screening_passed');
                setScheduleR1(true);
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                disposition === 'connected_screening_passed'
                  ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                disposition === 'connected_screening_passed' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                <ShieldCheck size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-blue-950">🎯 Screening Passed (Ready for R1)</span>
                  {disposition === 'connected_screening_passed' && <Check size={14} className="text-blue-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  High quality match. Fast-track candidate to Round 1 Interview.
                </p>
              </div>
            </button>

            {/* OPTION 5: CALLBACK REQUESTED */}
            <button
              type="button"
              onClick={() => {
                setDisposition('connected_callback_requested');
                setScheduleR1(false);
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                disposition === 'connected_callback_requested'
                  ? 'bg-purple-50/80 border-purple-500 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                disposition === 'connected_callback_requested' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
              }`}>
                <PhoneForwarded size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-purple-950">⏰ Callback Requested</span>
                  {disposition === 'connected_callback_requested' && <Check size={14} className="text-purple-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Candidate was driving/busy, requested call at specific time.
                </p>
              </div>
            </button>

            {/* OPTION 6: NO ANSWER / RINGING / BUSY */}
            <button
              type="button"
              onClick={() => {
                setDisposition('ringing_no_answer');
                setScheduleR1(false);
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 ${
                disposition === 'ringing_no_answer' || disposition === 'busy'
                  ? 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-slate-400/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                disposition === 'ringing_no_answer' || disposition === 'busy' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <PhoneMissed size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">📴 No Answer / Busy / Unreachable</span>
                  {(disposition === 'ringing_no_answer' || disposition === 'busy') && <Check size={14} className="text-slate-700" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Phone rang with no response, line busy or switched off.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* 2. DYNAMIC CONTEXTUAL DETAILS ACCORDING TO SELECTED DISPOSITION */}

        {/* CASE A: HOLD REASON & REVISIT DATE */}
        {disposition === 'connected_hold' && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <PauseCircle size={14} /> Hold Reason & Follow-up Plan
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">Will keep profile active in review stage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-amber-800 block mb-1">Select Primary Hold Reason:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Candidate requested 2-3 days for decision',
                    'Waiting for client / HM profile review',
                    'Candidate evaluating competing offer',
                    'Salary expectation discussion pending',
                    'Evaluating other R1 candidates first'
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setHoldReason(r)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                        holdReason === r
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-800 block mb-1">Hold Revisit / Next Action Date:</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-amber-300 text-slate-800 focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* CASE B: CALLBACK SCHEDULING */}
        {disposition === 'connected_callback_requested' && (
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Calendar size={14} /> Schedule Follow-up Callback
              </span>
              <span className="text-[11px] text-purple-700 font-semibold">Reminder will appear in daily desk</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-purple-900 block mb-1">Callback Date:</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-purple-300 text-slate-800 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-purple-900 block mb-1">Preferred Time:</label>
                <select
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-purple-300 text-slate-800 focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="10:00 AM">10:00 AM (Morning)</option>
                  <option value="11:30 AM">11:30 AM (Pre-Lunch)</option>
                  <option value="02:30 PM">02:30 PM (Afternoon)</option>
                  <option value="03:30 PM">03:30 PM (Mid-Afternoon)</option>
                  <option value="05:00 PM">05:00 PM (Late Afternoon)</option>
                  <option value="06:30 PM">06:30 PM (Post Work Hours)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* CASE C: NOT INTERESTED DECLINE REASON */}
        {disposition === 'connected_not_interested' && (
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3 animate-fade-in">
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <XCircle size={14} /> Candidate Decline Reason (Will Archive Candidate)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Expected CTC higher than budget',
                'Candidate wants 100% remote work only',
                'Notice period too long (> 90 days)',
                'Accepted another offer recently',
                'Not planning to switch current job',
                'Location / Relocation constraint'
              ].map((dr) => (
                <button
                  key={dr}
                  type="button"
                  onClick={() => setDeclineReason(dr)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition cursor-pointer ${
                    declineReason === dr
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {dr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. VERIFIED CTC & NOTICE PERIOD (SHOWN FOR ALL CONNECTED CALLS) */}
        {['connected_interested', 'connected_screening_passed', 'connected_hold'].includes(disposition) && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirmed Telephonic Verification
              </h5>
              <span className="text-[11px] text-blue-600 font-semibold">Updates candidate profile in real-time</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Confirmed Current Salary</label>
                <input
                  type="text"
                  value={confirmedCurrentCtc}
                  onChange={(e) => setConfirmedCurrentCtc(e.target.value)}
                  placeholder="e.g. ₹14.5 LPA"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Confirmed Expected Salary</label>
                <input
                  type="text"
                  value={confirmedExpectedCtc}
                  onChange={(e) => setConfirmedExpectedCtc(e.target.value)}
                  placeholder="e.g. ₹22 - 25 LPA"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-300 text-blue-700 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Verified Notice Period</label>
                <select
                  value={confirmedNoticePeriod}
                  onChange={(e) => setConfirmedNoticePeriod(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-300 text-emerald-700 focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="Immediate Joiner">Immediate Joiner</option>
                  <option value="15 Days (Serving Notice)">15 Days (Serving Notice)</option>
                  <option value="30 Days">30 Days</option>
                  <option value="45 Days">45 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>

            {/* Ratings Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Communication Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      onClick={() => setCommRating(s)}
                      className={`cursor-pointer transition ${
                        s <= commRating ? 'text-amber-500 fill-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-1.5">{commRating}/5</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Technical Fit Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      onClick={() => setTechRating(s)}
                      className={`cursor-pointer transition ${
                        s <= techRating ? 'text-blue-500 fill-blue-500 scale-110' : 'text-slate-300 hover:text-blue-400'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-1.5">{techRating}/5</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 4. FAST-TRACK INTERVIEW BOOKING (OPTIONAL FOR INTERESTED OR SCREENING PASSED) */}
        {(disposition === 'connected_screening_passed' || disposition === 'connected_interested') && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 animate-fade-in">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={scheduleR1}
                onChange={(e) => setScheduleR1(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Zap size={14} className="text-blue-600" />
                ⚡ Fast-track: Instantly Schedule Round 1 Interview for this Candidate
              </span>
            </label>

            {scheduleR1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-200/60">
                <div>
                  <label className="text-[11px] font-semibold text-blue-900 block mb-1">Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-blue-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-blue-900 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-blue-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-blue-900 block mb-1">Interviewer (Lead/CEO)</label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-blue-300 font-semibold"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. CALL NOTES & QUICK TAGS */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={13} className="text-blue-600" />
              Detailed Call Remarks & Screening Notes
            </label>
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-slate-400 font-medium">Quick tags:</span>
              {[
                'Immediate Joiner',
                'Strong Tech Fit',
                'Clear English',
                'Salary Negotiable',
                'Notice Negotiable',
                'Needs Relocation'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-semibold border border-slate-200 transition cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder={`Log conversation notes with ${candidate.name} (e.g. Discussed experience, confirmed willingness to relocate to Gurgaon, notice period is buyable...)`}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* 6. SUBMIT BUTTON */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {callDuration > 0 ? (
              <span>Duration recorded: <strong className="text-slate-900">{formatTimer(callDuration)}</strong></span>
            ) : (
              <span>Standard call duration (3 mins) will be logged.</span>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveCall}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Send size={14} />
            <span>Save & Log Call Record</span>
          </button>
        </div>

      </div>

      {/* 7. CANDIDATE CALL LOG HISTORY (TIMELINE) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              Telephonic Call Log Dossier ({candidateCallHistory.length})
            </h4>
            <p className="text-xs text-slate-500">
              Chronological log of all outbound calls and tele-screenings with {candidate.name}.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            {candidateCallHistory.length} Recorded Call{candidateCallHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {candidateCallHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <PhoneCall size={28} className="mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No telephonic calls logged for this candidate yet.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Use the form above to record your first conversation outcome (Interested, Hold, Not Interested, etc.).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidateCallHistory.map((call) => {
              const mins = Math.floor(call.durationSeconds / 60);
              const secs = call.durationSeconds % 60;

              const isHold = call.disposition === 'connected_hold';
              const isInterested = call.disposition === 'connected_interested';
              const isPassed = call.disposition === 'connected_screening_passed';
              const isDecline = call.disposition === 'connected_not_interested' || call.disposition === 'connected_screening_failed';
              const isCallback = call.disposition === 'connected_callback_requested';

              const badgeColor = isPassed
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : isInterested
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isHold
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : isCallback
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : isDecline
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

              const dispIcon = isPassed ? (
                <ShieldCheck size={13} />
              ) : isInterested ? (
                <ThumbsUp size={13} />
              ) : isHold ? (
                <PauseCircle size={13} />
              ) : isCallback ? (
                <PhoneForwarded size={13} />
              ) : isDecline ? (
                <ThumbsDown size={13} />
              ) : (
                <PhoneMissed size={13} />
              );

              return (
                <div 
                  key={call.id} 
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 hover:bg-slate-50/80 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border inline-flex items-center gap-1.5 ${badgeColor}`}>
                        {dispIcon}
                        <span>{call.disposition.replace(/_/g, ' ').toUpperCase()}</span>
                      </span>

                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        ⏱ {mins}m {secs}s
                      </span>

                      {call.followUpDate && (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <Calendar size={11} /> Follow-up: {call.followUpDate} {call.followUpTime}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium text-[11px]">
                        {new Date(call.callTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteCallRecord(call.id)}
                        title="Delete this call entry"
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200/70">
                    "{call.notes}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>Logged by: <strong className="text-slate-700">{call.recruiterName}</strong></span>
                      {call.confirmedCurrentCtc && <span>• Current CTC: <strong>{call.confirmedCurrentCtc}</strong></span>}
                      {call.confirmedExpectedCtc && <span>• Expected CTC: <strong className="text-blue-700">{call.confirmedExpectedCtc}</strong></span>}
                      {call.confirmedNoticePeriod && <span>• Notice: <strong className="text-emerald-700">{call.confirmedNoticePeriod}</strong></span>}
                    </div>

                    <div className="flex items-center gap-3">
                      {call.communicationRating && <span>Comm: <strong>{call.communicationRating}/5 ⭐</strong></span>}
                      {call.technicalFitRating && <span>Tech: <strong>{call.technicalFitRating}/5 ⭐</strong></span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
