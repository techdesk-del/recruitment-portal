import React from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  Briefcase, 
  Download, 
  Eye, 
  ChevronRight,
  TrendingUp,
  MapPin
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
    naukri: { name: 'Naukri.com', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/70', icon: '🔵' },
    linkedin: { name: 'LinkedIn', color: 'text-sky-700', border: 'border-sky-200', bg: 'bg-sky-50/70', icon: '💼' },
    indeed: { name: 'Indeed', color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50/70', icon: '🔷' },
    apna: { name: 'Apna.co', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/70', icon: '🟢' },
    urbangaon: { name: 'UrbanGaon Portal', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/70', icon: '🏠' },
    internshala: { name: 'Internshala', color: 'text-cyan-700', border: 'border-cyan-200', bg: 'bg-cyan-50/70', icon: '🎓' },
    referral: { name: 'Referrals', color: 'text-purple-700', border: 'border-purple-200', bg: 'bg-purple-50/70', icon: '🤝' }
  };

  const handleSourceFilterClick = (source: CandidateSource) => {
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
    setActiveView('candidates');
  };

  const recentCandidates = candidates.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Welcome Header in Light Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <UrbanGaonLogo size="md" showTagline={true} taglineText="a perfect balance" theme="light" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Multi-portal recruitment summary across Naukri, LinkedIn, Indeed & UrbanGaon Careers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('candidates')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <span>View All Candidates ({candidates.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Core Summary KPI Cards in Light Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Applications */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.totalApplications}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {metrics.activeCandidates} candidates in active review
          </p>
        </div>

        {/* Open Positions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Positions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{jobs.length} <span className="text-sm font-normal text-slate-500">roles</span></span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {metrics.openPositionsCount} openings across departments
          </p>
        </div>

        {/* Avg Time to Hire */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Time to Hire</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.avgTimeToHireDays} <span className="text-sm font-normal text-slate-500">days</span></span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Fast turnaround per applicant
          </p>
        </div>

        {/* Joined / Hired */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hired Candidates</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{metrics.statusBreakdown.joined}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {metrics.statusBreakdown.offered} offers in progress
          </p>
        </div>

      </div>

      {/* Applications By Job Portal in Light Mode */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Applications by Sourcing Portal</h3>
            <p className="text-xs text-slate-500">Click any portal to view those specific candidates</p>
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
                className={`p-4 rounded-xl border ${meta.border} ${meta.bg} cursor-pointer hover:shadow-xs hover:border-blue-400 transition flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-xl font-extrabold text-slate-900">{count}</span>
                </div>
                <div className={`text-xs font-bold mt-2 ${meta.color}`}>
                  {meta.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Applicants in Light Mode */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Applicants</h3>
            <p className="text-xs text-slate-500">Latest candidate applications received</p>
          </div>
          <button
            onClick={() => setActiveView('candidates')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
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
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-white transition flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta.border} ${meta.bg} ${meta.color}`}>
                      {meta.name}
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">{cand.status.replace('_', ' ')}</span>
                  </div>

                  <h4 
                    onClick={() => setSelectedCandidate(cand)}
                    className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition text-sm"
                  >
                    {cand.name}
                  </h4>
                  <p className="text-xs text-blue-700 font-medium">{cand.jobAppliedFor}</p>

                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                    <span>{cand.experienceYears}y exp</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><MapPin size={10} /> {cand.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    className="text-xs text-slate-700 hover:text-blue-600 font-bold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => downloadResume(cand.id)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold"
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
