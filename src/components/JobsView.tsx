import React from 'react';
import { Briefcase, MapPin, Users, ArrowRight, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';

export const JobsView: React.FC = () => {
  const { jobs, candidates, setFilters, setActiveView } = useRecruitment();

  const platformLabels: Record<CandidateSource, { name: string; color: string }> = {
    naukri: { name: 'Naukri.com', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    linkedin: { name: 'LinkedIn', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    indeed: { name: 'Indeed', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    apna: { name: 'Apna.co', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    urbangaon: { name: 'UrbanGaon Careers', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    internshala: { name: 'Internshala', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    referral: { name: 'Internal Referral', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
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
    setActiveView('candidates');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            UrbanGaon Careers & Hiring Openings
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Job Openings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Click on any job to instantly view all candidates who applied for that role.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
            Total Positions: <strong className="text-white ml-1">{jobs.length} Active</strong>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const applicantCount = candidates.filter((c) => c.jobId === job.id).length;

          return (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/60 transition-all shadow-md flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                        {job.title}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{job.department}</p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold shrink-0">
                    <Users size={14} />
                    <span>{applicantCount} Applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {job.experienceRequired}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <DollarSign size={13} />
                    {job.salaryRange}
                  </span>
                </div>

                {/* Sourced From Portals */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Active on Portals:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.platforms.map((plat) => {
                      const meta = platformLabels[plat];
                      return (
                        <span
                          key={plat}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${meta?.color || 'bg-slate-800 text-slate-300'}`}
                        >
                          {meta?.name || plat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Target: {job.openPositions} {job.openPositions > 1 ? 'openings' : 'opening'}
                </span>

                <button
                  onClick={() => handleViewApplicants(job.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 group-hover:translate-x-0.5"
                >
                  <span>View Applicants ({applicantCount})</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
