import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Printer,
  ChevronDown,
  X
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CallRecord, CallDisposition, CandidateSource, CallingOverallStatus } from '../../types';
import { PortalLogo, Pagination } from '../common';
import { Flag } from '../common/Flag';
import { COUNTRIES, findCountry, CountryItem } from '../../data/countries';
import brandLogoJpg from '../../assets/urbangaon-brand-logo.jpg';
import brandIconPng from '../../assets/urbangaon-icon.png';
const CITY_METADATA_MAP: Record<string, { state: string; defaultPin: string; cleanName: string }> = {
  mumbai: { state: 'Maharashtra', defaultPin: '400001', cleanName: 'Mumbai' },
  pune: { state: 'Maharashtra', defaultPin: '411001', cleanName: 'Pune' },
  bengaluru: { state: 'Karnataka', defaultPin: '560001', cleanName: 'Bengaluru' },
  bangalore: { state: 'Karnataka', defaultPin: '560001', cleanName: 'Bengaluru' },
  delhi: { state: 'Delhi', defaultPin: '110001', cleanName: 'New Delhi' },
  'new delhi': { state: 'Delhi', defaultPin: '110001', cleanName: 'New Delhi' },
  gurgaon: { state: 'Haryana', defaultPin: '122001', cleanName: 'Gurugram' },
  gurugram: { state: 'Haryana', defaultPin: '122001', cleanName: 'Gurugram' },
  noida: { state: 'Uttar Pradesh', defaultPin: '201301', cleanName: 'Noida' },
  hyderabad: { state: 'Telangana', defaultPin: '500001', cleanName: 'Hyderabad' },
  chennai: { state: 'Tamil Nadu', defaultPin: '600001', cleanName: 'Chennai' },
  kolkata: { state: 'West Bengal', defaultPin: '700001', cleanName: 'Kolkata' },
  jaipur: { state: 'Rajasthan', defaultPin: '302001', cleanName: 'Jaipur' },
  ahmedabad: { state: 'Gujarat', defaultPin: '380001', cleanName: 'Ahmedabad' },
  kochi: { state: 'Kerala', defaultPin: '682001', cleanName: 'Kochi' },
  cochin: { state: 'Kerala', defaultPin: '682001', cleanName: 'Kochi' },
  trivandrum: { state: 'Kerala', defaultPin: '695001', cleanName: 'Trivandrum' },
  thiruvananthapuram: { state: 'Kerala', defaultPin: '695001', cleanName: 'Trivandrum' },
  chandigarh: { state: 'Chandigarh', defaultPin: '160001', cleanName: 'Chandigarh' },
  indore: { state: 'Madhya Pradesh', defaultPin: '452001', cleanName: 'Indore' },
  bhopal: { state: 'Madhya Pradesh', defaultPin: '462001', cleanName: 'Bhopal' },
  lucknow: { state: 'Uttar Pradesh', defaultPin: '226001', cleanName: 'Lucknow' },
};




export const parseLocationDetails = (locationRaw?: string) => {
  if (!locationRaw) {
    return { city: 'Jaipur', state: 'Rajasthan', pin: '302001', address: 'Jaipur, Rajasthan, India' };
  }

  // Remove trailing work-mode tags like / Remote, / Hybrid, / Onsite, / NCR
  const cleaned = locationRaw
    .replace(/\s*\/\s*(Remote|Hybrid|Onsite|NCR)/gi, '')
    .replace(/\b(India)\b/gi, '')
    .trim();

  const parts = cleaned.split(',').map((s) => s.trim()).filter(Boolean);
  const candidateCityRaw = parts[0] || 'Jaipur';
  const cityKey = candidateCityRaw.toLowerCase();

  const matched = CITY_METADATA_MAP[cityKey];
  const city = matched ? matched.cleanName : candidateCityRaw;
  const state = parts[1] || (matched ? matched.state : 'Rajasthan');
  const pin = matched ? matched.defaultPin : '302001';
  const address = `${city}, ${state}, India`;

  return { city, state, pin, address };
};

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

  // In-call screening form state (UrbanGaon Official Form Fields)
  const [salutation, setSalutation] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('302006');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Real-time international country flag & dial code auto-sync states
  const [country, setCountry] = useState('India');
  const [countryIso, setCountryIso] = useState('in');
  const [dialCode, setDialCode] = useState('+91');
  const [digitLength, setDigitLength] = useState(10);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const handleCountryChange = (val: string) => {
    setCountry(val);
    const matched = findCountry(val);
    if (matched) {
      setCountryIso(matched.iso);
      setDialCode(matched.code);
      setDigitLength(matched.digitLength);
    }
  };

  const handleSelectCountry = (c: CountryItem) => {
    setCountry(c.name);
    setCountryIso(c.iso);
    setDialCode(c.code);
    setDigitLength(c.digitLength);
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery('');
  };

  const filteredCountries = COUNTRIES.filter((c) => {
    if (!countrySearchQuery) return true;
    const q = countrySearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.includes(q)
    );
  });

  const [recruiterName, setRecruiterName] = useState('Priya Sharma');
  const [disposition, setDisposition] = useState<CallDisposition>('connected_screening_passed');
  const [callNotes, setCallNotes] = useState('');
  const [confirmedCurrentCtc, setConfirmedCurrentCtc] = useState('');
  const [confirmedExpectedCtc, setConfirmedExpectedCtc] = useState('');
  const [confirmedNoticePeriod, setConfirmedNoticePeriod] = useState('30 Days');
  const [isNegotiable, setIsNegotiable] = useState<'yes' | 'no'>('yes');
  const [reasonForLeaving, setReasonForLeaving] = useState('Better Career Growth / Challenging Role');
  const [customReasonForLeaving, setCustomReasonForLeaving] = useState('');
  const [confirmedLocation, setConfirmedLocation] = useState('Bengaluru');
  const [customLocation, setCustomLocation] = useState('');
  const [relocationPref, setRelocationPref] = useState<'Immediate Relocate' | 'Prefers Remote' | 'Current City Only' | 'Open to Hybrid'>('Open to Hybrid');
  const [commRating, setCommRating] = useState(4);
  const [techRating, setTechRating] = useState(4);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('03:00 PM');
  
  // Tentative Date of Interview state
  const [tentativeDate, setTentativeDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

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

  const handleCityChange = (newCity: string) => {
    setConfirmedLocation(newCity);
    const key = newCity.trim().toLowerCase();
    const meta = CITY_METADATA_MAP[key];
    if (meta) {
      setStateName(meta.state);
      setPinCode(meta.defaultPin);
      setAddress(`${meta.cleanName}, ${meta.state}, India`);
    }
  };

  // When active dialer candidate is set, prefill screening form
  useEffect(() => {
    if (activeDialerCandidate) {
      // Parse name into salutation, first, middle, last
      const rawName = (activeDialerCandidate.name || '').trim();
      const parts = rawName.split(/\s+/);
      if (parts.length === 1) {
        setFirstName(parts[0] || '');
        setMiddleName('');
        setLastName('');
      } else if (parts.length === 2) {
        setFirstName(parts[0] || '');
        setMiddleName('');
        setLastName(parts[1] || '');
      } else {
        setFirstName(parts[0] || '');
        setMiddleName(parts.slice(1, -1).join(' '));
        setLastName(parts[parts.length - 1] || '');
      }

      // Gender/Salutation detection based on common female Indian names
      const femaleNames = ['priya', 'ananya', 'sneha', 'neha', 'kavita', 'ritu', 'pooja', 'shreya', 'divya', 'swati', 'tanvi', 'megha', 'ankita', 'aditi', 'deepa', 'roshni', 'sunita', 'preeti', 'aarti', 'jyoti', 'simran'];
      const isFemale = femaleNames.includes((parts[0] || '').toLowerCase());
      setSalutation(isFemale ? 'Ms.' : 'Mr.');

      // Country & International Dial Code initialization
      setCountry('India');
      setCountryIso('in');
      setDialCode('+91');
      setDigitLength(10);
      setIsCountryDropdownOpen(false);
      setCountrySearchQuery('');

      // 10-digit mobile number cleanup
      const cleanedPhone = (activeDialerCandidate.phone || '').replace(/[^0-9]/g, '');
      setMobileNumber(cleanedPhone.length >= 10 ? cleanedPhone.slice(-10) : (activeDialerCandidate.phone || ''));
      setEmailAddress(activeDialerCandidate.email || '');

      // Dynamic Location Parsing (City, State, Pin, Address) - Sync with candidate profile
      const locDetails = parseLocationDetails(activeDialerCandidate.location);
      setConfirmedLocation(activeDialerCandidate.callingDetails?.confirmedLocation || locDetails.city);
      setStateName(locDetails.state);
      setPinCode(locDetails.pin);
      setAddress(locDetails.address);

      setConfirmedCurrentCtc(activeDialerCandidate.currentSalary || '');
      setConfirmedExpectedCtc(activeDialerCandidate.expectedSalary || '');
      setConfirmedNoticePeriod(activeDialerCandidate.noticePeriod || '30 Days');
      setIsNegotiable(activeDialerCandidate.callingDetails?.isNegotiable || activeDialerCandidate.isSalaryNegotiable || 'yes');
      setReasonForLeaving(
        activeDialerCandidate.callingDetails?.reasonForLeaving ||
        activeDialerCandidate.reasonForLeaving ||
        'Better Career Growth / Challenging Role'
      );
      setCustomReasonForLeaving('');
      setCustomLocation('');
      setTentativeDate(
        activeDialerCandidate.callingDetails?.tentativeInterviewDate ||
        activeDialerCandidate.tentativeInterviewDate ||
        (() => {
          const d = new Date();
          d.setDate(d.getDate() + 2);
          return d.toISOString().split('T')[0];
        })()
      );
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

  const handleSaveCallRecord = () => {
    if (!activeDialerCandidate) return;

    const composedName = [firstName, middleName, lastName].filter(Boolean).join(' ') || activeDialerCandidate.name;
    const finalReason = reasonForLeaving === 'Other' 
      ? (customReasonForLeaving.trim() || 'Other / Custom Reason') 
      : reasonForLeaving;
    const finalLocation = confirmedLocation === 'Other' 
      ? (customLocation.trim() || activeDialerCandidate.location) 
      : (confirmedLocation && stateName ? `${confirmedLocation}, ${stateName}` : confirmedLocation);

    const formattedPhone = mobileNumber.length === 10 ? `+91 ${mobileNumber}` : (mobileNumber || activeDialerCandidate.phone);

    logCallRecord({
      candidateId: activeDialerCandidate.id,
      candidateName: composedName,
      candidatePhone: formattedPhone,
      jobTitle: activeDialerCandidate.jobAppliedFor,
      jobId: activeDialerCandidate.jobId,
      recruiterName,
      durationSeconds: 180,
      disposition,
      notes: callNotes,
      followUpDate: disposition === 'connected_callback_requested' ? followUpDate : undefined,
      followUpTime: disposition === 'connected_callback_requested' ? followUpTime : undefined,
      confirmedCurrentCtc,
      confirmedExpectedCtc,
      confirmedNoticePeriod,
      isNegotiable,
      reasonForLeaving: finalReason,
      confirmedLocation: finalLocation,
      tentativeInterviewDate: tentativeDate,
      relocationPreference: relocationPref,
      communicationRating: commRating,
      technicalFitRating: techRating,
      tags: [disposition.replace(/_/g, ' '), confirmedNoticePeriod],
      promoteToInterview: disposition === 'connected_screening_passed' && promoteToInterview,
      interviewData: {
        candidateEmail: emailAddress || activeDialerCandidate.email,
        department: activeDialerCandidate.department,
        round: 'Round 1: Screening / Technical',
        date: interviewDate || tentativeDate,
        startTime: interviewStartTime,
        endTime: '12:00 PM',
        interviewerName,
        interviewerRole,
        interviewerEmail: 'akash.das@urbangaon.com',
        platform: 'google_meet',
        meetingLink: 'https://meet.google.com/ug-screening-call'
      }
    });

    setActiveDialerCandidate(null);
  };

  const handleQuickFollowUpSave = () => {
    if (!quickFollowUpCand || !quickFDate) return;
    quickScheduleFollowUp(quickFollowUpCand.id, quickFDate, quickFTime, quickFNote);
    setQuickFollowUpCand(null);
    setQuickFNote('');
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
  }).sort((a, b) => {
    // Prioritize queued candidates to the top
    if (a.isCallingQueued && !b.isCallingQueued) return -1;
    if (!a.isCallingQueued && b.isCallingQueued) return 1;
    return 0;
  });

  // Calling Queue Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedJobId, selectedPortal, selectedRecruiter]);

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Call Logs Pagination
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(10);
  const paginatedCallRecords = callRecords.slice(
    (logsCurrentPage - 1) * logsPageSize,
    logsCurrentPage * logsPageSize
  );

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

  const queuedCandidate = candidates.find((c) => c.isCallingQueued) || null;

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
              onClick={() => handleStartCall(queuedCandidate || filteredCandidates[0] || candidates[0])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
            >
              <Play size={13} className="fill-white" />
              <span>Start Next Call</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
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

      {/* Active Shifted Candidate Focus Card */}
      {queuedCandidate && (
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white border-2 border-emerald-400 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-slide-up">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 ring-2 ring-emerald-300">
              {queuedCandidate.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm">{queuedCandidate.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Shifted for Calling
                </span>
                <span className="text-xs text-slate-600 font-medium">• {queuedCandidate.jobAppliedFor}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  📞 {queuedCandidate.phone}
                </span>
                <span>Expected CTC: <strong className="text-slate-800">{queuedCandidate.expectedSalary}</strong></span>
                <span>Notice: <strong className="text-slate-800">{queuedCandidate.noticePeriod}</strong></span>
                <span>Location: <strong className="text-slate-800">{queuedCandidate.location}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleStartCall(queuedCandidate)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
            >
              <PhoneCall size={13} />
              <span>Start Live Call</span>
            </button>
            <button
              onClick={() => setSelectedCandidate(queuedCandidate)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              View Profile
            </button>
          </div>
        </div>
      )}

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
                  paginatedCandidates.map((cand) => {
                    const source = sourceBadges[cand.source];
                    const cDetails = cand.callingDetails;
                    const hasFollowUp = cDetails?.nextFollowUpDate;
                    const isFollowUpToday = cDetails?.nextFollowUpDate === todayStr;

                    return (
                      <tr 
                        key={cand.id} 
                        className={`transition-colors group ${
                          cand.isCallingQueued 
                            ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-500' 
                            : 'hover:bg-blue-50/30'
                        }`}
                      >
                        {/* Candidate & Contact */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              cand.isCallingQueued ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {cand.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedCandidate(cand)}
                                  className="font-bold text-slate-900 hover:text-blue-600 transition text-left text-sm"
                                >
                                  {cand.name}
                                </button>
                                {cand.isCallingQueued && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                                    <PhoneCall size={9} /> Shifted for Calling
                                  </span>
                                )}
                              </div>
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

          {/* Calling Queue Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCandidates.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="candidates in calling queue"
          />
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
              paginatedCallRecords.map((record) => {
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
                          {(record.confirmedCurrentCtc || record.confirmedExpectedCtc || record.confirmedNoticePeriod || record.reasonForLeaving || record.confirmedLocation) && (
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100">
                              {record.confirmedCurrentCtc && <span>Current CTC: <strong>{record.confirmedCurrentCtc}</strong></span>}
                              {record.confirmedExpectedCtc && <span>• Expected CTC: <strong className="text-blue-700">{record.confirmedExpectedCtc}</strong></span>}
                              {record.isNegotiable && (
                                <span>• Negotiable: <strong className={record.isNegotiable === 'yes' ? 'text-emerald-700' : 'text-rose-700'}>{record.isNegotiable === 'yes' ? 'Yes' : 'No (Fixed)'}</strong></span>
                              )}
                              {record.confirmedNoticePeriod && <span>• Notice: <strong className="text-emerald-700">{record.confirmedNoticePeriod}</strong></span>}
                              {record.confirmedLocation && <span>• Location: <strong className="text-slate-800">📍 {record.confirmedLocation}</strong></span>}
                              {record.reasonForLeaving && <span>• Leaving Reason: <strong className="text-slate-800">{record.reasonForLeaving}</strong></span>}
                              {record.tentativeInterviewDate && <span>• Tentative Interview: <strong className="text-blue-700">📅 {record.tentativeInterviewDate}</strong></span>}
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

          {/* Call Logs Pagination */}
          <Pagination
            currentPage={logsCurrentPage}
            totalItems={callRecords.length}
            pageSize={logsPageSize}
            onPageChange={setLogsCurrentPage}
            onPageSizeChange={setLogsPageSize}
            pageSizeOptions={[5, 10, 20]}
            itemLabel="call logs"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LIVE INTERACTIVE WEB DIALER & SCREENING SCRIPT MODAL             */}
      {/* ========================================================================= */}
      {activeDialerCandidate && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-titillium">
          <div 
            className="bg-white border border-slate-200/90 rounded-[28px] sm:rounded-[36px] w-[96vw] max-w-6xl max-h-[94vh] h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900 my-auto font-titillium"
            style={{ fontFamily: "'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
          >
            
            {/* Top Header Bar (Screening & Telecalling Context) */}
            <div className="shrink-0 px-6 sm:px-8 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={brandIconPng} 
                  alt="UrbanGaon" 
                  className="w-9 h-9 rounded-full object-cover shrink-0 shadow-xs border border-slate-100" 
                />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight font-titillium">
                    Candidate Calling & Screening Form
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-normal font-titillium">
                    {activeDialerCandidate ? (
                      <span>
                        Candidate: <strong className="text-slate-800 font-bold">{activeDialerCandidate.name}</strong> • Role: <strong className="text-blue-700 font-bold">{activeDialerCandidate.jobAppliedFor}</strong> • Live ATS Sync
                      </span>
                    ) : (
                      'Official recruitment evaluation dossier with real-time ATS auto-sync'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCandidate(activeDialerCandidate);
                    setActiveView('candidates');
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition shadow-2xs cursor-pointer"
                  title="Preview Candidate Dossier"
                >
                  <Mail size={13} className="text-slate-500" />
                  <span>Preview Emails</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-blue-600 text-xs font-semibold flex items-center gap-2 transition shadow-2xs cursor-pointer"
                  title="Print Form"
                >
                  <Printer size={13} className="text-blue-600" />
                  <span>Print Form</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDialerCandidate(null)}
                  title="Close Form"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Centered Brand Hero Section with UrbanGaon Matching Screenshot */}
            <div className="shrink-0 px-6 sm:px-10 py-3.5 border-b border-slate-100 bg-white flex flex-col items-center text-center">
              <img 
                src={brandLogoJpg} 
                alt="UrbanGaon a perfect balance" 
                className="h-10 sm:h-12 w-auto object-contain select-none mx-auto mb-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <h2 className="text-2xl sm:text-[26px] font-bold text-slate-800 tracking-tight mt-1 font-titillium">
                Candidate Calling & Screening Form
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 italic mt-0.5 font-titillium">
                (Please complete this application thoroughly so we can process it as quickly as possible)
              </p>
            </div>

            {/* Form Fields Body (Spacious with sleek scrolling) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-10 py-4 space-y-4 bg-white font-titillium">
              
              {/* Row 1: Candidate Name (Salutation, First Name, Middle Name, Last Name in 1 horizontal row matching screenshot) */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 font-titillium">
                      Name: Mr./Ms./Mrs.
                    </label>
                    <select
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-1 font-titillium">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Rajesh"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-1 font-titillium">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Kumar"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] text-slate-400 mb-1 font-titillium">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Correspondence Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 font-titillium">
                  Correspondence Address:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No., Street, Landmark..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                />
              </div>

              {/* Row 3: City, State, Country, Pin (4 columns in 1 single row matching screenshot) */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-titillium">
                      City
                    </label>
                    <input
                      type="text"
                      list="screening-city-datalist"
                      value={confirmedLocation}
                      onChange={(e) => handleCityChange(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, Jaipur"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                    />
                    <datalist id="screening-city-datalist">
                      {Object.values(CITY_METADATA_MAP).map((c) => (
                        <option key={c.cleanName} value={c.cleanName}>
                          {c.cleanName} ({c.state})
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-titillium">
                      State
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Rajasthan"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                    />
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1 flex items-center justify-between text-[10px] font-titillium">
                      <span>Country *</span>
                      <span className="text-[#3B8CFF] font-semibold flex items-center gap-1">
                        <Flag iso={countryIso} size="xs" />
                        <span>{dialCode}</span>
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 pointer-events-none flex items-center">
                        <Flag iso={countryIso} size="sm" />
                      </div>
                      <input
                        type="text"
                        list="screening-countries-datalist"
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        placeholder="e.g. India, UAE, USA"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                      />
                      <datalist id="screening-countries-datalist">
                        {COUNTRIES.map((c) => (
                          <option key={c.iso} value={c.name}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-titillium">
                      Pin
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="302006"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                    />
                  </div>
                </div>

                {/* Dynamic custom city field if 'Other' is selected */}
                {confirmedLocation === 'Other' && (
                  <div className="animate-slide-up mt-2 p-3 rounded-xl bg-blue-50/60 border border-blue-200 font-titillium">
                    <label className="text-[11px] font-bold text-blue-800 block mb-1">
                      Specify Custom City / Location:
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Type custom city or state (e.g. Kolkata, Ahmedabad, Chandigarh)..."
                      className="w-full px-3 py-2 rounded-lg bg-white border border-blue-300 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 transition font-titillium"
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Mobile Number (with Interactive Flag Dropdown) & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 font-titillium">
                      Mobile Number * (Exactly {digitLength} Digits)
                    </label>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition font-titillium ${
                        mobileNumber.length === digitLength
                          ? 'bg-emerald-100 text-emerald-700'
                          : mobileNumber.length > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {mobileNumber.length === digitLength
                        ? `✓ ${digitLength}/${digitLength} Digits Complete`
                        : mobileNumber.length > 0
                        ? `${mobileNumber.length}/${digitLength} Digits (Need ${digitLength - mobileNumber.length} more)`
                        : `0/${digitLength} Digits`}
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    {/* Country Dial Code & Flag Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="px-3 py-2 rounded-l-xl bg-[#F8FAFC] hover:bg-slate-100 border border-r-0 border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition select-none cursor-pointer"
                        title="Select Country Dial Code"
                      >
                        <Flag iso={countryIso} size="sm" />
                        <span className="font-titillium font-bold">{dialCode}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isCountryDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-64 max-h-64 overflow-hidden flex flex-col p-1.5 animate-in fade-in">
                          <div className="p-1.5 border-b border-slate-100">
                            <div className="relative flex items-center">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                              <input
                                type="text"
                                autoFocus
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                placeholder="Search country or code..."
                                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-titillium"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto flex-1 p-1 space-y-0.5 max-h-48">
                            {filteredCountries.map((c) => (
                              <button
                                key={c.iso}
                                type="button"
                                onClick={() => handleSelectCountry(c)}
                                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition group cursor-pointer ${
                                  countryIso === c.iso ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-[#F0F6FF] hover:text-[#3B8CFF]'
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <Flag iso={c.iso} size="sm" />
                                  <span className="font-medium text-slate-800 group-hover:text-[#3B8CFF] truncate font-titillium">
                                    {c.name}
                                  </span>
                                </span>
                                <strong className="text-slate-500 font-mono text-[11px] ml-1 shrink-0">
                                  {c.code}
                                </strong>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, digitLength));
                      }}
                      placeholder={digitLength === 10 ? '9876543210' : '501234567'}
                      maxLength={digitLength}
                      className={`flex-1 px-3 py-2 rounded-r-xl bg-white border font-bold text-xs tracking-widest focus:outline-none focus:ring-2 transition font-titillium ${
                        mobileNumber.length === digitLength
                          ? 'border-emerald-400 text-emerald-950 focus:ring-emerald-400'
                          : mobileNumber.length > 0
                          ? 'border-amber-300 text-slate-900 focus:ring-amber-400'
                          : 'border-slate-200 text-slate-900 focus:ring-[#3B8CFF]'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-titillium">
                    Auto-synced with <strong>{country}</strong> ({dialCode}). Enter exactly {digitLength} digits.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 font-titillium">
                      Email Address *
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal font-titillium">
                      Type @ for quick domain suggestions
                    </span>
                  </div>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="e.g. rajesh.kumar@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3B8CFF] text-xs font-titillium"
                  />
                </div>
              </div>

              {/* Row 5: Current CTC, Expected CTC (4-Point Range Options), Negotiation (Yes/No), Notice Period */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Compensation & Notice Period Screening</span>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    Role: {activeDialerCandidate.jobAppliedFor}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Current CTC */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 font-titillium">
                        Confirmed Current CTC <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={confirmedCurrentCtc}
                        onChange={(e) => setConfirmedCurrentCtc(e.target.value)}
                        placeholder="e.g. ₹4.5 LPA or ₹12 LPA"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 font-titillium"
                      />
                      <div className="mt-2">
                        <span className="text-[9px] font-bold text-slate-400 block mb-1 font-titillium">Quick Benchmarks:</span>
                        <div className="grid grid-cols-4 gap-1">
                          {['₹3L', '₹5L', '₹10L', '₹18L'].map((sal) => (
                            <button
                              key={sal}
                              type="button"
                              onClick={() => setConfirmedCurrentCtc(sal + ' LPA')}
                              className="px-1 py-0.5 rounded text-[9px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition text-center cursor-pointer font-titillium"
                            >
                              {sal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 italic mt-2 font-titillium">Annual gross verified on call</p>
                  </div>

                  {/* Expected CTC (Low, Mid, High Tier Coverage + Custom Input) */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 font-titillium">
                          Expected CTC Range <span className="text-rose-500">*</span>
                        </label>
                        {confirmedExpectedCtc && (
                          <span 
                            className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[100px]"
                            title={confirmedExpectedCtc}
                          >
                            {confirmedExpectedCtc}
                          </span>
                        )}
                      </div>

                      {/* Tier Selection Matrix (Low, Mid, High) */}
                      <div className="space-y-1 font-titillium">
                        {/* Low Tier: Freshers, Entry, Operations, Telecallers (< ₹3L, ₹3-6L) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-9 text-center shrink-0">
                            Low
                          </span>
                          <div className="grid grid-cols-2 gap-1 flex-1">
                            {[
                              { label: '< ₹3 LPA', value: '< ₹3 LPA' },
                              { label: '₹3 - 6 LPA', value: '₹3 - 6 LPA' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setConfirmedExpectedCtc(item.value)}
                                className={`px-1 py-1 rounded text-[10px] font-semibold border transition text-center cursor-pointer ${
                                  confirmedExpectedCtc === item.value
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                                    : 'bg-emerald-50/40 hover:bg-emerald-100/60 text-emerald-800 border-emerald-200/80'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mid Tier: Executives, Specialists, Team Leads (₹6-12L, ₹12-18L) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 w-9 text-center shrink-0">
                            Mid
                          </span>
                          <div className="grid grid-cols-2 gap-1 flex-1">
                            {[
                              { label: '₹6 - 12 LPA', value: '₹6 - 12 LPA' },
                              { label: '₹12 - 18 LPA', value: '₹12 - 18 LPA' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setConfirmedExpectedCtc(item.value)}
                                className={`px-1 py-1 rounded text-[10px] font-semibold border transition text-center cursor-pointer ${
                                  confirmedExpectedCtc === item.value
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                                    : 'bg-blue-50/40 hover:bg-blue-100/60 text-blue-800 border-blue-200/80'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* High Tier: Senior Specialists, Tech Leads, Leadership (₹18-28L, ₹28+L) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 w-9 text-center shrink-0">
                            High
                          </span>
                          <div className="grid grid-cols-2 gap-1 flex-1">
                            {[
                              { label: '₹18 - 28 LPA', value: '₹18 - 28 LPA' },
                              { label: '₹28+ LPA', value: '₹28+ LPA' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setConfirmedExpectedCtc(item.value)}
                                className={`px-1 py-1 rounded text-[10px] font-semibold border transition text-center cursor-pointer ${
                                  confirmedExpectedCtc === item.value
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-bold'
                                    : 'bg-purple-50/40 hover:bg-purple-100/60 text-purple-800 border-purple-200/80'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exact / Custom Expected CTC Input */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100">
                      <input
                        type="text"
                        value={confirmedExpectedCtc}
                        onChange={(e) => setConfirmedExpectedCtc(e.target.value)}
                        placeholder="Or type custom (e.g. ₹4.5 LPA)..."
                        className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-titillium"
                      />
                    </div>
                  </div>

                  {/* Negotiation (Yes / No 2 Options) */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block font-titillium">
                          Negotiable? <span className="text-rose-500">*</span>
                        </label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          isNegotiable === 'yes'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isNegotiable === 'yes' ? 'Flexible' : 'Fixed'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsNegotiable('yes')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                            isNegotiable === 'yes'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>✓ Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsNegotiable('no')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                            isNegotiable === 'no'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>✕ No</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 font-titillium">
                      {isNegotiable === 'yes' ? 'Open to counter-offer discussion' : 'Strict minimum compensation'}
                    </p>
                  </div>

                  {/* Confirmed Notice Period */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block font-titillium">
                          Notice Period <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {confirmedNoticePeriod.includes('Immediate') ? 'Fast Joiner' : 'Standard'}
                        </span>
                      </div>
                      <select
                        value={confirmedNoticePeriod}
                        onChange={(e) => setConfirmedNoticePeriod(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-700 focus:outline-none focus:border-blue-500 cursor-pointer font-titillium"
                      >
                        <option value="Immediate">Immediate / Serving Notice</option>
                        <option value="15 Days (Serving Notice)">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="45 Days">45 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 font-titillium">
                      {confirmedNoticePeriod.includes('Immediate') || confirmedNoticePeriod.includes('15 Days')
                        ? 'Available for early onboarding'
                        : 'Standard notice period buffer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 6: Reason for Leaving (With Dynamic 'Other' Input) & Relocation Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 block">
                      Reason for Leaving <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Career Transition</span>
                  </div>

                  <select
                    value={reasonForLeaving}
                    onChange={(e) => setReasonForLeaving(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Better Career Growth / Challenging Role">Better Career Growth / Challenging Role</option>
                    <option value="Seeking Higher Compensation / Market CTC">Seeking Higher Compensation / Market CTC</option>
                    <option value="Better Work-Life Balance / Culture">Better Work-Life Balance / Culture</option>
                    <option value="Relocation / Proximity to Family">Relocation / Proximity to Family</option>
                    <option value="Company Restructuring / Team Downsizing">Company Restructuring / Team Downsizing</option>
                    <option value="Other">Other (Specify Custom Reason)</option>
                  </select>

                  {/* Dynamic Custom Input when 'Other' is selected */}
                  {reasonForLeaving === 'Other' && (
                    <div className="animate-slide-up pt-1">
                      <label className="text-[10px] font-bold text-blue-800 block mb-0.5">
                        Specify Reason for Leaving:
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={customReasonForLeaving}
                        onChange={(e) => setCustomReasonForLeaving(e.target.value)}
                        placeholder="Type candidate's specific reason for leaving..."
                        className="w-full px-3.5 py-2 rounded-lg bg-blue-50/60 border border-blue-300 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 block">
                      Relocation & Work Mode Preference
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeDialerCandidate.atsMatchScore}% ATS Match
                    </span>
                  </div>

                  <select
                    value={relocationPref}
                    onChange={(e) => setRelocationPref(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Open to Hybrid">Open to Hybrid (UrbanGaon Tech Campus)</option>
                    <option value="Immediate Relocate">Ready for Immediate Relocation</option>
                    <option value="Prefers Remote">Prefers Remote / Flexible Hours</option>
                    <option value="Current City Only">Prefers Current City Only</option>
                  </select>

                  <p className="text-[10px] text-slate-400 pt-0.5">
                    Job: {activeDialerCandidate.jobAppliedFor} • Sourced via {activeDialerCandidate.source.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Row 7: Call Outcome & Disposition */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Call Outcome & Evaluation Disposition <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold">
                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
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

                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
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

                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
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

                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
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

                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
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

                  <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
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

              {/* Conditional R1 Booking */}
              {disposition === 'connected_screening_passed' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3 animate-slide-up text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-600" />
                      1-Click Instant Round 1 Technical Interview Booking
                    </h4>
                    <label className="flex items-center gap-2 font-bold text-emerald-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promoteToInterview}
                        onChange={(e) => setPromoteToInterview(e.target.checked)}
                        className="rounded text-emerald-600 w-4 h-4"
                      />
                      <span>Schedule Interview Now</span>
                    </label>
                  </div>

                  {promoteToInterview && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-emerald-700 block mb-1">Interview Date</label>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-emerald-700 block mb-1">Start Time</label>
                        <input
                          type="text"
                          value={interviewStartTime}
                          onChange={(e) => setInterviewStartTime(e.target.value)}
                          placeholder="11:00 AM"
                          className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-emerald-700 block mb-1">Interviewer (Lead/CEO)</label>
                        <input
                          type="text"
                          value={interviewerName}
                          onChange={(e) => setInterviewerName(e.target.value)}
                          placeholder="Akash Das (CEO / Lead)"
                          className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Callback Scheduler */}
              {disposition === 'connected_callback_requested' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2.5 animate-slide-up text-xs">
                  <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                    <Calendar size={16} /> Schedule Follow-up Callback
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-purple-700 block mb-1">Callback Date</label>
                      <input
                        type="date"
                        value={followUpDate || todayStr}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-purple-700 block mb-1">Callback Time</label>
                      <input
                        type="text"
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        placeholder="e.g. 04:00 PM"
                        className="w-full p-2.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Screening Notes & Recruiter Ratings */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Telephonic Screening Notes & Recruiter Feedback
                  </h4>
                  <div className="flex items-center gap-5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Communication:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          onClick={() => setCommRating(star)}
                          className={`cursor-pointer ${star <= commRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-semibold">Tech Fit:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
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
                  className="w-full p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Row 10: Tentative Date of Interview (Matching user specification) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={15} className="text-blue-600" />
                    <span>Tentative Date of Interview</span>
                    <span className="text-rose-500 font-normal">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Candidate Agreed Timeline
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                  <div>
                    <input
                      type="date"
                      value={tentativeDate}
                      onChange={(e) => {
                        setTentativeDate(e.target.value);
                        setInterviewDate(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-blue-300 text-xs font-bold text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Agreed target date for the candidate to appear for technical screening / Round 1 interview.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Bottom Sticky Footer */}
            <div className="shrink-0 px-6 sm:px-10 py-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Screening Recruiter:</span>
                <strong className="text-slate-800 font-bold bg-slate-100 px-2.5 py-1 rounded-md">{recruiterName}</strong>
                <span className="text-slate-400 hidden sm:inline">• Live real-time ATS & Dossier Auto-Sync</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveDialerCandidate(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveCallRecord}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>Save Call & Sync Everywhere</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK FOLLOW-UP CALLBACK MODAL                                   */}
      {/* ========================================================================= */}
      {quickFollowUpCand && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-slate-900 my-auto animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Schedule Callback Follow-up</h3>
                <p className="text-xs text-slate-500">{quickFollowUpCand.name} ({quickFollowUpCand.phone})</p>
              </div>
              <button
                onClick={() => setQuickFollowUpCand(null)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickFollowUpSave}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Save Callback
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
