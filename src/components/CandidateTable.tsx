import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate, CandidateStatus, CandidateSource } from '../types';

export const CandidateTable: React.FC = () => {
  const { 
    candidates, 
    jobs, 
    filters, 
    setFilters, 
    updateCandidateStatus, 
    setSelectedCandidate, 
    setPreviewResumeCandidate, 
    downloadResume, 
    exportToCSV 
  } = useRecruitment();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🔵' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: '💼' },
    indeed: { label: 'Indeed', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: '🔷' },
    apna: { label: 'Apna.co', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🏠' },
    internshala: { label: 'Internshala', class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: '🎓' },
    referral: { label: 'Referral', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '🤝' }
  };

  const statusOptions: { value: CandidateStatus; label: string; color: string }[] = [
    { value: 'applied', label: 'Applied', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    { value: 'screening', label: 'Screening', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    { value: 'interview_r1', label: 'Interview R1', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    { value: 'interview_r2', label: 'Interview R2', color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' },
    { value: 'offered', label: 'Offered', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { value: 'joined', label: 'Joined / Hired', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
  ];

  // Quick stats counts
  const totalCount = candidates.length;
  const inReviewCount = candidates.filter((c) => ['screening', 'shortlisted'].includes(c.status)).length;
  const interviewCount = candidates.filter((c) => ['interview_r1', 'interview_r2'].includes(c.status)).length;
  const hiredCount = candidates.filter((c) => c.status === 'joined').length;

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    if (filters.source !== 'all' && cand.source !== filters.source) return false;
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
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      
      {/* 4 Simple Top HR Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'all' }))}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition shadow-sm"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Applicants</span>
          <span className="text-2xl font-black text-white mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-blue-400 mt-1 block">All Portals</span>
        </div>

        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'screening' }))}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition shadow-sm"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Under Review</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">{inReviewCount}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Screening / Shortlisted</span>
        </div>

        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'interview_r1' }))}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition shadow-sm"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">In Interviews</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">{interviewCount}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Round 1 & Round 2</span>
        </div>

        <div 
          onClick={() => setFilters((prev) => ({ ...prev, status: 'joined' }))}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition shadow-sm"
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Selected / Hired</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{hiredCount}</span>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">Offer Accepted</span>
        </div>
      </div>

      {/* Clean Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, role, skill, phone..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Filter by Job Role */}
          <select
            value={filters.jobId}
            onChange={(e) => setFilters((prev) => ({ ...prev, jobId: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Job Positions ({jobs.length})</option>
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
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sources (Naukri, LinkedIn, Indeed...)</option>
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
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 transition"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
        >
          <Download size={13} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Main Candidate Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Candidate Name & Contact</th>
                <th className="py-3.5 px-4">Applied Job Role</th>
                <th className="py-3.5 px-4">Source Portal</th>
                <th className="py-3.5 px-4">Experience & CTC</th>
                <th className="py-3.5 px-4">Hiring Stage</th>
                <th className="py-3.5 px-5 text-right">HR Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <User size={32} className="mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No candidates match your current filter.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
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
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* Candidate Name & Contact */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-sm shrink-0">
                            {cand.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCandidate(cand)}
                              className="font-bold text-white hover:text-blue-400 transition text-left"
                            >
                              {cand.name}
                            </button>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail size={11} className="text-slate-500" />
                                {cand.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone size={11} className="text-slate-500" />
                                {cand.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Applied Job Role */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-200 block">{cand.jobAppliedFor}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {cand.location}
                        </span>
                      </td>

                      {/* Source Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${source.class}`}>
                          <span>{source.icon}</span>
                          <span>{source.label}</span>
                        </span>
                      </td>

                      {/* Experience & Expected CTC */}
                      <td className="py-4 px-4">
                        <div className="text-slate-200 font-medium">
                          {cand.experienceYears} Years Exp
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          CTC: <strong className="text-slate-300">{cand.expectedSalary}</strong> • {cand.noticePeriod}
                        </div>
                      </td>

                      {/* Stage Selector Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={cand.status}
                          onChange={(e) => updateCandidateStatus(cand.id, e.target.value as CandidateStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${currentStatus.color}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* HR Quick Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            title="View Full Candidate Profile & Notes"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => setPreviewResumeCandidate(cand)}
                            title="Preview ATS Resume"
                            className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => downloadResume(cand.id)}
                            title="Download PDF Resume"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition"
                          >
                            <Download size={14} />
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
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredCandidates.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-white">{Math.min(currentPage * pageSize, filteredCandidates.length)}</strong> of{' '}
            <strong className="text-white">{filteredCandidates.length}</strong> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 text-slate-300 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
