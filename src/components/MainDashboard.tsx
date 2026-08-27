import React from 'react';
import { 
  Calendar, 
  ChevronDown, 
  ArrowRight, 
  Download 
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';

export const MainDashboard: React.FC = () => {
  const { 
    metrics, 
    candidates, 
    jobs, 
    setActiveView, 
    setFilters, 
    setSelectedCandidate, 
    downloadResume 
  } = useRecruitment();

  const handlePortalFilter = (source: CandidateSource) => {
    setFilters({
      searchQuery: '',
      source: source,
      status: 'all',
      jobId: 'all',
      experienceRange: 'all',
      recruiter: 'all',
      dateRange: 'all',
      minRating: 0
    });
    setActiveView(source);
  };

  const recentCandidates = candidates.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      
      {/* Top Welcome Title & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Welcome back, Akash</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer hover:border-slate-300 transition">
            <Calendar size={14} className="text-slate-400" />
            <span>Active Hiring Cycle</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* SECTION 1: PERFORMANCE • RECRUITMENT PIPELINE */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          PERFORMANCE • RECRUITMENT PIPELINE
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Applicants */}
          <div 
            onClick={() => setActiveView('candidates')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between min-h-[135px]"
          >
            <span className="text-xs font-medium text-slate-500">Total Applicants</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#00a86b] tracking-tight">
                {metrics.totalApplications}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">all sourced candidates</p>
            </div>
          </div>

          {/* Card 2: In Pipeline */}
          <div 
            onClick={() => setActiveView('pipeline')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition cursor-pointer flex flex-col justify-between min-h-[135px]"
          >
            <span className="text-xs font-medium text-slate-500">In Pipeline</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#2563eb] tracking-tight">
                {metrics.activeCandidates}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">{jobs.length} active positions</p>
            </div>
          </div>

          {/* Card 3: Interview Conversion */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[135px]">
            <span className="text-xs font-medium text-slate-500">Interview Conversion</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#ea580c] tracking-tight">
                {metrics.overallConversionRate}%
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">{metrics.statusBreakdown.joined} of {metrics.totalApplications} hired</p>
            </div>
          </div>

          {/* Card 4: Avg Time to Hire */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[135px]">
            <span className="text-xs font-medium text-slate-500">Avg Time to Hire</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#0284c7] tracking-tight">
                {metrics.avgTimeToHireDays} <span className="text-xl font-semibold text-slate-400">days</span>
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">per hired applicant</p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: PORTAL SOURCES • APPLICATIONS */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          PORTAL SOURCES • APPLICATIONS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div 
            onClick={() => handlePortalFilter('linkedin')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-sky-400 transition cursor-pointer min-h-[135px] flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-slate-500">LinkedIn EasyApply</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#2563eb]">
                {metrics.sourceBreakdown.linkedin || 0}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">synced via webhook</p>
            </div>
          </div>

          <div 
            onClick={() => handlePortalFilter('naukri')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition cursor-pointer min-h-[135px] flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-slate-500">Naukri FastForward</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#00a86b]">
                {metrics.sourceBreakdown.naukri || 0}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">verified profiles</p>
            </div>
          </div>

          <div 
            onClick={() => handlePortalFilter('indeed')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-400 transition cursor-pointer min-h-[135px] flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-slate-500">Indeed Applications</span>
            <div className="mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-[#ea580c]">
                {metrics.sourceBreakdown.indeed || 0}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">active candidates</p>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: RECENT CANDIDATES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            RECENT CANDIDATE APPLICATIONS
          </div>
          <button
            onClick={() => setActiveView('candidates')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All ({candidates.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Candidate</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4">Portal</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Hiring Stage</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
                          {cand.name.charAt(0)}
                        </div>
                        <div>
                          <p 
                            onClick={() => setSelectedCandidate(cand)}
                            className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer text-sm"
                          >
                            {cand.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-normal">{cand.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{cand.jobAppliedFor}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">{cand.source}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-normal">{cand.experienceYears} Years</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold capitalize">
                        {cand.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => downloadResume(cand.id)}
                          className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
