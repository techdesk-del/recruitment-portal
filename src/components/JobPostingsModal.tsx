import React from 'react';
import { X, Briefcase, MapPin, CheckCircle2, Users, ExternalLink, Plus } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';

export const JobPostingsModal: React.FC = () => {
  const { jobs, isJobModalOpen, setIsJobModalOpen, setFilters, setActiveView } = useRecruitment();

  if (!isJobModalOpen) return null;

  const platformLabels: Record<CandidateSource, { name: string; color: string }> = {
    naukri: { name: 'Naukri.com', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    linkedin: { name: 'LinkedIn', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    indeed: { name: 'Indeed', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    apna: { name: 'Apna.co', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    urbangaon: { name: 'Careers Portal', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    internshala: { name: 'Internshala', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    referral: { name: 'Internal Referral', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  };

  const handleFilterJob = (jobId: string) => {
    setFilters((prev) => ({ ...prev, jobId }));
    setIsJobModalOpen(false);
    setActiveView('candidates');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Active Job Requisitions & Platform Sync</h2>
              <p className="text-xs text-slate-400">Multi-portal cross-posting status and candidate pipeline volume</p>
            </div>
          </div>
          <button
            onClick={() => setIsJobModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of Jobs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{job.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {job.openPositions} Openings
                  </span>
                  <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span>•</span>
                  <span>Exp: <strong className="text-slate-300">{job.experienceRequired}</strong></span>
                  <span>•</span>
                  <span>CTC: <strong className="text-indigo-300">{job.salaryRange}</strong></span>
                </div>

                {/* Platforms Synced */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 mr-1">Synced to:</span>
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
              <div className="flex items-center gap-4 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-white">{job.applicantsCount}</div>
                  <div className="text-[11px] text-slate-400">Total Applicants</div>
                </div>

                <button
                  onClick={() => handleFilterJob(job.id)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/30 transition flex items-center gap-1"
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
