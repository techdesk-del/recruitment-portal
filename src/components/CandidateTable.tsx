import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  Layers, 
  FileSpreadsheet,
  CheckCircle2
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
    updateCandidateRating, 
    assignRecruiter,
    setSelectedCandidate, 
    setPreviewResumeCandidate, 
    downloadResume, 
    bulkDownloadResumes,
    bulkUpdateStatus,
    exportToCSV 
  } = useRecruitment();

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🔵' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: '💼' },
    indeed: { label: 'Indeed', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: '🔷' },
    apna: { label: 'Apna.co', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon', class: 'bg-teal-500/10 text-teal-400 border-teal-500/20', icon: '🌿' },
    internshala: { label: 'Internshala', class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: '🎓' },
    referral: { label: 'Referral', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '🤝' }
  };

  const statusColors: Record<CandidateStatus, string> = {
    applied: 'bg-slate-800 text-slate-300 border-slate-700',
    screening: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shortlisted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    interview_r1: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    interview_r2: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    offered: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    joined: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    if (filters.source !== 'all' && cand.source !== filters.source) return false;
    if (filters.status !== 'all' && cand.status !== filters.status) return false;
    if (filters.jobId !== 'all' && cand.jobId !== filters.jobId) return false;
    if (filters.recruiter !== 'all' && cand.recruiterAssigned !== filters.recruiter) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        cand.jobAppliedFor.toLowerCase().includes(q) ||
        cand.location.toLowerCase().includes(q) ||
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

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedCandidateIds.length === paginatedCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(paginatedCandidates.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: CandidateStatus) => {
    bulkUpdateStatus(selectedCandidateIds, status);
    setSelectedCandidateIds([]);
  };

  const isAllSelected =
    paginatedCandidates.length > 0 &&
    selectedCandidateIds.length === paginatedCandidates.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Filter and Search Hub */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, role, skill tags, or location..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <FileSpreadsheet size={14} className="text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={() => bulkDownloadResumes(filteredCandidates.map((c) => c.id))}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Download size={14} />
              Download All Resumes ({filteredCandidates.length})
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Filter size={13} className="text-indigo-400" /> Filter by:
          </div>

          {/* Source Platform */}
          <select
            value={filters.source}
            onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value as any }))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Sources (Naukri, LinkedIn, Indeed, Direct...)</option>
            <option value="naukri">Naukri.com</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="urbangaon">UrbanGaon Portal</option>
            <option value="internshala">Internshala</option>
            <option value="referral">Internal Referrals</option>
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Stages & Statuses</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_r1">Interview Round 1</option>
            <option value="interview_r2">Interview Round 2</option>
            <option value="offered">Offered</option>
            <option value="joined">Joined / Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Job Role */}
          <select
            value={filters.jobId}
            onChange={(e) => setFilters((prev) => ({ ...prev, jobId: e.target.value }))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 max-w-xs truncate"
          >
            <option value="all">All Job Requisitions</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Recruiter */}
          <select
            value={filters.recruiter}
            onChange={(e) => setFilters((prev) => ({ ...prev, recruiter: e.target.value }))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Recruiters</option>
            <option value="Priya Sharma">Priya Sharma</option>
            <option value="Amit Singh">Amit Singh</option>
            <option value="Neha Verma">Neha Verma</option>
            <option value="Rajesh Gupta">Rajesh Gupta</option>
          </select>

          {(filters.source !== 'all' || filters.status !== 'all' || filters.jobId !== 'all' || filters.recruiter !== 'all' || filters.searchQuery) && (
            <button
              onClick={() => setFilters({
                searchQuery: '',
                source: 'all',
                status: 'all',
                jobId: 'all',
                experienceRange: 'all',
                recruiter: 'all',
                dateRange: 'all',
                minRating: 0
              })}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium ml-auto"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar (when candidates selected) */}
      {selectedCandidateIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {selectedCandidateIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">Candidates Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => bulkDownloadResumes(selectedCandidateIds)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
            >
              <Download size={13} />
              Bulk Download Resumes (PDF)
            </button>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value as CandidateStatus);
                }
              }}
              defaultValue=""
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="" disabled>Move Status to...</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_r1">Interview Round 1</option>
              <option value="interview_r2">Interview Round 2</option>
              <option value="offered">Offer Extended</option>
              <option value="joined">Hired / Joined</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={() => setSelectedCandidateIds([])}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Candidate Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-bold border-b border-slate-800 uppercase tracking-wider">
                <th className="p-4 w-10">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-200">
                    {isAllSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Applied Role & Dept</th>
                <th className="p-4">Source Platform</th>
                <th className="p-4">Exp & Notice</th>
                <th className="p-4">ATS Match</th>
                <th className="p-4">Status Stage</th>
                <th className="p-4 text-center">Real-Time Resume</th>
                <th className="p-4">Recruiter</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-xs">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No candidates found matching current filters.</p>
                    <button
                      onClick={() => setFilters({
                        searchQuery: '',
                        source: 'all',
                        status: 'all',
                        jobId: 'all',
                        experienceRange: 'all',
                        recruiter: 'all',
                        dateRange: 'all',
                        minRating: 0
                      })}
                      className="mt-2 text-indigo-400 hover:underline"
                    >
                      Clear search filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => {
                  const isSelected = selectedCandidateIds.includes(cand.id);
                  const badge = sourceBadges[cand.source];

                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <button
                          onClick={() => handleSelectOne(cand.id)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          {isSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                        </button>
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="p-4">
                        <div
                          onClick={() => setSelectedCandidate(cand)}
                          className="font-bold text-white text-sm hover:text-indigo-400 cursor-pointer transition"
                        >
                          {cand.name}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{cand.email}</div>
                        <div className="text-slate-500 text-[10px]">{cand.location}</div>
                      </td>

                      {/* Applied Role */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200 line-clamp-1 max-w-[200px]">
                          {cand.jobAppliedFor}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{cand.department}</div>
                      </td>

                      {/* Source Platform Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${badge.class}`}>
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Exp & Notice */}
                      <td className="p-4">
                        <div className="text-slate-200 font-semibold">{cand.experienceYears}y Exp</div>
                        <div className="text-slate-400 text-[11px]">Notice: {cand.noticePeriod}</div>
                        <div className="text-slate-500 text-[10px]">Exp: {cand.expectedSalary}</div>
                      </td>

                      {/* ATS Score & Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                            {cand.atsMatchScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={11}
                              onClick={() => updateCandidateRating(cand.id, star)}
                              className={`cursor-pointer ${
                                star <= cand.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600 hover:text-amber-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={cand.status}
                          onChange={(e) => updateCandidateStatus(cand.id, e.target.value as CandidateStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                            statusColors[cand.status]
                          }`}
                        >
                          <option value="applied" className="bg-slate-900 text-slate-200">Applied</option>
                          <option value="screening" className="bg-slate-900 text-slate-200">Screening</option>
                          <option value="shortlisted" className="bg-slate-900 text-slate-200">Shortlisted</option>
                          <option value="interview_r1" className="bg-slate-900 text-slate-200">Interview R1</option>
                          <option value="interview_r2" className="bg-slate-900 text-slate-200">Interview R2</option>
                          <option value="offered" className="bg-slate-900 text-slate-200">Offered</option>
                          <option value="joined" className="bg-slate-900 text-slate-200">Joined / Hired</option>
                          <option value="rejected" className="bg-slate-900 text-slate-200">Rejected</option>
                        </select>
                      </td>

                      {/* Real-Time Resume Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPreviewResumeCandidate(cand)}
                            title="Interactive In-App Resume Preview"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => downloadResume(cand.id)}
                            title={`Instant PDF Download from ${cand.source.toUpperCase()}`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-900/30 transition active:scale-95"
                          >
                            <Download size={12} />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>

                      {/* Recruiter Assigned */}
                      <td className="p-4">
                        <select
                          value={cand.recruiterAssigned || ''}
                          onChange={(e) => assignRecruiter(cand.id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Unassigned</option>
                          <option value="Priya Sharma">Priya Sharma</option>
                          <option value="Amit Singh">Amit Singh</option>
                          <option value="Neha Verma">Neha Verma</option>
                          <option value="Rajesh Gupta">Rajesh Gupta</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1 ml-auto transition"
                        >
                          Profile <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-200">
              {Math.min(currentPage * pageSize, filteredCandidates.length)}
            </strong>{' '}
            of <strong className="text-slate-200">{filteredCandidates.length}</strong> total candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
