import React from 'react';
import { 
  Plus, 
  Download, 
  Eye, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  UserCheck, 
  Filter,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate, CandidateStatus, CandidateSource } from '../types';

export const CandidateKanban: React.FC = () => {
  const { 
    candidates, 
    jobs, 
    filters, 
    setFilters, 
    updateCandidateStatus, 
    updateCandidateRating, 
    setSelectedCandidate, 
    setPreviewResumeCandidate,
    downloadResume,
    bulkDownloadResumes
  } = useRecruitment();

  const columns: { status: CandidateStatus; label: string; color: string; border: string; bg: string }[] = [
    { status: 'applied', label: 'Applied', color: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-900/60' },
    { status: 'screening', label: 'Screening', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-950/20' },
    { status: 'shortlisted', label: 'Shortlisted', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-950/20' },
    { status: 'interview_r1', label: 'Interview R1', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-950/20' },
    { status: 'interview_r2', label: 'Interview R2', color: 'text-fuchsia-400', border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-950/20' },
    { status: 'offered', label: 'Offered', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' },
    { status: 'joined', label: 'Joined / Hired', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20' }
  ];

  const sourceBadges: Record<CandidateSource, { label: string; class: string }> = {
    naukri: { label: 'Naukri', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    indeed: { label: 'Indeed', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    apna: { label: 'Apna.co', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    internshala: { label: 'Internshala', class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    referral: { label: 'Referral', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    if (filters.source !== 'all' && cand.source !== filters.source) return false;
    if (filters.jobId !== 'all' && cand.jobId !== filters.jobId) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match = 
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        cand.jobAppliedFor.toLowerCase().includes(q) ||
        cand.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getNextStatus = (current: CandidateStatus): CandidateStatus | null => {
    const order: CandidateStatus[] = ['applied', 'screening', 'shortlisted', 'interview_r1', 'interview_r2', 'offered', 'joined'];
    const idx = order.indexOf(current);
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: CandidateStatus): CandidateStatus | null => {
    const order: CandidateStatus[] = ['applied', 'screening', 'shortlisted', 'interview_r1', 'interview_r2', 'offered', 'joined'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <Filter size={14} className="text-indigo-400" />
            Filters:
          </div>

          {/* Source Dropdown */}
          <select
            value={filters.source}
            onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Sources (Naukri, LinkedIn, Indeed...)</option>
            <option value="naukri">Naukri.com</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="urbangaon">UrbanGaon Careers</option>
            <option value="internshala">Internshala</option>
            <option value="referral">Internal Referrals</option>
          </select>

          {/* Job Role Dropdown */}
          <select
            value={filters.jobId}
            onChange={(e) => setFilters((prev) => ({ ...prev, jobId: e.target.value }))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 max-w-xs truncate"
          >
            <option value="all">All Active Job Roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(filters.source !== 'all' || filters.jobId !== 'all' || filters.searchQuery) && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, source: 'all', jobId: 'all', searchQuery: '' }))}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredCandidates.length}</strong> candidates
          </span>
          <button
            onClick={() => bulkDownloadResumes(filteredCandidates.map(c => c.id))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <FileDown size={13} />
            Download Visible Resumes
          </button>
        </div>
      </div>

      {/* Kanban Stage Columns Container (Horizontal Scrollable) */}
      <div className="flex items-start gap-4 overflow-x-auto pb-6 min-h-[650px]">
        {columns.map((col) => {
          const colCandidates = filteredCandidates.filter((c) => c.status === col.status);

          return (
            <div
              key={col.status}
              className={`w-80 shrink-0 flex flex-col rounded-2xl border ${col.border} ${col.bg} p-3.5 max-h-[calc(100vh-200px)]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</h3>
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300">
                    {colCandidates.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colCandidates.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-800/60 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium">No candidates in {col.label}</p>
                  </div>
                ) : (
                  colCandidates.map((cand) => {
                    const badge = sourceBadges[cand.source];
                    const nextSt = getNextStatus(cand.status);
                    const prevSt = getPrevStatus(cand.status);

                    return (
                      <div
                        key={cand.id}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md group flex flex-col justify-between gap-3"
                      >
                        <div>
                          {/* Top row: Source badge + ATS Match */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.class}`}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {cand.atsMatchScore}% ATS
                            </span>
                          </div>

                          {/* Candidate Name & Role */}
                          <h4
                            onClick={() => setSelectedCandidate(cand)}
                            className="text-xs font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-1"
                          >
                            {cand.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cand.jobAppliedFor}</p>

                          {/* Quick Info Tags */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{cand.experienceYears}y Exp</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{cand.expectedSalary}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{cand.noticePeriod}</span>
                          </div>

                          {/* Recruiter & Star Rating */}
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="truncate max-w-[130px]">👤 {cand.recruiterAssigned || 'Unassigned'}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={11}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCandidateRating(cand.id, star);
                                  }}
                                  className={`cursor-pointer ${
                                    star <= cand.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-600 hover:text-amber-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Row: Resume Download + Stage Navigation */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                          {/* Resume Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewResumeCandidate(cand)}
                              title="Preview Resume"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() => downloadResume(cand.id)}
                              title="Instant Real-Time PDF Download"
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition shadow"
                            >
                              <Download size={11} />
                              <span>Resume</span>
                            </button>
                          </div>

                          {/* Stage Navigation Arrows */}
                          <div className="flex items-center gap-1">
                            {prevSt && (
                              <button
                                onClick={() => updateCandidateStatus(cand.id, prevSt)}
                                title={`Move back to ${prevSt}`}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                              >
                                <ChevronLeft size={13} />
                              </button>
                            )}
                            {nextSt && (
                              <button
                                onClick={() => updateCandidateStatus(cand.id, nextSt)}
                                title={`Advance to ${nextSt}`}
                                className="p-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white transition flex items-center gap-0.5 px-1.5 text-[10px] font-bold"
                              >
                                <span>Advance</span>
                                <ChevronRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
