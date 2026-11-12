import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  ArrowRight, 
  DollarSign, 
  Search, 
  FileText, 
  X, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Award, 
  Clock, 
  ExternalLink,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  Ban,
  Plus,
  Pencil,
  Target
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { CandidateSource, JobPosting } from '../../types';
import { PortalLogo, Pagination } from '../common';
import { EditJobModal } from '../modals/EditJobModal';

export const JobsView: React.FC = () => {
  const { jobs, candidates, setFilters, setActiveView, updateJobStatus, deleteJob, setIsAddJobModalOpen } = useRecruitment();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'filled' | 'closed' | 'paused'>('all');
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobPosting | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Departments list for filter pills
  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => {
      if (j.department) set.add(j.department);
    });
    return ['all', ...Array.from(set)];
  }, [jobs]);

  // Counts for status breakdown
  const statusCounts = useMemo(() => {
    const active = jobs.filter(j => (j.status || 'active') === 'active').length;
    const filled = jobs.filter(j => j.status === 'filled').length;
    const closed = jobs.filter(j => j.status === 'closed').length;
    const paused = jobs.filter(j => j.status === 'paused').length;
    return { active, filled, closed, paused, total: jobs.length };
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobStatus = job.status || 'active';
      const matchesSearch = 
        !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.rolePurpose && job.rolePurpose.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDept === 'all' || job.department === selectedDept;
      const matchesStatus = selectedStatus === 'all' || jobStatus === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [jobs, searchQuery, selectedDept, selectedStatus]);

  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredJobs, currentPage, pageSize]);

  const platformLabels: Record<CandidateSource, { name: string; color: string }> = {
    naukri: { name: 'Naukri.com', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    linkedin: { name: 'LinkedIn', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    indeed: { name: 'Indeed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    apna: { name: 'Apna.co', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    urbangaon: { name: 'UrbanGaon Careers', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    internshala: { name: 'Internshala', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    referral: { name: 'Internal Referral', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    newspaper: { name: 'Newspaper AD', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    other: { name: 'Other Channel', color: 'bg-slate-50 text-slate-700 border-slate-200' }
  };

  const handleViewApplicants = (jobId: string) => {
    setFilters({
      searchQuery: '',
      source: 'all',
      status: 'all',
      jobId: jobId,
      experienceRange: 'all',
      recruiter: 'all',
      dateRange: 'all',
      minRating: 0
    });
    setSelectedJobForModal(null);
    setActiveView('candidates');
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await deleteJob(jobToDelete.id);
      if (selectedJobForModal?.id === jobToDelete.id) {
        setSelectedJobForModal(null);
      }
      setJobToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            UrbanGaon Active Job Openings
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Job Requisitions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage open requisitions, update status (Mark Filled / Closed), review JDs, or filter applicants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddJobModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer mr-1"
            title="Create a new job opening or auto-extract JD from PDF/DOCX"
          >
            <Plus size={16} />
            <span>Add Job Opening</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Active: <strong>{statusCounts.active}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-800 flex items-center gap-1.5">
            <Check size={12} className="text-purple-600" />
            <span>Filled: <strong>{statusCounts.filled}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span>Closed: <strong>{statusCounts.closed}</strong></span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role title, department, or keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown / Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer shrink-0 ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              All Roles ({statusCounts.total})
            </button>
            <button
              onClick={() => { setSelectedStatus('active'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer shrink-0 ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              ● Open ({statusCounts.active})
            </button>
            <button
              onClick={() => { setSelectedStatus('filled'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer shrink-0 ${
                selectedStatus === 'filled'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
              }`}
            >
              ✓ Filled ({statusCounts.filled})
            </button>
            <button
              onClick={() => { setSelectedStatus('closed'); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer shrink-0 ${
                selectedStatus === 'closed'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              ✕ Closed ({statusCounts.closed})
            </button>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-t border-slate-100 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Department:
          </span>
          {departments.map((dept) => {
            const isActive = selectedDept === dept;
            const count = dept === 'all' 
              ? jobs.length 
              : jobs.filter(j => j.department === dept).length;

            return (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedJobs.map((job) => {
          const applicantCount = candidates.filter((c) => c.jobId === job.id).length;

          return (
            <div
              key={job.id}
              className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {job.type}
                      </span>

                      {/* Status Selector Dropdown */}
                      <select
                        value={job.status || 'active'}
                        onChange={(e) => updateJobStatus(job.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border focus:outline-none cursor-pointer transition shadow-2xs ${
                          job.status === 'filled'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : job.status === 'closed'
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : job.status === 'paused'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                        title="Click to update opening status"
                      >
                        <option value="active">● Open / Active</option>
                        <option value="filled">✓ Role Filled</option>
                        <option value="closed">✕ Closed</option>
                        <option value="paused">⏸ Paused</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Building2 size={12} className="text-slate-400 shrink-0" />
                      <span>{job.department}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shrink-0">
                    <Users size={14} />
                    <span>{applicantCount} Applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {job.experienceRequired}
                  </span>
                </div>

                {/* Sourced From Portals */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Active on Portals:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.platforms.map((plat) => {
                      const meta = platformLabels[plat];
                      return (
                        <span
                          key={plat}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-flex items-center gap-1.5 ${meta?.color || 'bg-slate-100 text-slate-700'}`}
                        >
                          <PortalLogo source={plat} size={12} />
                          <span>{meta?.name || plat}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    Target: <strong>{job.openPositions}</strong> {job.openPositions > 1 ? 'openings' : 'opening'}
                  </span>

                  {/* Quick Status Action Buttons */}
                  {job.status !== 'filled' && (
                    <button
                      onClick={() => updateJobStatus(job.id, 'filled')}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer flex items-center gap-1"
                      title="Mark this role as filled"
                    >
                      <Check size={11} /> Mark Filled
                    </button>
                  )}
                  {job.status === 'active' && (
                    <button
                      onClick={() => updateJobStatus(job.id, 'closed')}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer flex items-center gap-1"
                      title="Close this role"
                    >
                      <Ban size={11} /> Close
                    </button>
                  )}
                  {job.status && job.status !== 'active' && (
                    <button
                      onClick={() => updateJobStatus(job.id, 'active')}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                      title="Reopen / Activate role"
                    >
                      <RotateCcw size={11} /> Reopen
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setJobToDelete(job)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Delete Job Requisition"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    onClick={() => setEditingJob(job)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition cursor-pointer"
                    title="Edit Job Requisition"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setSelectedJobForModal(job)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    title="View Full Job Description"
                  >
                    <FileText size={13} />
                    <span>View JD</span>
                  </button>

                  <button
                    onClick={() => handleViewApplicants(job.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs group-hover:translate-x-0.5 cursor-pointer"
                  >
                    <span>Applicants ({applicantCount})</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FileText size={36} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Job Requisitions Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No active positions matched your search or filter. Try resetting filters to see all available roles.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Jobs Pagination */}
      {filteredJobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="job requisitions"
          />
        </div>
      )}

      {/* Role Overview & Full JD Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-[98vw] sm:w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedJobForModal.department}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedJobForModal.type}
                  </span>

                  {/* Status Dropdown inside modal header */}
                  <select
                    value={selectedJobForModal.status || 'active'}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      updateJobStatus(selectedJobForModal.id, newStatus);
                      setSelectedJobForModal(prev => prev ? { ...prev, status: newStatus } : null);
                    }}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border focus:outline-none cursor-pointer transition shadow-2xs ${
                      selectedJobForModal.status === 'filled'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : selectedJobForModal.status === 'closed'
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : selectedJobForModal.status === 'paused'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                    title="Change opening status"
                  >
                    <option value="active">● Open / Active</option>
                    <option value="filled">✓ Role Filled</option>
                    <option value="closed">✕ Closed</option>
                    <option value="paused">⏸ Paused</option>
                  </select>

                  {selectedJobForModal.industry && (
                    <span className="text-[10px] text-slate-500 hidden sm:inline-block">
                      Industry: {selectedJobForModal.industry}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedJobForModal.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {selectedJobForModal.location}
                  </span>
                  <span>•</span>
                  <span>Exp: <strong className="text-slate-700">{selectedJobForModal.experienceRequired}</strong></span>
                  {selectedJobForModal.reportsTo && (
                    <>
                      <span>•</span>
                      <span>Reports to: <strong className="text-slate-700">{selectedJobForModal.reportsTo}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Role Purpose */}
              {selectedJobForModal.rolePurpose && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={14} className="text-blue-600" />
                    Role Purpose
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                    {selectedJobForModal.rolePurpose}
                  </p>
                </div>
              )}

              {/* Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-emerald-600" />
                    Mandatory Qualification
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {selectedJobForModal.mandatoryQualification || 'Graduate / Equivalent'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-purple-600" />
                    Preferred Qualification
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {selectedJobForModal.preferredQualification || 'Relevant Master’s / Professional Certification'}
                  </div>
                </div>
              </div>

              {/* Key Responsibilities */}
              {selectedJobForModal.responsibilities && selectedJobForModal.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Key Responsibilities ({selectedJobForModal.responsibilities.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedJobForModal.responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competencies */}
              {selectedJobForModal.competencies && selectedJobForModal.competencies.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-purple-600" />
                    Competencies & Skills We Are Looking For ({selectedJobForModal.competencies.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedJobForModal.competencies.map((comp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-purple-50/30 p-2.5 rounded-xl border border-purple-100">
                        <CheckCircle2 size={13} className="text-purple-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Result Areas & Performance Indicators (KRAs) */}
              {selectedJobForModal.keyResultAreas && selectedJobForModal.keyResultAreas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target size={14} className="text-indigo-600" />
                    Key Result Areas & Performance Indicators ({selectedJobForModal.keyResultAreas.length})
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Key Result Area (KRA)</th>
                          <th className="p-2.5">KPI / Target</th>
                          <th className="p-2.5 text-right">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedJobForModal.keyResultAreas.map((kra, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-medium text-slate-800">{kra.area || kra.raw}</td>
                            <td className="p-2.5 text-slate-600">{kra.kpi || kra.target || kra.details || '—'}</td>
                            <td className="p-2.5 text-right font-bold text-indigo-600">{kra.weight || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentJob = selectedJobForModal;
                    setSelectedJobForModal(null);
                    setEditingJob(currentJob);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>Edit Requisition</span>
                </button>
                {selectedJobForModal.status !== 'filled' && (
                  <button
                    onClick={() => {
                      updateJobStatus(selectedJobForModal.id, 'filled');
                      setSelectedJobForModal(prev => prev ? { ...prev, status: 'filled' } : null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Mark as Filled</span>
                  </button>
                )}
                {selectedJobForModal.status === 'active' && (
                  <button
                    onClick={() => {
                      updateJobStatus(selectedJobForModal.id, 'closed');
                      setSelectedJobForModal(prev => prev ? { ...prev, status: 'closed' } : null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Ban size={13} />
                    <span>Close Opening</span>
                  </button>
                )}
                {selectedJobForModal.status && selectedJobForModal.status !== 'active' && (
                  <button
                    onClick={() => {
                      updateJobStatus(selectedJobForModal.id, 'active');
                      setSelectedJobForModal(prev => prev ? { ...prev, status: 'active' } : null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reopen Opening</span>
                  </button>
                )}

                <button
                  onClick={() => setJobToDelete(selectedJobForModal)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJobForModal(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handleViewApplicants(selectedJobForModal.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Users size={14} />
                  <span>
                    View Applicants ({candidates.filter(c => c.jobId === selectedJobForModal.id).length})
                  </span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-slide-up text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Job Opening?</h3>
                <p className="text-xs text-slate-500">This action will remove the requisition from the portal.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 text-sm">{jobToDelete.title}</div>
              <div className="text-slate-600">{jobToDelete.department} • {jobToDelete.location}</div>
              {candidates.filter(c => c.jobId === jobToDelete.id).length > 0 && (
                <div className="text-amber-700 font-semibold text-[11px] pt-1 border-t border-slate-200">
                  ⚠️ Note: {candidates.filter(c => c.jobId === jobToDelete.id).length} candidate application(s) are associated with this role.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Role'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
        />
      )}
    </div>
  );
};
