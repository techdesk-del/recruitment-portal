import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Users,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  CalendarCheck,
  CalendarDays,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  FileText,
  Copy,
  Download,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Award,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { InterviewSchedule, InterviewRoundType, InterviewPlatform, InterviewStatus, Candidate } from '../types';

export const InterviewScheduler: React.FC = () => {
  const {
    interviews,
    candidates,
    jobs,
    scheduleInterview,
    updateInterview,
    rescheduleInterview,
    cancelInterview,
    markInterviewCompleted,
    deleteInterview,
    setSelectedCandidate,
    showToast
  } = useRecruitment();

  // Current View Settings
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 29)); // Default to Aug 29, 2026 matching app context
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-29');
  
  // Real-time ticking clock
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [interviewerFilter, setInterviewerFilter] = useState<string>('all');

  // Modals & Drawers
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSchedule | null>(null);
  const [activeInterviewForDetails, setActiveInterviewForDetails] = useState<InterviewSchedule | null>(null);

  // Form State for Schedule New Interview
  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateLocation: '',
    jobTitle: '',
    jobId: '',
    department: 'Engineering',
    round: 'Round 1: Screening / Technical' as InterviewRoundType,
    date: '2026-08-29',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    durationMinutes: 60,
    interviewerName: 'Akash Das',
    interviewerRole: 'CEO / SDE-3 Lead',
    interviewerEmail: 'akash.das@urbangaon.com',
    platform: 'google_meet' as InterviewPlatform,
    meetingLink: 'https://meet.google.com/urb-new-session',
    meetingId: 'urb-new-session',
    meetingPasscode: 'ug2026',
    location: 'UrbanGaon HQ - Executive Conference 3B',
    status: 'scheduled' as InterviewStatus,
    feedbackStatus: 'pending' as const,
    notes: 'Please review the candidate ATS resume prior to the interview session.',
    atsMatchScore: 90
  });

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    interviewId: '',
    date: '2026-08-30',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    reason: 'Candidate requested time slot adjustment'
  });

  // Filtered Interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.interviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRound = roundFilter === 'all' || item.round === roundFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchInterviewer = interviewerFilter === 'all' || item.interviewerName === interviewerFilter;

      return matchSearch && matchRound && matchStatus && matchInterviewer;
    });
  }, [interviews, searchQuery, roundFilter, statusFilter, interviewerFilter]);

  // Key Metrics
  const todayStr = '2026-08-29';
  const todayInterviews = useMemo(() => {
    return interviews.filter((i) => i.date === todayStr);
  }, [interviews]);

  const upcomingInterviews = useMemo(() => {
    return interviews.filter((i) => i.date >= todayStr && (i.status === 'scheduled' || i.status === 'confirmed' || i.status === 'rescheduled'));
  }, [interviews]);

  const pendingFeedbackCount = useMemo(() => {
    return interviews.filter((i) => i.status === 'completed' && i.feedbackStatus === 'pending').length;
  }, [interviews]);

  const completedCount = useMemo(() => {
    return interviews.filter((i) => i.status === 'completed').length;
  }, [interviews]);

  // Next upcoming or in-progress interview
  const nextInterview = useMemo(() => {
    return (
      interviews.find((i) => i.date === todayStr && i.status === 'in_progress') ||
      interviews.find((i) => i.date === todayStr && (i.status === 'scheduled' || i.status === 'confirmed')) ||
      interviews.find((i) => i.date >= todayStr && i.status !== 'cancelled' && i.status !== 'completed')
    );
  }, [interviews]);

  // Calendar Navigation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 29);
    setCurrentDate(today);
    setSelectedDate('2026-08-29');
  };

  // Month grid generator
  const calendarGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = daysInPrevMonth - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;
      days.push({
        dayNumber: prevDate,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    return days;
  }, [year, month]);

  // Week View Days calculation (7 days around current selected date)
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 is Sunday
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - day);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      week.push({
        date: d,
        dateStr,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate
      });
    }
    return week;
  }, [selectedDate]);

  // Handle Candidate Selection in New Schedule Modal
  const handleSelectCandidate = (candId: string) => {
    const cand = candidates.find((c) => c.id === candId);
    if (!cand) return;

    // Suggest appropriate round based on candidate's current status
    let suggestedRound: InterviewRoundType = 'Round 1: Screening / Technical';
    if (cand.status === 'interview_r1') suggestedRound = 'Round 2: System Design & Coding';
    else if (cand.status === 'interview_r2') suggestedRound = 'Round 3: HR & Culture Fit';
    else if (cand.status === 'shortlisted') suggestedRound = 'Round 1: Screening / Technical';

    // Auto-generate realistic Google Meet code
    const slug = cand.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 12);
    const generatedMeet = `https://meet.google.com/urb-${slug}`;

    setFormData((prev) => ({
      ...prev,
      candidateId: cand.id,
      candidateName: cand.name,
      candidateEmail: cand.email,
      candidatePhone: cand.phone,
      candidateLocation: cand.location,
      jobTitle: cand.jobAppliedFor,
      jobId: cand.jobId,
      department: cand.department,
      round: suggestedRound,
      meetingLink: generatedMeet,
      meetingId: `urb-${slug}`,
      atsMatchScore: cand.atsMatchScore,
      interviewerName: cand.recruiterAssigned || 'Akash Das'
    }));
  };

  // Submit New Schedule Form
  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName || !formData.date || !formData.startTime) {
      showToast('warning', 'Missing Fields', 'Please complete all required schedule details.');
      return;
    }

    scheduleInterview(formData);
    setIsScheduleModalOpen(false);
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (interview: InterviewSchedule) => {
    setSelectedInterview(interview);
    setRescheduleData({
      interviewId: interview.id,
      date: interview.date,
      startTime: interview.startTime,
      endTime: interview.endTime,
      reason: 'Schedule adjusted by hiring manager'
    });
    setIsRescheduleModalOpen(true);
    setActiveInterviewForDetails(null);
  };

  // Submit Reschedule Form
  const handleSubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData.date || !rescheduleData.startTime) {
      showToast('warning', 'Missing Fields', 'Please select a new date and time.');
      return;
    }

    rescheduleInterview(
      rescheduleData.interviewId,
      rescheduleData.date,
      rescheduleData.startTime,
      rescheduleData.endTime,
      rescheduleData.reason
    );
    setIsRescheduleModalOpen(false);
  };

  // Open Candidate Evaluation Form Modal (HR EF-1)
  const handleOpenEvaluation = (interview: InterviewSchedule) => {
    const cand = candidates.find((c) => c.id === interview.candidateId || c.name === interview.candidateName);
    if (cand) {
      setSelectedCandidate(cand);
    } else {
      showToast('info', 'Evaluation Form', `Opening evaluation for ${interview.candidateName}`);
    }
  };

  // Copy Meeting Link helper
  const handleCopyLink = (link?: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    showToast('success', 'Link Copied', 'Meeting link copied to clipboard.');
  };

  // Export .ICS Calendar File
  const handleDownloadICS = (interview: InterviewSchedule) => {
    const cleanDate = interview.date.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UrbanGaon HR//Interview Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${interview.id}@urbangaon.com`,
      `DTSTAMP:${cleanDate}T090000Z`,
      `DTSTART:${cleanDate}T103000Z`,
      `DTEND:${cleanDate}T113000Z`,
      `SUMMARY:Interview: ${interview.candidateName} - ${interview.round}`,
      `DESCRIPTION:Interview with ${interview.candidateName} for position ${interview.jobTitle}.\\nInterviewer: ${interview.interviewerName}\\nMeeting Link: ${interview.meetingLink || 'N/A'}\\nNotes: ${interview.notes || ''}`,
      `LOCATION:${interview.meetingLink || interview.location || 'Online Video Call'}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Interview_${interview.candidateName.replace(/\s+/g, '_')}_${interview.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Calendar Invite Downloaded', '.ICS file ready to import into Google Calendar or Outlook.');
  };

  // Status Styling Badge Helper
  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            In Progress
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} />
            Confirmed
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock3 size={11} />
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 size={11} />
            Completed
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RefreshCw size={11} />
            Rescheduled
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <X size={11} />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Round Badge Helper
  const getRoundBadge = (round: InterviewRoundType) => {
    if (round.includes('Round 1')) {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">L1 Technical</span>;
    }
    if (round.includes('Round 2')) {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">L2 Architecture / Coding</span>;
    }
    if (round.includes('Round 3')) {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">HR & Fitment</span>;
    }
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">CEO / Leadership</span>;
  };

  // Platform Icon Helper
  const getPlatformIcon = (platform: InterviewPlatform) => {
    switch (platform) {
      case 'google_meet':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <Video size={12} className="text-emerald-600" /> Google Meet
          </span>
        );
      case 'zoom':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <Video size={12} className="text-blue-600" /> Zoom
          </span>
        );
      case 'teams':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <Video size={12} className="text-indigo-600" /> MS Teams
          </span>
        );
      case 'onsite':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <MapPin size={12} className="text-rose-600" /> In-Person HQ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <Phone size={12} className="text-slate-600" /> Phone Call
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Top Banner & Live Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE INTERVIEW CALENDAR ENGINE</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-emerald-300 font-bold">{currentTime} IST</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <CalendarDays className="text-blue-400" size={28} />
              <span>Interview Scheduler & Live Calendar</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time synchronization of candidate interviews, panel availability, Google Meet links, and 1-click HR evaluation scorecards.
            </p>
          </div>

          {/* Next Immediate Interview Card */}
          {nextInterview && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:min-w-[340px] flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle size={13} className="animate-spin text-amber-300" />
                  {nextInterview.status === 'in_progress' ? 'Happening Now' : 'Up Next Today'}
                </span>
                <span className="text-[11px] font-mono text-slate-300 font-semibold">{nextInterview.startTime}</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow shrink-0">
                  {nextInterview.candidateName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{nextInterview.candidateName}</h4>
                  <p className="text-[11px] text-blue-200 truncate">{nextInterview.jobTitle}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                    <User size={10} /> Panel: <strong>{nextInterview.interviewerName}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                {nextInterview.meetingLink && (
                  <a
                    href={nextInterview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Video size={13} />
                    <span>Join Call</span>
                  </a>
                )}
                <button
                  onClick={() => setActiveInterviewForDetails(nextInterview)}
                  className="py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition"
                >
                  Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sessions</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CalendarCheck size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{todayInterviews.length}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              ● Live Today
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Saturday, 29 Aug 2026</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming (7 Days)</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{upcomingInterviews.length}</span>
            <span className="text-xs text-slate-500 font-medium">scheduled</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">L1, L2 & Leadership Rounds</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending EF-1 Evaluation</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileText size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pendingFeedbackCount}</span>
            <span className="text-xs font-bold text-amber-600">Action Required</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Interviews awaiting scorecard</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Sessions</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{completedCount}</span>
            <span className="text-xs font-bold text-emerald-600">Archived</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scorecards stored to database</p>
        </div>
      </div>

      {/* Main Controls & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: View Switcher & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'month' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'week' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'day' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day Agenda
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 select-none">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleToday}
              className="ml-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-md transition"
            >
              Today
            </button>
          </div>
        </div>

        {/* Right: Search, Filters & Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Quick Search */}
          <div className="relative min-w-[180px] sm:min-w-[210px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate / role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Filter by Round */}
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Rounds</option>
            <option value="Round 1: Screening / Technical">Round 1: Technical</option>
            <option value="Round 2: System Design & Coding">Round 2: Architecture</option>
            <option value="Round 3: HR & Culture Fit">Round 3: HR Fit</option>
            <option value="Round 4: CEO / Leadership Round">Round 4: Leadership</option>
          </select>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Primary Action: + Schedule Interview */}
          <button
            onClick={() => {
              if (candidates.length > 0) {
                handleSelectCandidate(candidates[0].id);
              }
              setIsScheduleModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
          >
            <Plus size={15} />
            <span>Schedule Interview</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTH CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-3">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarGridDays.map((cell, idx) => {
              const cellInterviews = filteredInterviews.filter((i) => i.date === cell.dateStr);
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[120px] sm:min-h-[140px] p-2 transition-all flex flex-col justify-between group cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 text-slate-300'
                      : isSelected
                      ? 'bg-blue-50/40 ring-2 ring-blue-500/20 ring-inset'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Top Day Number Row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cellInterviews.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded-full">
                        {cellInterviews.length} {cellInterviews.length === 1 ? 'call' : 'calls'}
                      </span>
                    )}
                  </div>

                  {/* Interview Event Chips */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5">
                    {cellInterviews.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInterviewForDetails(item);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition shadow-2xs hover:scale-[1.02] flex items-center justify-between gap-1.5 ${
                          item.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : item.status === 'completed'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : item.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 line-through opacity-70'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1 truncate">
                          <span className="font-bold">{item.startTime.split(' ')[0]}</span>{' '}
                          <span className="truncate">{item.candidateName}</span>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {item.platform === 'google_meet' && <Video size={10} className="text-emerald-600" />}
                          {item.platform === 'zoom' && <Video size={10} className="text-blue-600" />}
                          {item.platform === 'onsite' && <MapPin size={10} className="text-rose-600" />}
                        </div>
                      </div>
                    ))}

                    {cellInterviews.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.dateStr);
                          setViewMode('day');
                        }}
                        className="w-full text-center text-[10px] font-bold text-blue-600 hover:text-blue-800 py-0.5 bg-blue-50/60 rounded"
                      >
                        +{cellInterviews.length - 3} more interviews
                      </button>
                    )}
                  </div>

                  {/* Empty state hover indicator */}
                  {cellInterviews.length === 0 && cell.isCurrentMonth && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, date: cell.dateStr }));
                        if (candidates.length > 0) handleSelectCandidate(candidates[0].id);
                        setIsScheduleModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 justify-center py-1 mt-auto"
                    >
                      <Plus size={11} /> Schedule
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Week Columns Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
            {weekDays.map((w) => (
              <div
                key={w.dateStr}
                onClick={() => setSelectedDate(w.dateStr)}
                className={`py-3 px-2 text-center cursor-pointer transition border-r last:border-r-0 ${
                  w.isSelected ? 'bg-blue-100/50' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500 uppercase">{w.dayName}</div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-extrabold mt-1 ${
                    w.isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-800'
                  }`}
                >
                  {w.dayNumber}
                </div>
              </div>
            ))}
          </div>

          {/* Hourly Timeline Container */}
          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[520px] p-2">
            {weekDays.map((w) => {
              const dayItems = filteredInterviews.filter((i) => i.date === w.dateStr);

              return (
                <div key={w.dateStr} className="p-1 space-y-2">
                  {dayItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-3 text-center text-slate-300">
                      <Clock size={20} className="mb-1 opacity-40" />
                      <span className="text-[11px]">No interviews</span>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, date: w.dateStr }));
                          if (candidates.length > 0) handleSelectCandidate(candidates[0].id);
                          setIsScheduleModalOpen(true);
                        }}
                        className="mt-2 text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        + Add Slot
                      </button>
                    </div>
                  ) : (
                    dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveInterviewForDetails(item)}
                        className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl p-2.5 transition shadow-2xs cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                            {item.startTime}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{item.candidateName}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{item.jobTitle}</p>

                        <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate flex items-center gap-1">
                            <User size={10} /> {item.interviewerName.split(' ')[0]}
                          </span>
                          {item.meetingLink && (
                            <a
                              href={item.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                            >
                              <Video size={11} /> Join
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY / AGENDA VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          {/* Day View Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Agenda for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                {selectedDate === todayStr && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredInterviews.filter((i) => i.date === selectedDate).length} interviews scheduled for this date.
              </p>
            </div>

            {/* Quick Date Switcher */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, date: selectedDate }));
                  if (candidates.length > 0) handleSelectCandidate(candidates[0].id);
                  setIsScheduleModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus size={13} />
                <span>Add Slot</span>
              </button>
            </div>
          </div>

          {/* Agenda Timeline List */}
          {filteredInterviews.filter((i) => i.date === selectedDate).length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <CalendarIcon size={36} className="mx-auto opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">No interviews scheduled for this day</p>
              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, date: selectedDate }));
                  if (candidates.length > 0) handleSelectCandidate(candidates[0].id);
                  setIsScheduleModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition"
              >
                + Schedule Interview for this day
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews
                .filter((i) => i.date === selectedDate)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                          {item.candidateName.charAt(0)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">{item.candidateName}</h3>
                            {getRoundBadge(item.round)}
                            {getStatusBadge(item.status)}
                            {item.atsMatchScore && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {item.atsMatchScore}% ATS Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-blue-700 mt-0.5">{item.jobTitle} • {item.department}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                              <Clock size={12} className="text-blue-600" /> {item.startTime} – {item.endTime} ({item.durationMinutes || 60}m)
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User size={12} className="text-slate-400" /> Panel: <strong>{item.interviewerName}</strong> ({item.interviewerRole})
                            </span>
                            <span>•</span>
                            {getPlatformIcon(item.platform)}
                          </div>
                        </div>
                      </div>

                      {/* Right Quick Actions */}
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        {item.meetingLink && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            <Video size={14} />
                            <span>Join Video Call</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenEvaluation(item)}
                          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                        >
                          <FileText size={14} />
                          <span>HR EF-1 Evaluation</span>
                        </button>

                        <button
                          onClick={() => handleDownloadICS(item)}
                          title="Download Calendar Invite (.ics)"
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
                        >
                          <Download size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenReschedule(item)}
                          title="Reschedule Interview"
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Notes Box */}
                    {item.notes && (
                      <div className="text-xs bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700 flex items-start gap-2">
                        <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800">Interviewer Notes: </span>
                          <span>{item.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Candidate & Role</th>
                  <th className="py-3.5 px-4">Interview Round</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Interviewer</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No interviews matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {item.candidateName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{item.candidateName}</span>
                            <span className="text-[11px] text-slate-500">{item.jobTitle}</span>
                          </div>
                        </div>
                      </td>

                      {/* Round */}
                      <td className="py-3.5 px-4">
                        {getRoundBadge(item.round)}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[11px] font-mono text-blue-600 font-semibold">{item.startTime} – {item.endTime}</div>
                      </td>

                      {/* Interviewer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{item.interviewerName}</div>
                        <div className="text-[11px] text-slate-400">{item.interviewerRole}</div>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-4">
                        {getPlatformIcon(item.platform)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.meetingLink && (
                            <a
                              href={item.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title="Join Meeting"
                            >
                              <Video size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEvaluation(item)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                            title="HR EF-1 Evaluation Form"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenReschedule(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="Reschedule"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadICS(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="Download .ICS"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: SCHEDULE NEW INTERVIEW */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
            
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Schedule Candidate Interview</h3>
                  <p className="text-xs text-slate-500">Live calendar scheduling with Google Meet & .ics calendar invite.</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitSchedule} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Select Candidate */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate *</label>
                <select
                  value={formData.candidateId}
                  onChange={(e) => handleSelectCandidate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  required
                >
                  <option value="">-- Choose from candidate pool --</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.jobAppliedFor} ({c.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Job & Department Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              {/* Interview Round */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Round *</label>
                <select
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: e.target.value as InterviewRoundType })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                >
                  <option value="Round 1: Screening / Technical">Round 1: Screening / Technical</option>
                  <option value="Round 2: System Design & Coding">Round 2: System Design & Coding</option>
                  <option value="Round 3: HR & Culture Fit">Round 3: HR & Culture Fit</option>
                  <option value="Round 4: CEO / Leadership Round">Round 4: CEO / Leadership Round</option>
                </select>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Interviewer Panel Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interviewer Name *</label>
                  <select
                    value={formData.interviewerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      let role = 'Hiring Manager';
                      let email = 'recruiter@urbangaon.com';
                      if (val === 'Akash Das') {
                        role = 'CEO / SDE-3 Lead';
                        email = 'akash.das@urbangaon.com';
                      } else if (val === 'Priya Sharma') {
                        role = 'HR Lead';
                        email = 'priya.sharma@urbangaon.com';
                      } else if (val === 'Rahul Mehta') {
                        role = 'QA Architect';
                        email = 'rahul.mehta@urbangaon.com';
                      } else if (val === 'Vikramaditya Rao') {
                        role = 'Principal Cloud Architect';
                        email = 'vikram.rao@urbangaon.com';
                      }
                      setFormData({ ...formData, interviewerName: val, interviewerRole: role, interviewerEmail: email });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                  >
                    <option value="Akash Das">Akash Das (CEO / SDE-3 Lead)</option>
                    <option value="Priya Sharma">Priya Sharma (HR Lead)</option>
                    <option value="Rahul Mehta">Rahul Mehta (QA Architect)</option>
                    <option value="Vikramaditya Rao">Vikramaditya Rao (Principal Cloud Architect)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as InterviewPlatform })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="onsite">In-Person (UrbanGaon HQ)</option>
                  </select>
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting URL / Room ID</label>
                <input
                  type="text"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs"
                />
              </div>

              {/* Instructions / Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Assessment Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  placeholder="Notes for panel (e.g. focus on React 18 concurrency, system architecture, etc.)"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <CalendarCheck size={15} />
                  <span>Confirm & Schedule Interview</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE MODAL */}
      {isRescheduleModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up text-slate-900">
            
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Reschedule Interview</h3>
                <p className="text-xs text-slate-500">Update date and time for {selectedInterview.candidateName}</p>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Date *</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Start Time *</label>
                  <input
                    type="text"
                    value={rescheduleData.startTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New End Time *</label>
                  <input
                    type="text"
                    value={rescheduleData.endTime}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  placeholder="e.g. Candidate conflict / Panel unavailable"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL 3: INTERVIEW DETAILS & 1-CLICK ACTIONS */}
      {activeInterviewForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
            
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
                  {activeInterviewForDetails.candidateName.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">{activeInterviewForDetails.candidateName}</h3>
                    {getStatusBadge(activeInterviewForDetails.status)}
                  </div>
                  <p className="text-xs font-bold text-blue-700 mt-0.5">{activeInterviewForDetails.jobTitle}</p>
                  <p className="text-[11px] text-slate-500">{activeInterviewForDetails.candidateLocation || 'India'}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveInterviewForDetails(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Timing & Round Block */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Round Type</span>
                  <div className="mt-0.5">{getRoundBadge(activeInterviewForDetails.round)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Date & Time</span>
                  <span className="font-bold text-slate-900 block">{activeInterviewForDetails.date}</span>
                  <span className="font-mono text-blue-700 font-bold">{activeInterviewForDetails.startTime} – {activeInterviewForDetails.endTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Interviewer Panel</span>
                  <span className="font-bold text-slate-900 block">{activeInterviewForDetails.interviewerName}</span>
                  <span className="text-slate-500">{activeInterviewForDetails.interviewerRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Platform</span>
                  <div className="mt-0.5">{getPlatformIcon(activeInterviewForDetails.platform)}</div>
                </div>
              </div>

              {/* Meeting Link Bar */}
              {activeInterviewForDetails.meetingLink && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Meeting Room URL</span>
                    <span className="text-xs font-mono font-bold text-slate-800 truncate block">{activeInterviewForDetails.meetingLink}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(activeInterviewForDetails.meetingLink)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 transition"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </button>
                    <a
                      href={activeInterviewForDetails.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Video size={14} />
                      <span>Join Now</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Notes */}
              {activeInterviewForDetails.notes && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Interview Assessment Objectives:</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                    {activeInterviewForDetails.notes}
                  </p>
                </div>
              )}

              {/* Core Actions Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block">Actions & Feedback:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      handleOpenEvaluation(activeInterviewForDetails);
                      setActiveInterviewForDetails(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition"
                  >
                    <FileText size={15} />
                    <span>Open HR EF-1 Evaluation</span>
                  </button>

                  <button
                    onClick={() => {
                      markInterviewCompleted(activeInterviewForDetails.id);
                      setActiveInterviewForDetails(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition border border-slate-200"
                  >
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Mark as Completed</span>
                  </button>

                  <button
                    onClick={() => handleOpenReschedule(activeInterviewForDetails)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition border border-slate-200"
                  >
                    <Edit3 size={14} />
                    <span>Reschedule Slot</span>
                  </button>

                  <button
                    onClick={() => handleDownloadICS(activeInterviewForDetails)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition border border-slate-200"
                  >
                    <Download size={14} />
                    <span>Download .ICS Invite</span>
                  </button>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    cancelInterview(activeInterviewForDetails.id, 'Cancelled by user from interview details');
                    setActiveInterviewForDetails(null);
                  }}
                  className="text-rose-600 hover:text-rose-700 font-bold"
                >
                  Cancel this interview
                </button>

                <button
                  onClick={() => {
                    deleteInterview(activeInterviewForDetails.id);
                    setActiveInterviewForDetails(null);
                  }}
                  className="text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
