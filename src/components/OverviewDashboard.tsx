import React from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  Briefcase, 
  Download, 
  Eye, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';
import { UrbanGaonLogo } from './UrbanGaonLogo';

export const OverviewDashboard: React.FC = () => {
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

  const sourceMetaConfig: Record<CandidateSource, { name: string; color: string; border: string; bg: string; icon: string }> = {
    naukri: { name: 'Naukri.com', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: '🔵' },
    linkedin: { name: 'LinkedIn', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10', icon: '💼' },
    indeed: { name: 'Indeed', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', icon: '🔷' },
    apna: { name: 'Apna.co', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: '🟢' },
    urbangaon: { name: 'UrbanGaon Portal', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: '🏠' },
    internshala: { name: 'Internshala', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', icon: '🎓' },
    referral: { name: 'Referrals', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: '🤝' }
  };

  const handleSourceFilterClick = (source: CandidateSource) => {
    setFilters((prev) => ({ ...prev, source }));
    setActiveView('candidates');
  };

  const recentCandidates = candidates.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <UrbanGaonLogo size="md" showTagline={true} taglineText="a perfect balance" />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Multi-portal recruitment summary across Naukri, LinkedIn, Indeed & UrbanGaon Careers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('candidates')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            <span>View All Candidates ({candidates.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Applications */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{metrics.totalApplications}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {metrics.activeCandidates} candidates in hiring stages
          </p>
        </div>

        {/* Open Positions */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Positions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{jobs.length} <span className="text-sm font-normal text-slate-400">roles</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {metrics.openPositionsCount} total openings across company
          </p>
        </div>

        {/* Avg Time to Hire */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time to Hire</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{metrics.avgTimeToHireDays} <span className="text-sm font-normal text-slate-400">days</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Fast turnaround per applicant
          </p>
        </div>

        {/* Joined / Hired */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hired Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{metrics.statusBreakdown.joined}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {metrics.statusBreakdown.offered} offers in progress
          </p>
        </div>

      </div>

      {/* Applications By Job Portal */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Applications by Sourcing Portal</h3>
            <p className="text-xs text-slate-400">Click any portal to view those specific candidates</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(metrics.sourceBreakdown) as CandidateSource[]).map((src) => {
            const count = metrics.sourceBreakdown[src];
            const meta = sourceMetaConfig[src];

            return (
              <div
                key={src}
                onClick={() => handleSourceFilterClick(src)}
                className={`p-4 rounded-xl border ${meta.border} ${meta.bg} cursor-pointer hover:scale-[1.02] transition flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-xl font-extrabold text-white">{count}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-2">
                  {meta.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Applicants */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Applicants</h3>
            <p className="text-xs text-slate-400">Latest candidate applications received</p>
          </div>
          <button
            onClick={() => setActiveView('candidates')}
            className="text-xs font-semibold text-blue-400 hover:underline"
          >
            View All ({candidates.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCandidates.map((cand) => {
            const meta = sourceMetaConfig[cand.source];
            return (
              <div
                key={cand.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta.border} ${meta.bg} ${meta.color}`}>
                      {meta.name}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">{cand.status.replace('_', ' ')}</span>
                  </div>

                  <h4 
                    onClick={() => setSelectedCandidate(cand)}
                    className="font-bold text-white hover:text-blue-400 cursor-pointer transition text-sm"
                  >
                    {cand.name}
                  </h4>
                  <p className="text-xs text-slate-400">{cand.jobAppliedFor}</p>

                  <div className="text-[11px] text-slate-400 mt-2">
                    {cand.experienceYears}y exp • {cand.location}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    className="text-xs text-slate-300 hover:text-white font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => downloadResume(cand.id)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <Download size={12} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
