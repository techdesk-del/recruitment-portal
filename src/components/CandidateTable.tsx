import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  User, 
  Phone, 
  PhoneCall,
  Mail, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ArrowRight, 
  Filter 
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateStatus, CandidateSource } from '../types';
import { PortalLogo } from './PortalLogo';

export const CandidateTable: React.FC = () => {
  const { 
    candidates, 
    jobs, 
    filters, 
    setFilters, 
    updateCandidateStatus, 
    setSelectedCandidate, 
    setPreviewResumeCandidate, 
    setActiveDialerCandidate,
    downloadResume, 
    exportToCSV,
    activeView,
    setActiveView
  } = useRecruitment();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-50 text-sky-700 border-sky-200', icon: '💼' },
    indeed: { label: 'Indeed', class: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🔷' },
    apna: { label: 'Apna.co', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏠' },
    internshala: { label: 'Internshala', class: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '🎓' },
    referral: { label: 'Referral', class: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🤝' }
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

  // Candidates in active portal or general scope
  const scopedCandidates = candidates.filter((cand) => {
    if (filters.source !== 'all' && cand.source !== filters.source) return false;
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
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        cand.jobAppliedFor.toLowerCase().includes(q) ||
        cand.location.toLowerCase().includes(q) ||
        cand.phone.includes(q) ||
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
    internshala: 'Internshala Candidates'
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      
      {/* Portal Header Title if specific portal is selected */}
      {filters.source !== 'all' && (
        <div className="flex items-center justify-between bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xl">{sourceBadges[filters.source]?.icon || '📋'}</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {portalTitles[filters.source] || `${filters.source.toUpperCase()} Candidates`}
              </h2>
              <p className="text-xs text-slate-400 font-normal">
                Showing {filteredCandidates.length} candidate applications sourced from this portal
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
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, role, skill, phone..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition font-medium"
            />
          </div>

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
            value={filters.source}
            onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">All Sources</option>
            <option value="naukri">Naukri.com</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="urbangaon">UrbanGaon Careers</option>
            <option value="apna">Apna.co</option>
            <option value="internshala">Internshala</option>
            <option value="referral">Employee Referrals</option>
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

          {(filters.source !== 'all' || filters.status !== 'all' || filters.jobId !== 'all' || filters.searchQuery) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 px-2 py-1 transition font-medium"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Candidate Table in Light Mode */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Candidate Name & Contact</th>
                <th className="py-3 px-4">Applied Job Role</th>
                <th className="py-3 px-4">Source Portal</th>
                <th className="py-3 px-4">Experience & CTC</th>
                <th className="py-3 px-4">Hiring Stage</th>
                <th className="py-3 px-5 text-right">Actions</th>
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
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition text-left text-sm"
                            >
                              {cand.name}
                            </button>
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

                      {/* Source Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${source.class}`}>
                          <PortalLogo source={cand.source} size={13} />
                          <span>{source.label}</span>
                        </span>
                      </td>

                      {/* Experience & Expected CTC */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium">
                          {cand.experienceYears} Years Exp
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-normal">
                          CTC: <strong className="text-slate-700 font-semibold">{cand.expectedSalary}</strong> • {cand.noticePeriod}
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
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveDialerCandidate(cand);
                              setActiveView('calling');
                            }}
                            title="Call Candidate (Launch Telecaller)"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition"
                          >
                            <PhoneCall size={12} />
                            <span>Call</span>
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
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-normal">
          <div>
            Showing <strong className="text-slate-700 font-semibold">{filteredCandidates.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-700 font-semibold">{Math.min(currentPage * pageSize, filteredCandidates.length)}</strong> of{' '}
            <strong className="text-slate-700 font-semibold">{filteredCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-slate-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
