import React from 'react';
import { X, Briefcase, MapPin, CheckCircle2, Users, ExternalLink, Plus } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';
import { UrbanGaonLogo, UrbanGaonIcon } from './UrbanGaonLogo';

export const JobPostingsModal: React.FC = () => {
  const { jobs, isJobModalOpen, setIsJobModalOpen, setFilters, setActiveView } = useRecruitment();

  if (!isJobModalOpen) return null;

  const platformLabels: Record<CandidateSource, { name: string; color: string }> = {
    naukri: { name: 'Naukri.com', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    linkedin: { name: 'LinkedIn', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    indeed: { name: 'Indeed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    apna: { name: 'Apna.co', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    urbangaon: { name: 'UrbanGaon Careers', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    internshala: { name: 'Internshala', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    referral: { name: 'Internal Referral', color: 'bg-purple-50 text-purple-700 border-purple-200' }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
        
        {/* Header with Exact Attached Logo */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UrbanGaonLogo size="md" className="h-10 w-auto" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Job Requisitions</h2>
              <p className="text-xs text-slate-400 font-normal">Active job postings across all recruitment portals</p>
            </div>
          </div>
          <button
            onClick={() => setIsJobModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of Jobs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {job.openPositions} Openings
                  </span>
                  <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span>•</span>
                  <span>Exp: <strong className="text-slate-700">{job.experienceRequired}</strong></span>
                  <span>•</span>
                  <span>CTC: <strong className="text-blue-700">{job.salaryRange}</strong></span>
                </div>

                {/* Platforms Synced */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Synced to:</span>
                  {job.platforms.map((p) => {
                    const pl = platformLabels[p];
                    return (
                      <span
                        key={p}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pl.color} flex items-center gap-1`}
                      >
                        <CheckCircle2 size={10} />
                        {pl.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Right Side Stats & Actions */}
              <div className="flex items-center gap-4 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-slate-900">{job.applicantsCount}</div>
                  <div className="text-[11px] text-slate-500">Applicants</div>
                </div>

                <button
                  onClick={() => handleFilterJob(job.id)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                >
                  <Users size={13} />
                  View Candidates
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
