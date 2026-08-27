import React from 'react';
import { Briefcase, MapPin, Users, ArrowRight, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';

export const JobsView: React.FC = () => {
  const { jobs, candidates, setFilters, setActiveView } = useRecruitment();

  const platformLabels: Record<CandidateSource, { name: string; color: string }> = {
    naukri: { name: 'Naukri.com', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    linkedin: { name: 'LinkedIn', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    indeed: { name: 'Indeed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    apna: { name: 'Apna.co', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    urbangaon: { name: 'UrbanGaon Careers', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    internshala: { name: 'Internshala', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    referral: { name: 'Internal Referral', color: 'bg-purple-50 text-purple-700 border-purple-200' }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            UrbanGaon Active Job Openings
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Requisitions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Click on any position to view and manage all candidate applications for that role.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            Total Positions: <strong className="text-slate-900 ml-1">{jobs.length} Active</strong>
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
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{job.department}</p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shrink-0">
                    <Users size={14} />
                    <span>{applicantCount} Applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {job.experienceRequired}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <DollarSign size={13} />
                    {job.salaryRange}
                  </span>
                </div>

                {/* Sourced From Portals */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Active on Portals:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.platforms.map((plat) => {
                      const meta = platformLabels[plat];
                      return (
                        <span
                          key={plat}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${meta?.color || 'bg-slate-100 text-slate-700'}`}
                        >
                          {meta?.name || plat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Target: {job.openPositions} {job.openPositions > 1 ? 'openings' : 'opening'}
                </span>

                <button
                  onClick={() => handleViewApplicants(job.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs group-hover:translate-x-0.5"
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
