import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneForwarded, 
  PhoneOff, 
  PhoneMissed, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  MessageSquare, 
  Play, 
  Square, 
  Send, 
  ExternalLink, 
  ArrowRight, 
  RotateCcw, 
  Star, 
  MapPin, 
  Mail, 
  Briefcase, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Flame,
  ChevronRight,
  TrendingUp,
  History,
  X
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate, CallRecord, CallDisposition, CandidateSource, CallingOverallStatus } from '../types';
import { PortalLogo } from './PortalLogo';

export const CallingDesk: React.FC = () => {
  const { 
    candidates, 
    jobs, 
    callRecords, 
    callingMetrics, 
    logCallRecord, 
    deleteCallRecord, 
    quickScheduleFollowUp, 
    setSelectedCandidate,
    activeDialerCandidate,
    setActiveDialerCandidate,
    setActiveView,
    showToast
  } = useRecruitment();

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'followup' | 'qualified' | 'unreachable' | 'logs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedPortal, setSelectedPortal] = useState<string>('all');
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('all');

  // Live Call In-Progress State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0); // seconds
  const [isMuted, setIsMuted] = useState(false);

  // In-call screening form state
  const [recruiterName, setRecruiterName] = useState('Priya Sharma');
  const [disposition, setDisposition] = useState<CallDisposition>('connected_screening_passed');
  const [callNotes, setCallNotes] = useState('');
  const [confirmedCurrentCtc, setConfirmedCurrentCtc] = useState('');
  const [confirmedExpectedCtc, setConfirmedExpectedCtc] = useState('');
  const [confirmedNoticePeriod, setConfirmedNoticePeriod] = useState('30 Days');
  const [relocationPref, setRelocationPref] = useState<'Immediate Relocate' | 'Prefers Remote' | 'Current City Only' | 'Open to Hybrid'>('Open to Hybrid');
  const [commRating, setCommRating] = useState(4);
  const [techRating, setTechRating] = useState(4);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('03:00 PM');
  
  // Instant Schedule Round 1 Interview state
  const [promoteToInterview, setPromoteToInterview] = useState(true);
  const [interviewDate, setInterviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [interviewStartTime, setInterviewStartTime] = useState('11:00 AM');
  const [interviewerName, setInterviewerName] = useState('Akash Das');
  const [interviewerRole, setInterviewerRole] = useState('CEO / SDE-3 Lead');

  // Quick Follow-up Modal State for table item
  const [quickFollowUpCand, setQuickFollowUpCand] = useState<Candidate | null>(null);
  const [quickFDate, setQuickFDate] = useState('');
  const [quickFTime, setQuickFTime] = useState('04:00 PM');
  const [quickFNote, setQuickFNote] = useState('');

  // Call Timer Tick Effect
  useEffect(() => {
    let timer: any = null;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // When active dialer candidate is set, prefill screening form
  useEffect(() => {
    if (activeDialerCandidate) {
      setIsCallActive(true);
      setCallDuration(0);
      setConfirmedCurrentCtc(activeDialerCandidate.currentSalary || '');
      setConfirmedExpectedCtc(activeDialerCandidate.expectedSalary || '');
      setConfirmedNoticePeriod(activeDialerCandidate.noticePeriod || '30 Days');
      setCallNotes(
        activeDialerCandidate.callingDetails?.lastCallNotes ||
        `Initial telephonic screening for ${activeDialerCandidate.jobAppliedFor}.`
      );
      setDisposition('connected_screening_passed');
      setPromoteToInterview(true);
      setRecruiterName(activeDialerCandidate.recruiterAssigned || 'Priya Sharma');
    }
  }, [activeDialerCandidate]);

  const handleStartCall = (candidate: Candidate) => {
    setActiveDialerCandidate(candidate);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  const handleSaveCallRecord = () => {
    if (!activeDialerCandidate) return;

    logCallRecord({
      candidateId: activeDialerCandidate.id,
      candidateName: activeDialerCandidate.name,
      candidatePhone: activeDialerCandidate.phone,
      jobTitle: activeDialerCandidate.jobAppliedFor,
      jobId: activeDialerCandidate.jobId,
      recruiterName,
      durationSeconds: callDuration > 0 ? callDuration : 180,
      disposition,
      notes: callNotes,
      followUpDate: disposition === 'connected_callback_requested' ? followUpDate : undefined,
      followUpTime: disposition === 'connected_callback_requested' ? followUpTime : undefined,
      confirmedCurrentCtc,
      confirmedExpectedCtc,
      confirmedNoticePeriod,
      relocationPreference: relocationPref,
      communicationRating: commRating,
      technicalFitRating: techRating,
      tags: [disposition.replace(/_/g, ' '), confirmedNoticePeriod],
      promoteToInterview: disposition === 'connected_screening_passed' && promoteToInterview,
      interviewData: {
        candidateEmail: activeDialerCandidate.email,
        department: activeDialerCandidate.department,
        round: 'Round 1: Screening / Technical',
        date: interviewDate,
        startTime: interviewStartTime,
        endTime: '12:00 PM',
        interviewerName,
        interviewerRole,
        interviewerEmail: 'akash.das@urbangaon.com',
        platform: 'google_meet',
        meetingLink: 'https://meet.google.com/ug-screening-call'
      }
    });

    setIsCallActive(false);
    setActiveDialerCandidate(null);
    setCallDuration(0);
  };

  const handleQuickFollowUpSave = () => {
    if (!quickFollowUpCand || !quickFDate) return;
    quickScheduleFollowUp(quickFollowUpCand.id, quickFDate, quickFTime, quickFNote);
    setQuickFollowUpCand(null);
    setQuickFNote('');
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter candidates for calling queue
  const filteredCandidates = candidates.filter((cand) => {
    // Job filter
    if (selectedJobId !== 'all' && cand.jobId !== selectedJobId) return false;
    // Portal filter
    if (selectedPortal !== 'all' && cand.source !== selectedPortal) return false;
    // Recruiter filter
    if (selectedRecruiter !== 'all' && cand.recruiterAssigned !== selectedRecruiter) return false;
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        cand.name.toLowerCase().includes(q) ||
        cand.phone.includes(q) ||
        cand.jobAppliedFor.toLowerCase().includes(q) ||
        cand.location.toLowerCase().includes(q) ||
        (cand.callingDetails?.lastCallNotes && cand.callingDetails.lastCallNotes.toLowerCase().includes(q));
      if (!match) return false;
    }

    const cState = cand.callingDetails?.callStatus || 'pending';
    const totalCalls = cand.callingDetails?.totalCalls || 0;
    const isFollowUpToday = cand.callingDetails?.nextFollowUpDate === todayStr;

    // Tab category filter
    if (activeTab === 'pending') {
      return totalCalls === 0 || cState === 'pending';
    }
    if (activeTab === 'followup') {
      return cState === 'follow_up' || isFollowUpToday || Boolean(cand.callingDetails?.nextFollowUpDate);
    }
    if (activeTab === 'qualified') {
      return cState === 'qualified' || cand.status === 'shortlisted' || cand.status === 'interview_r1';
    }
    if (activeTab === 'unreachable') {
      return cState === 'unreachable' || ['ringing_no_answer', 'busy', 'switched_off'].includes(cand.callingDetails?.lastDisposition || '');
    }

    return true;
  });

  // Source badges
  const sourceBadges: Record<CandidateSource, { label: string; class: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-50 text-sky-700 border-sky-200' },
    indeed: { label: 'Indeed', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    apna: { label: 'Apna.co', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    internshala: { label: 'Internshala', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    referral: { label: 'Referral', class: 'bg-purple-50 text-purple-700 border-purple-200' }
  };

  // Calling status badges
  const getCallStatusBadge = (cand: Candidate) => {
    const details = cand.callingDetails;
    if (!details || details.totalCalls === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={11} /> Fresh (To Call)
        </span>
      );
    }

    switch (details.callStatus) {
      case 'qualified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} /> Screening Passed
          </span>
        );
      case 'follow_up':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <PhoneForwarded size={11} /> Callback Scheduled
          </span>
        );
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <PhoneCall size={11} /> Connected / In Review
          </span>
        );
      case 'unreachable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <PhoneMissed size={11} /> Ringing / Unreachable
          </span>
        );
      case 'disqualified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle size={11} /> Not Interested / Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
            In Queue
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <PhoneCall size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Candidate Telecalling & Screening Desk
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Dialer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time candidate calling tracker, instant telephonic screening notes, CTC & notice period verification, and 1-click interview conversion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {candidates.length > 0 && (
            <button
              onClick={() => handleStartCall(filteredCandidates[0] || candidates[0])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
            >
              <Play size={13} className="fill-white" />
              <span>Start Next Call</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
              activeTab === 'logs' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <History size={14} />
            <span>Call Audit Logs ({callRecords.length})</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer shadow-2xs ${
            activeTab === 'all' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Calling Queue</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{candidates.length}</span>
            <span className="text-xs text-blue-600 font-bold">Candidates</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all sourced portals</span>
        </div>

        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer shadow-2xs ${
            activeTab === 'pending' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Fresh / Needs Call</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{callingMetrics.pendingCallsCount}</span>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">High Priority</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting 1st recruiter touch</span>
        </div>

        <div 
          onClick={() => setActiveTab('followup')}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer shadow-2xs ${
            activeTab === 'followup' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Follow-ups Today</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-600">{callingMetrics.followUpsTodayCount}</span>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Scheduled</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled for callback today</span>
        </div>

        <div 
          onClick={() => setActiveTab('qualified')}
          className={`p-4 rounded-2xl bg-white border transition cursor-pointer shadow-2xs ${
            activeTab === 'qualified' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Screening Qualified</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">{callingMetrics.qualifiedRate}%</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              {callRecords.filter(r => r.disposition === 'connected_screening_passed').length} Passed
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Promoted to R1 Interview</span>
        </div>

        <div 
          onClick={() => setActiveTab('logs')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs"
        >
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Total Talk Time</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-indigo-600">{callingMetrics.totalDurationMinutes}m</span>
            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{callingMetrics.totalCallsMade} Calls</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{callingMetrics.connectedRate}% Connect Rate</span>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="p-2 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Queue ({candidates.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Fresh / To Call</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {callingMetrics.pendingCallsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'followup'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PhoneForwarded size={12} />
            <span>Follow-ups ({candidates.filter(c => c.callingDetails?.callStatus === 'follow_up').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qualified')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'qualified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Screening Passed</span>
          </button>

          <button
            onClick={() => setActiveTab('unreachable')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'unreachable'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PhoneMissed size={12} />
            <span>Ringing / Busy</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History size={12} />
            <span>Call Audit Stream</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, phone, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter size={13} /> Filter:
          </span>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Job Roles ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            value={selectedPortal}
            onChange={(e) => setSelectedPortal(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sourcing Portals</option>
            <option value="naukri">Naukri.com</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="urbangaon">UrbanGaon Careers</option>
            <option value="apna">Apna.co</option>
            <option value="internshala">Internshala</option>
            <option value="referral">Employee Referral</option>
          </select>

          <select
            value={selectedRecruiter}
            onChange={(e) => setSelectedRecruiter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Recruiters</option>
            <option value="Priya Sharma">Priya Sharma</option>
            <option value="Amit Singh">Amit Singh</option>
            <option value="Neha Verma">Neha Verma</option>
            <option value="Rajesh Gupta">Rajesh Gupta</option>
          </select>

          {(selectedJobId !== 'all' || selectedPortal !== 'all' || selectedRecruiter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedJobId('all');
                setSelectedPortal('all');
                setSelectedRecruiter('all');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw size={11} /> Reset filters
            </button>
          )}
        </div>

        <div className="text-slate-500 text-[11px] font-medium">
          Showing <strong>{filteredCandidates.length}</strong> matching candidates
        </div>
      </div>

      {/* VIEW 1: CALLING QUEUE TABLE */}
      {activeTab !== 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Candidate & Contact</th>
                  <th className="py-3 px-4">Applied Job Role</th>
                  <th className="py-3 px-4">Portal & CTC Details</th>
                  <th className="py-3 px-4">Calling Status</th>
                  <th className="py-3 px-4">Screening Notes / Follow-up</th>
                  <th className="py-3 px-5 text-right">Quick Dial & Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <PhoneCall size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">No candidates found in this calling filter.</p>
                      <button
                        onClick={() => {
                          setActiveTab('all');
                          setSearchQuery('');
                        }}
                        className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Reset filters to view all queue
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => {
                    const source = sourceBadges[cand.source];
                    const cDetails = cand.callingDetails;
                    const hasFollowUp = cDetails?.nextFollowUpDate;
                    const isFollowUpToday = cDetails?.nextFollowUpDate === todayStr;

                    return (
                      <tr 
                        key={cand.id} 
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* Candidate & Contact */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {cand.name.charAt(0)}
                            </div>
                            <div>
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="font-bold text-slate-900 hover:text-blue-600 transition text-left text-sm"
                              >
                                {cand.name}
                              </button>
                              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  {cand.phone}
                                </span>
                                <span>•</span>
                                <span>{cand.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Applied Job Role */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">{cand.jobAppliedFor}</span>
                          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            {cand.atsMatchScore}% ATS Match
                          </span>
                        </td>

                        {/* Portal & CTC Details */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${source.class}`}>
                            <PortalLogo source={cand.source} size={12} />
                            <span>{source.label}</span>
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Exp: <strong>{cand.experienceYears}y</strong> | CTC: <strong className="text-slate-800">{cand.expectedSalary}</strong>
                          </div>
                        </td>

                        {/* Calling Status Badge */}
                        <td className="py-3.5 px-4">
                          {getCallStatusBadge(cand)}
                          <div className="text-[10px] text-slate-400 mt-1">
                            Total Calls: <strong>{cDetails?.totalCalls || 0}</strong>
                            {cDetails?.lastCallTime && (
                              <span> • {new Date(cDetails.lastCallTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            )}
                          </div>
                        </td>

                        {/* Screening Notes & Follow-up */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {hasFollowUp && (
                            <div className={`p-1.5 rounded-lg text-[11px] mb-1.5 border flex items-center gap-1.5 font-bold ${
                              isFollowUpToday 
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' 
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              <Calendar size={12} />
                              <span>Callback: {cDetails.nextFollowUpDate} @ {cDetails.nextFollowUpTime || '04:00 PM'}</span>
                            </div>
                          )}
                          <p className="text-xs text-slate-600 line-clamp-2 italic">
                            "{cDetails?.lastCallNotes || cand.notes || 'No screening notes logged yet.'}"
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartCall(cand)}
                              title="Start Live Call & Screening"
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                            >
                              <PhoneCall size={13} />
                              <span>Call</span>
                            </button>

                            <button
                              onClick={() => setQuickFollowUpCand(cand)}
                              title="Schedule Callback / Follow-up"
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                            >
                              <Calendar size={13} />
                            </button>

                            <button
                              onClick={() => {
                                const msg = `Hello ${cand.name}, this is ${cand.recruiterAssigned || 'HR'} from UrbanGaon regarding your application for ${cand.jobAppliedFor}. Are you free for a quick 5-min telephonic screening?`;
                                window.open(`https://wa.me/${cand.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              title="WhatsApp Message"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                            >
                              <MessageSquare size={13} />
                            </button>

                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              title="View Full Profile Dossier"
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                            >
                              Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CALL AUDIT STREAM LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Chronological Telephonic Call Logs</h2>
              <p className="text-xs text-slate-500">Audit trail of all telephonic screening conversations, durations, recruiter notes, and decisions.</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
              Total {callRecords.length} records
            </span>
          </div>

          <div className="space-y-3">
            {callRecords.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-xs">No calls recorded yet.</p>
            ) : (
              callRecords.map((record) => {
                const durationMin = Math.floor(record.durationSeconds / 60);
                const durationSec = record.durationSeconds % 60;

                return (
                  <div 
                    key={record.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {record.candidateName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{record.candidateName}</h3>
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                            {record.candidatePhone}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {record.jobTitle}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Recruiter:</strong> {record.recruiterName} • <strong>Duration:</strong> {durationMin}m {durationSec}s •{' '}
                          <strong>Date:</strong> {new Date(record.callTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>

                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 mt-2">
                          <p className="font-medium">"{record.notes}"</p>
                          {(record.confirmedCurrentCtc || record.confirmedExpectedCtc || record.confirmedNoticePeriod) && (
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100">
                              {record.confirmedCurrentCtc && <span>Current CTC: <strong>{record.confirmedCurrentCtc}</strong></span>}
                              {record.confirmedExpectedCtc && <span>• Expected CTC: <strong className="text-blue-700">{record.confirmedExpectedCtc}</strong></span>}
                              {record.confirmedNoticePeriod && <span>• Notice: <strong className="text-emerald-700">{record.confirmedNoticePeriod}</strong></span>}
                              {record.communicationRating && <span>• Comm Rating: <strong>{record.communicationRating}/5 ⭐</strong></span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        record.disposition === 'connected_screening_passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : record.disposition === 'connected_callback_requested'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : record.disposition === 'ringing_no_answer' || record.disposition === 'busy'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {record.disposition.replace(/_/g, ' ').toUpperCase()}
                      </span>

                      <button
                        onClick={() => deleteCallRecord(record.id)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                      >
                        Delete Log
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LIVE INTERACTIVE WEB DIALER & SCREENING SCRIPT MODAL             */}
      {/* ========================================================================= */}
      {activeDialerCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
            
            {/* Dialer Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  isCallActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-700'
                }`}>
                  <PhoneCall size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{activeDialerCandidate.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isCallActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {isCallActive ? '● CALL IN PROGRESS' : 'CALL ENDED / LOGGING'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                    <span>{activeDialerCandidate.phone}</span>
                    <span>•</span>
                    <span>{activeDialerCandidate.jobAppliedFor}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm bg-slate-800 px-2 py-0.2 rounded">
                      ⏱ {formatTime(callDuration)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCallActive ? (
                  <button
                    onClick={handleEndCall}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <PhoneOff size={14} />
                    <span>End Call</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCallActive(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Phone size={14} />
                    <span>Resume Call</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCallActive(false);
                    setActiveDialerCandidate(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Dialer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
              
              {/* Screening Quick Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Confirmed Current CTC
                  </label>
                  <input
                    type="text"
                    value={confirmedCurrentCtc}
                    onChange={(e) => setConfirmedCurrentCtc(e.target.value)}
                    placeholder="e.g. ₹15 LPA"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Confirmed Expected CTC
                  </label>
                  <input
                    type="text"
                    value={confirmedExpectedCtc}
                    onChange={(e) => setConfirmedExpectedCtc(e.target.value)}
                    placeholder="e.g. ₹22 - 25 LPA"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Confirmed Notice Period
                  </label>
                  <select
                    value={confirmedNoticePeriod}
                    onChange={(e) => setConfirmedNoticePeriod(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Immediate">Immediate / Ready to Join</option>
                    <option value="15 Days (Serving Notice)">15 Days (Serving Notice)</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>
              </div>

              {/* Call Disposition Radio Buttons */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Call Outcome & Disposition
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-semibold">
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    disposition === 'connected_screening_passed'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="disp"
                      checked={disposition === 'connected_screening_passed'}
                      onChange={() => {
                        setDisposition('connected_screening_passed');
                        setPromoteToInterview(true);
                      }}
                      className="text-emerald-600"
                    />
                    <span>✅ Screening Passed (Book R1)</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    disposition === 'connected_interested'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="disp"
                      checked={disposition === 'connected_interested'}
                      onChange={() => setDisposition('connected_interested')}
                      className="text-blue-600"
                    />
                    <span>📞 Connected - Interested</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    disposition === 'connected_callback_requested'
                      ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="disp"
                      checked={disposition === 'connected_callback_requested'}
                      onChange={() => setDisposition('connected_callback_requested')}
                      className="text-purple-600"
                    />
                    <span>⏰ Callback Requested</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    disposition === 'ringing_no_answer'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="disp"
                      checked={disposition === 'ringing_no_answer'}
                      onChange={() => setDisposition('ringing_no_answer')}
                      className="text-amber-600"
                    />
                    <span>📴 Ringing / No Answer</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    disposition === 'busy' || disposition === 'switched_off'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-100'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="disp"
                      checked={disposition === 'busy'}
                      onChange={() => setDisposition('busy')}
                      className="text-rose-600"
                    />
                    <span>📵 Busy / Switched Off</span>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    disposition === 'connected_not_interested' || disposition === 'connected_screening_failed'
                      ? 'bg-slate-100 border-slate-400 text-slate-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="disp"
                      checked={disposition === 'connected_not_interested'}
                      onChange={() => setDisposition('connected_not_interested')}
                      className="text-slate-600"
                    />
                    <span>❌ Not Interested / Rejected</span>
                  </label>
                </div>
              </div>

              {/* If Callback Requested: Follow-up Date/Time picker */}
              {disposition === 'connected_callback_requested' && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 animate-slide-up text-xs">
                  <h3 className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Calendar size={14} /> Schedule Follow-up Callback
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-purple-700 block mb-1">Callback Date</label>
                      <input
                        type="date"
                        value={followUpDate || todayStr}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-purple-700 block mb-1">Callback Time</label>
                      <input
                        type="text"
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        placeholder="e.g. 04:00 PM"
                        className="w-full p-2 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* If Screening Passed: Instant Schedule Round 1 Interview Box */}
              {disposition === 'connected_screening_passed' && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3 animate-slide-up text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600" />
                      1-Click Instant Round 1 Technical Interview Booking
                    </h3>
                    <label className="flex items-center gap-1.5 font-bold text-emerald-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promoteToInterview}
                        onChange={(e) => setPromoteToInterview(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Schedule Interview Now</span>
                    </label>
                  </div>

                  {promoteToInterview && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-emerald-700 block mb-1">Interview Date</label>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-emerald-700 block mb-1">Start Time</label>
                        <input
                          type="text"
                          value={interviewStartTime}
                          onChange={(e) => setInterviewStartTime(e.target.value)}
                          placeholder="11:00 AM"
                          className="w-full p-2 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-emerald-700 block mb-1">Interviewer</label>
                        <input
                          type="text"
                          value={interviewerName}
                          onChange={(e) => setInterviewerName(e.target.value)}
                          placeholder="Interviewer Name"
                          className="w-full p-2 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recruiter Notes & Ratings */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Telephonic Screening Notes & Feedback
                  </h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-semibold">Communication:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          onClick={() => setCommRating(star)}
                          className={`cursor-pointer ${star <= commRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-semibold">Tech Fit:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          onClick={() => setTechRating(star)}
                          className={`cursor-pointer ${star <= techRating ? 'text-blue-500 fill-blue-500' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Summarize candidate's replies, communication clarity, tech stack depth, current challenges..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

            </div>

            {/* Dialer Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Recruiter: <strong>{recruiterName}</strong> • Logged call will sync immediately to candidate dossier.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCallActive(false);
                    setActiveDialerCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveCallRecord}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Save Call & Sync Everywhere</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK FOLLOW-UP CALLBACK MODAL                                   */}
      {/* ========================================================================= */}
      {quickFollowUpCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Schedule Callback Follow-up</h3>
                <p className="text-xs text-slate-500">{quickFollowUpCand.name} ({quickFollowUpCand.phone})</p>
              </div>
              <button
                onClick={() => setQuickFollowUpCand(null)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={quickFDate || todayStr}
                  onChange={(e) => setQuickFDate(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Follow-up Time</label>
                <input
                  type="text"
                  value={quickFTime}
                  onChange={(e) => setQuickFTime(e.target.value)}
                  placeholder="e.g. 04:30 PM"
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Remark / Reason</label>
                <textarea
                  rows={2}
                  value={quickFNote}
                  onChange={(e) => setQuickFNote(e.target.value)}
                  placeholder="e.g. In client meeting, requested callback after 4 PM..."
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setQuickFollowUpCand(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickFollowUpSave}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Save Callback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
