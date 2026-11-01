import React, { useState } from 'react';
import { X, Briefcase, MapPin, CheckCircle2, Users, ExternalLink, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { CandidateSource, JobPosting } from '../../types';
import { UrbanGaonLogo } from '../common/UrbanGaonLogo';
import { PortalLogo } from '../common/PortalLogo';

export const JobPostingsModal: React.FC = () => {
  const { jobs, candidates, isJobModalOpen, setIsJobModalOpen, setFilters, setActiveView, updateJobStatus, deleteJob } = useRecruitment();
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isJobModalOpen) return null;

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

  const handleFilterJob = (jobId: string) => {
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
    setIsJobModalOpen(false);
    setActiveView('candidates');
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      await deleteJob(jobToDelete.id);
      setJobToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-[98vw] sm:w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">

        {/* Header with Exact Attached Logo */}
        <div className="p-3.5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <UrbanGaonLogo size="md" className="h-8 sm:h-10 w-auto shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">Job Requisitions</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">Active job postings across all recruitment portals</p>
            </div>
          </div>
          <button
            onClick={() => setIsJobModalOpen(false)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of Jobs */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 bg-slate-50/50">
          {jobs.map((job) => {
            const applicantCount = candidates.filter(c => c.jobId === job.id).length || job.applicantsCount;
            const currentStatus = job.status || 'active';

            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {job.openPositions} Openings
                    </span>
                    <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {job.type}
                    </span>

                    {/* Status Badge & Selector */}
                    <select
                      value={currentStatus}
                      onChange={(e) => updateJobStatus(job.id, e.target.value as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer transition ${currentStatus === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : currentStatus === 'filled'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : currentStatus === 'closed'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                    >
                      <option value="active">● Open / Active</option>
                      <option value="filled">✓ Role Filled</option>
                      <option value="closed">✕ Closed</option>
                      <option value="paused">⏸ Paused</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span>•</span>
                    <span>Exp: <strong className="text-slate-700">{job.experienceRequired}</strong></span>
                    <span>•</span>
                    <span>Dept: <strong className="text-slate-700">{job.department}</strong></span>
                  </div>

                  {/* Platforms Synced */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">Synced to:</span>
                    {job.platforms.map((p) => {
                      const pl = platformLabels[p];
                      return (
                        <span
                          key={p}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pl?.color || 'bg-slate-50 text-slate-700 border-slate-200'} inline-flex items-center gap-1.5`}
                        >
                          <PortalLogo source={p} size={12} />
                          <span>{pl?.name || p}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side Stats & Actions */}
                <div className="flex flex-wrap items-center gap-3 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right mr-1">
                    <div className="text-lg font-extrabold text-slate-900">
                      {applicantCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Applicants</div>
                  </div>

                  {/* Quick Status Action Buttons */}
                  {currentStatus === 'active' ? (
                    <>
                      <button
                        onClick={() => updateJobStatus(job.id, 'filled')}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Mark opening as filled"
                      >
                        <Check size={12} />
                        Filled
                      </button>
                      <button
                        onClick={() => updateJobStatus(job.id, 'closed')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Close opening"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => updateJobStatus(job.id, 'active')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Reopen requisition"
                    >
                      Reopen
                    </button>
                  )}

                  <button
                    onClick={() => handleFilterJob(job.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Users size={13} />
                    View Candidates
                  </button>

                  {/* Delete Job Button */}
                  <button
                    onClick={() => setJobToDelete(job)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Delete Job Opening"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {jobToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Delete Job Opening?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Are you sure you want to delete <strong className="text-slate-800">"{jobToDelete.title}"</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>Linked Candidates:</span>
                  <span className="underline">{candidates.filter(c => c.jobId === jobToDelete.id).length} candidates</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Tip: If hiring for this role is finished, consider marking it as <strong>"Role Filled"</strong> or <strong>"Closed"</strong> instead of deleting.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setJobToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Requisition'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
