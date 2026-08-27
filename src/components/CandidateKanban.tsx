import React from 'react';
import { 
  Download, 
  Eye, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Filter,
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
    { status: 'applied', label: 'Applied', color: 'text-slate-700', border: 'border-slate-300', bg: 'bg-slate-100/90' },
    { status: 'screening', label: 'Screening', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/70' },
    { status: 'shortlisted', label: 'Shortlisted', color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50/70' },
    { status: 'interview_r1', label: 'Interview R1', color: 'text-purple-700', border: 'border-purple-200', bg: 'bg-purple-50/70' },
    { status: 'interview_r2', label: 'Interview R2', color: 'text-fuchsia-700', border: 'border-fuchsia-200', bg: 'bg-fuchsia-50/70' },
    { status: 'offered', label: 'Offered', color: 'text-amber-800', border: 'border-amber-200', bg: 'bg-amber-50/70' },
    { status: 'joined', label: 'Joined / Hired', color: 'text-emerald-800', border: 'border-emerald-200', bg: 'bg-emerald-50/70' }
  ];

  const sourceBadges: Record<CandidateSource, { label: string; class: string }> = {
    naukri: { label: 'Naukri', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-50 text-sky-700 border-sky-200' },
    indeed: { label: 'Indeed', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    apna: { label: 'Apna.co', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    internshala: { label: 'Internshala', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    referral: { label: 'Referral', class: 'bg-purple-50 text-purple-700 border-purple-200' }
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
    <div className="space-y-5 animate-fade-in pb-12">
      
      {/* Top Filter Bar in Light Mode */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
            <Filter size={14} className="text-blue-600" />
            Filters:
          </div>

          {/* Source Dropdown */}
          <select
            value={filters.source}
            onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
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
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 max-w-xs truncate"
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
              className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredCandidates.length}</strong> candidates
          </span>
          <button
            onClick={() => bulkDownloadResumes(filteredCandidates.map(c => c.id))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
          >
            <FileDown size={13} />
            <span>Download Visible Resumes</span>
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider ${col.color}`}>{col.label}</h3>
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-700 shadow-2xs">
                    {colCandidates.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colCandidates.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-300 rounded-xl bg-white/50">
                    <p className="text-xs text-slate-400 font-medium">No candidates in {col.label}</p>
                  </div>
                ) : (
                  colCandidates.map((cand) => {
                    const badge = sourceBadges[cand.source];
                    const nextSt = getNextStatus(cand.status);
                    const prevSt = getPrevStatus(cand.status);

                    return (
                      <div
                        key={cand.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-xs group flex flex-col justify-between gap-3"
                      >
                        <div>
                          {/* Top row: Source badge + ATS Match */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.class}`}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {cand.atsMatchScore}% ATS
                            </span>
                          </div>

                          {/* Candidate Name & Role */}
                          <h4
                            onClick={() => setSelectedCandidate(cand)}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition line-clamp-1"
                          >
                            {cand.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cand.jobAppliedFor}</p>

                          {/* Quick Info Tags */}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{cand.experienceYears}y Exp</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{cand.expectedSalary}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{cand.noticePeriod}</span>
                          </div>

                          {/* Recruiter & Star Rating */}
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
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
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-slate-300 hover:text-amber-400'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Row: Resume Download + Stage Navigation */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Resume Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewResumeCandidate(cand)}
                              title="Preview Resume"
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() => downloadResume(cand.id)}
                              title="Download PDF"
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-xs"
                            >
                              <Download size={11} />
                              <span>PDF</span>
                            </button>
                          </div>

                          {/* Stage Navigation Arrows */}
                          <div className="flex items-center gap-1">
                            {prevSt && (
                              <button
                                onClick={() => updateCandidateStatus(cand.id, prevSt)}
                                title={`Move back to ${prevSt}`}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              >
                                <ChevronLeft size={13} />
                              </button>
                            )}
                            {nextSt && (
                              <button
                                onClick={() => updateCandidateStatus(cand.id, nextSt)}
                                title={`Advance to ${nextSt}`}
                                className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-0.5 px-1.5 text-[10px] font-bold border border-blue-200"
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
