import React from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  ChevronDown,
  TrendingUp,
  Download,
  Eye,
  CheckCircle2,
  Phone,
  Mail,
  MapPin
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
    setPreviewResumeCandidate,
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
    <div className="space-y-7 animate-fade-in pb-12">
      
      {/* Top Welcome Title & Filter Row matching reference CRM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Welcome back, Akash • UrbanGaon Recruitment Operations</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <Calendar size={14} className="text-slate-400" />
            <span>Active Hiring Cycle (Q3)</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Row 1: PERFORMANCE • HIRING OVERVIEW (Matching large metric cards in reference screenshot) */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Performance • Recruitment Pipeline
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Applications */}
          <div 
            onClick={() => setActiveView('candidates')}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-slate-500">Total Applicants</span>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-600 tracking-tight">
                {metrics.totalApplications}
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">across all job portals</p>
            </div>
          </div>

          {/* Card 2: Active Pipeline */}
          <div 
            onClick={() => setActiveView('pipeline')}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-slate-500">Pipeline Candidates</span>
            <div className="my-2">
              <span className="text-3xl font-black text-blue-600 tracking-tight">
                {metrics.activeCandidates}
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">{jobs.length} job roles open</p>
            </div>
          </div>

          {/* Card 3: Conversion */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Interview Conversion</span>
            <div className="my-2">
              <span className="text-3xl font-black text-amber-500 tracking-tight">
                {metrics.overallConversionRate}%
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">{metrics.statusBreakdown.joined} offers accepted</p>
            </div>
          </div>

          {/* Card 4: Avg Time */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Time to Hire</span>
            <div className="my-2">
              <span className="text-3xl font-black text-blue-600 tracking-tight">
                {metrics.avgTimeToHireDays} <span className="text-base font-normal text-slate-400">days</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">per hired applicant</p>
            </div>
          </div>

        </div>
      </div>

      {/* Row 2: APPLICANTS TODAY & SOURCING DISTRIBUTION (Matching second card row in reference screenshot) */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Applications • Portals Breakdown
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div 
            onClick={() => handlePortalFilter('linkedin')}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>LinkedIn Applications</span>
              <span className="text-base">💼</span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-sky-600">{metrics.sourceBreakdown.linkedin || 0}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">via LinkedIn EasyApply</p>
            </div>
          </div>

          <div 
            onClick={() => handlePortalFilter('naukri')}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Naukri.com Applications</span>
              <span className="text-base">🔵</span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-blue-600">{metrics.sourceBreakdown.naukri || 0}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">via Naukri FastForward</p>
            </div>
          </div>

          <div 
            onClick={() => handlePortalFilter('indeed')}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Indeed Applications</span>
              <span className="text-base">🔷</span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-indigo-600">{metrics.sourceBreakdown.indeed || 0}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">via Indeed Webhook</p>
            </div>
          </div>

        </div>
      </div>

      {/* Row 3: RECENT CANDIDATE APPLICATIONS TABLE (Quick Glance) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Recent Candidate Applications
          </div>
          <button
            onClick={() => setActiveView('candidates')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All ({candidates.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Candidate</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Portal</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {cand.name.charAt(0)}
                        </div>
                        <div>
                          <p 
                            onClick={() => setSelectedCandidate(cand)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                          >
                            {cand.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{cand.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{cand.jobAppliedFor}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 font-semibold">{cand.source}</td>
                    <td className="py-3.5 px-4 text-slate-600">{cand.experienceYears} Years</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold capitalize">
                        {cand.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => downloadResume(cand.id)}
                          className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
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
