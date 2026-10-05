import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  User, 
  Phone, 
  PhoneCall, 
  Mail, 
  MapPin, 
  RotateCcw, 
  ArrowRight, 
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { useAuth } from '../../context/AuthContext';
import { CandidateStatus, CandidateSource } from '../../types';
import { PortalLogo, Pagination } from '../common';

export const CandidateTable: React.FC = () => {
  const { can } = useAuth();
  const { 
    candidates, 
    jobs, 
    filters, 
    setFilters, 
    updateCandidateStatus, 
    setSelectedCandidate, 
    openCandidateModal,
    setPreviewResumeCandidate, 
    setActiveDialerCandidate,
    shiftCandidateToCalling,
    downloadResume, 
    deleteCandidate,
    exportToCSV,
    exportToExcel,
    activeView,
    setActiveView
  } = useRecruitment();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Horizontal Edge Hover Auto-Scroll ---
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!tableScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback((direction: 'left' | 'right', speed: number = 8) => {
    stopAutoScroll();
    const scrollStep = () => {
      const el = tableScrollRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;

      if (direction === 'right') {
        if (scrollLeft + clientWidth < scrollWidth - 1) {
          el.scrollLeft += speed;
          scrollAnimRef.current = requestAnimationFrame(scrollStep);
        } else {
          stopAutoScroll();
        }
      } else {
        if (scrollLeft > 1) {
          el.scrollLeft -= speed;
          scrollAnimRef.current = requestAnimationFrame(scrollStep);
        } else {
          stopAutoScroll();
        }
      }
      updateScrollState();
    };
    scrollAnimRef.current = requestAnimationFrame(scrollStep);
  }, [stopAutoScroll, updateScrollState]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      stopAutoScroll();
    };
  }, [updateScrollState, stopAutoScroll]);

  // Adaptive edge hover detection on the table container
  const handleTableMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = tableScrollRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = rect.width;
    const edgeThreshold = 110; // 110px threshold from left & right border

    if (mouseX > width - edgeThreshold && container.scrollLeft + container.clientWidth < container.scrollWidth - 2) {
      const intensity = (mouseX - (width - edgeThreshold)) / edgeThreshold;
      const speed = Math.max(4, Math.round(intensity * 14));
      startAutoScroll('right', speed);
    } else if (mouseX < edgeThreshold && container.scrollLeft > 2) {
      const intensity = (edgeThreshold - mouseX) / edgeThreshold;
      const speed = Math.max(4, Math.round(intensity * 14));
      startAutoScroll('left', speed);
    } else {
      stopAutoScroll();
    }
  };

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-50 text-sky-700 border-sky-200', icon: '💼' },
    indeed: { label: 'Indeed', class: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🔷' },
    apna: { label: 'Apna.co', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏠' },
    internshala: { label: 'Internshala', class: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '🎓' },
    referral: { label: 'Referral', class: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🤝' },
    newspaper: { label: 'Newspaper AD', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: '📰' },
    other: { label: 'Other', class: 'bg-slate-50 text-slate-700 border-slate-200', icon: '🌐' }
  };

  const statusOptions: { value: CandidateStatus; label: string; color: string }[] = [
    { value: 'applied', label: 'Applied', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { value: 'screening', label: 'Screening', color: 'bg-blue-50 text-blue-700 border-blue-300' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
    { value: 'interview_r1', label: 'Interview R1', color: 'bg-purple-50 text-purple-700 border-purple-300' },
    { value: 'interview_r2', label: 'Interview R2', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300' },
    { value: 'offered', label: 'Offered', color: 'bg-amber-50 text-amber-800 border-amber-300' },
    { value: 'joined', label: 'Joined / Hired', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-300' }
  ];

  // Effective source: if activeView is 'referral', always filter by referral
  const activeSource: CandidateSource | 'all' = 
    activeView === 'referral' 
      ? 'referral' 
      : (filters.source !== 'all' ? filters.source : 'all');

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeSource]);

  // Candidates in active portal or general scope
  const scopedCandidates = candidates.filter((cand) => {
    if (activeSource !== 'all' && cand.source !== activeSource) return false;
    if (filters.referrerId && cand.referralDetails?.employeeId !== filters.referrerId) return false;
    return true;
  });

  // Dynamic quick stats counts based on active scope
  const totalCount = scopedCandidates.length;
  const inReviewCount = scopedCandidates.filter((c) => ['screening', 'shortlisted'].includes(c.status)).length;
  const interviewCount = scopedCandidates.filter((c) => ['interview_r1', 'interview_r2'].includes(c.status)).length;
  const hiredCount = scopedCandidates.filter((c) => c.status === 'joined').length;

  // Filter candidates for table display
  const filteredCandidates = scopedCandidates.filter((cand) => {
    if (filters.status !== 'all' && cand.status !== filters.status) return false;
    if (filters.jobId !== 'all' && cand.jobId !== filters.jobId) return false;
    if (filters.recruiter && filters.recruiter !== 'all' && cand.recruiterAssigned !== filters.recruiter) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        cand.jobAppliedFor.toLowerCase().includes(q) ||
        cand.location.toLowerCase().includes(q) ||
        cand.phone.includes(q) ||
        (cand.recruiterAssigned && cand.recruiterAssigned.toLowerCase().includes(q)) ||
        cand.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      source: 'all',
      referrerId: undefined,
      status: 'all',
      jobId: 'all',
      experienceRange: 'all',
      recruiter: 'all',
      dateRange: 'all',
      minRating: 0
    });
    setActiveView('candidates');
  };

  const portalTitles: Record<string, string> = {
    linkedin: 'LinkedIn EasyApply Candidates',
    naukri: 'Naukri.com Candidates',
    indeed: 'Indeed Candidates',
    apna: 'Apna.co Candidates',
    urbangaon: 'UrbanGaon Careers Candidates',
    internshala: 'Internshala Candidates',
    referral: 'Internal Employee Referral Candidates'
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      
      {/* Portal Header Title if specific portal is selected */}
      {activeSource !== 'all' && (
        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{sourceBadges[activeSource]?.icon || '📋'}</span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {portalTitles[activeSource] || `${activeSource.toUpperCase()} Candidates`}
                </h2>
                <p className="text-xs text-slate-400 font-normal">
                  Showing {filteredCandidates.length} candidate applications {activeSource === 'referral' ? 'referred by internal company employees' : 'sourced from this portal'}
                </p>
              </div>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>View All Sources</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 4 Simple Top HR Metric Cards in Light Mode */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'all' }))}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 cursor-pointer transition shadow-2xs"
        >
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Applicants</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
            {filters.source === 'all' ? 'All Sourced Portals' : `${sourceBadges[filters.source]?.label || filters.source}`}
          </span>
        </div>

        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'screening' }))}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 cursor-pointer transition shadow-2xs"
        >
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Under Review</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">{inReviewCount}</span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Screening / Shortlisted</span>
        </div>

        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'interview_r1' }))}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-500 cursor-pointer transition shadow-2xs"
        >
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">In Interviews</span>
          <span className="text-2xl font-bold text-purple-600 mt-1 block">{interviewCount}</span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Round 1 & Round 2</span>
        </div>

        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'joined' }))}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 cursor-pointer transition shadow-2xs"
        >
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Selected / Hired</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{hiredCount}</span>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Offer Accepted</span>
        </div>
      </div>

      {/* Clean Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        {/* Top Row: Search Input + Candidate Count + Export CSV Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, role, skill, phone..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
            />
          </div>

          {/* Right Action: Candidate Count Badge & Export Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <span className="text-xs text-slate-500 font-medium px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hidden md:inline">
              Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> candidates
            </span>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer shrink-0"
              title="Export Candidate Tracker Sheet"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Filter Dropdowns */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={12} className="text-slate-400" />
            Filter:
          </span>

          {/* Filter by Job Role */}
          <select
            value={filters.jobId}
            onChange={(e) => setFilters((prev) => ({ ...prev, jobId: e.target.value }))}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Positions ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Filter by Portal Source */}
          <select
            value={activeSource}
            onChange={(e) => {
              const val = e.target.value as any;
              setFilters((prev) => ({ ...prev, source: val, referrerId: undefined }));
              if (val === 'referral') {
                setActiveView('referral');
              } else if (activeView === 'referral') {
                setActiveView('candidates');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Sources</option>
            <option value="naukri">Naukri.com</option>
            <option value="newspaper">Newspaper AD</option>
            <option value="apna">Apna.co</option>
            <option value="referral">Direct Referrals</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="urbangaon">UrbanGaon Careers</option>
            <option value="internshala">Internshala</option>
          </select>

          {/* Filter by Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Stages</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Assigned HR Filter */}
          <select
            value={filters.recruiter || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, recruiter: e.target.value }))}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Assigned HRs</option>
            <option value="Dr Rekha Pareek">Dr Rekha Pareek</option>
            <option value="Dr Sharmila Yadav">Dr Sharmila Yadav</option>
            <option value="Satyaveer Singh">Satyaveer Singh</option>
          </select>

          {(filters.source !== 'all' || filters.status !== 'all' || filters.jobId !== 'all' || (filters.recruiter && filters.recruiter !== 'all') || filters.searchQuery) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 px-2 py-1 transition font-semibold"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Candidate Table in Light Mode */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs relative group">
        
        {/* Left Hover Scroll Guide Badge */}
        {canScrollLeft && (
          <div
            onMouseEnter={() => startAutoScroll('left', 11)}
            onMouseLeave={stopAutoScroll}
            onClick={() => tableScrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
            title="Hover or click to scroll left"
            className="absolute left-0 top-0 bottom-14 w-12 z-20 flex items-center justify-start pl-2 bg-gradient-to-r from-white via-white/80 to-transparent cursor-pointer transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
              <ChevronLeft size={18} />
            </div>
          </div>
        )}

        {/* Right Hover Scroll Guide Badge */}
        {canScrollRight && (
          <div
            onMouseEnter={() => startAutoScroll('right', 11)}
            onMouseLeave={stopAutoScroll}
            onClick={() => tableScrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
            title="Hover or click to scroll right"
            className="absolute right-0 top-0 bottom-14 w-12 z-20 flex items-center justify-end pr-2 bg-gradient-to-l from-white via-white/80 to-transparent cursor-pointer transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
              <ChevronRight size={18} />
            </div>
          </div>
        )}

        <div 
          ref={tableScrollRef}
          onMouseMove={handleTableMouseMove}
          onMouseLeave={stopAutoScroll}
          className="overflow-x-auto scroll-smooth"
        >
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                <th 
                  onMouseEnter={() => startAutoScroll('left', 10)}
                  className="py-3 px-5 min-w-[280px]"
                >
                  Candidate Name & Contact
                </th>
                <th className="py-3 px-4 min-w-[200px]">Applied Job Role</th>
                <th className="py-3 px-4 min-w-[160px]">Sourcing Channel</th>
                <th className="py-3 px-4 min-w-[160px]">Assigned HR</th>
                <th className="py-3 px-4 whitespace-nowrap min-w-[140px]">Hiring Stage</th>
                <th 
                  onMouseEnter={() => startAutoScroll('right', 10)}
                  className="py-3 px-4 text-left whitespace-nowrap min-w-[220px]"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <User size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No candidates match your current filter.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw size={11} /> Reset filters to see all applicants
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => {
                  const source = sourceBadges[cand.source];
                  const currentStatus = statusOptions.find((s) => s.value === cand.status) || statusOptions[0];

                  return (
                    <tr 
                      key={cand.id} 
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                            {cand.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition text-left text-sm"
                              >
                                {cand.name}
                              </button>
                              {cand.isCallingQueued && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  <PhoneCall size={9} /> In Calling
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-0.5 font-normal">
                              <span className="flex items-center gap-1">
                                <Mail size={11} className="text-slate-400" />
                                {cand.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone size={11} className="text-slate-400" />
                                {cand.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Applied Job Role */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block text-sm">{cand.jobAppliedFor}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                          <MapPin size={11} className="text-slate-400" /> {cand.location}
                        </span>
                      </td>

                      {/* Sourcing Channel Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${source?.class || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          <PortalLogo source={cand.source} size={15} />
                          <span>{source?.label || cand.source}</span>
                        </span>
                      </td>

                      {/* Assigned HR Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(cand.recruiterAssigned || 'HR').charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">
                            {cand.recruiterAssigned || 'Dr Sharmila Yadav'}
                          </span>
                        </div>
                      </td>

                      {/* Stage Selector Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={cand.status}
                          onChange={(e) => updateCandidateStatus(cand.id, e.target.value as CandidateStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${currentStatus.color}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* HR Quick Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => shiftCandidateToCalling(cand)}
                            title={`Select & Shift ${cand.name} to Calling Desk`}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                              cand.isCallingQueued
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            }`}
                          >
                            <PhoneCall size={12} />
                            <span>{cand.isCallingQueued ? 'Shifted to Calling' : 'Select for Calling'}</span>
                          </button>

                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            title="View Candidate Profile"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition"
                          >
                            Profile
                          </button>

                          <button
                            onClick={() => setPreviewResumeCandidate(cand)}
                            title="Preview Resume"
                            className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            onClick={() => downloadResume(cand.id)}
                            title="Download PDF Resume"
                            className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                          >
                            <Download size={13} />
                          </button>

                          {can('delete_candidate') && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete candidate "${cand.name}" (${cand.jobAppliedFor})? This will remove all their records.`)) {
                                  deleteCandidate(cand.id);
                                }
                              }}
                              title={`Delete Candidate ${cand.name} (Admin Only)`}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCandidates.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          itemLabel="candidates"
        />

      </div>
    </div>
  );
};
