import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  Briefcase, 
  FileText, 
  Download, 
  Eye, 
  ArrowUpRight, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';
import { UrbanGaonLogo, UrbanGaonIcon } from './UrbanGaonLogo';

export const OverviewDashboard: React.FC = () => {
  const { 
    metrics, 
    candidates, 
    jobs, 
    setActiveView, 
    setFilters, 
    setSelectedCandidate, 
    setPreviewResumeCandidate,
    downloadResume,
    simulateIncomingApplication
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

  const recentCandidates = candidates.slice(0, 5);

  const funnelStages = [
    { label: 'Applied', count: metrics.statusBreakdown.applied, color: 'bg-slate-600', percent: 100 },
    { label: 'Screening', count: metrics.statusBreakdown.screening, color: 'bg-blue-600', percent: Math.round(((metrics.statusBreakdown.screening + metrics.statusBreakdown.shortlisted + metrics.activeInterviews + metrics.statusBreakdown.offered + metrics.statusBreakdown.joined) / Math.max(metrics.totalApplications, 1)) * 100) },
    { label: 'Shortlisted', count: metrics.statusBreakdown.shortlisted, color: 'bg-indigo-600', percent: Math.round(((metrics.statusBreakdown.shortlisted + metrics.activeInterviews + metrics.statusBreakdown.offered + metrics.statusBreakdown.joined) / Math.max(metrics.totalApplications, 1)) * 100) },
    { label: 'Interviews (R1/R2)', count: metrics.activeInterviews, color: 'bg-purple-600', percent: Math.round(((metrics.activeInterviews + metrics.statusBreakdown.offered + metrics.statusBreakdown.joined) / Math.max(metrics.totalApplications, 1)) * 100) },
    { label: 'Offered', count: metrics.statusBreakdown.offered, color: 'bg-amber-500', percent: Math.round(((metrics.statusBreakdown.offered + metrics.statusBreakdown.joined) / Math.max(metrics.totalApplications, 1)) * 100) },
    { label: 'Joined', count: metrics.statusBreakdown.joined, color: 'bg-emerald-500', percent: metrics.overallConversionRate }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-400" /> Executive Talent Command Center
            </span>
            <span className="text-xs text-slate-400">• Q3 Hiring Cycle</span>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <UrbanGaonLogo size="lg" showTagline={true} taglineText="a perfect balance" />
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Unified talent acquisition & multi-source ATS pipeline. Synchronized across Naukri, LinkedIn, Indeed & UrbanGaon Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => simulateIncomingApplication()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <TrendingUp size={14} />
            Ingest Live Candidate
          </button>
          <button
            onClick={() => setActiveView('pipeline')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            View Pipeline Board
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Core KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Applications */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalApplications}</span>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight size={12} /> +18.4%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {metrics.activeCandidates} candidates currently in active pipeline
          </p>
        </div>

        {/* Avg Time to Hire */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time to Hire</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.avgTimeToHireDays} <span className="text-lg font-normal text-slate-400">days</span></span>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              -3.1 days
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            40% faster than industry benchmark (24d)
          </p>
        </div>

        {/* Pipeline Conversion Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Conversion</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.overallConversionRate}%</span>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight size={12} /> +4.2%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Offer acceptance rate at <strong className="text-slate-200">{metrics.offerAcceptanceRate}%</strong>
          </p>
        </div>

        {/* Open Requisitions */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Positions</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.openPositionsCount} <span className="text-lg font-normal text-slate-400">roles</span></span>
            <span className="text-xs font-semibold text-slate-400">across {jobs.length} requisitions</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {metrics.activeInterviews} candidates in final interview rounds
          </p>
        </div>

      </div>

      {/* Main Grid: Source Breakdown & Conversion Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Applications by Sourcing Platform */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={16} className="text-indigo-400" />
                Multi-Platform Source Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any platform to filter candidates in real-time</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Synced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {(Object.keys(metrics.sourceBreakdown) as CandidateSource[]).map((src) => {
              const count = metrics.sourceBreakdown[src];
              const pct = metrics.totalApplications > 0 ? Math.round((count / metrics.totalApplications) * 100) : 0;
              const meta = sourceMetaConfig[src];

              return (
                <div
                  key={src}
                  onClick={() => handleSourceFilterClick(src)}
                  className={`p-3.5 rounded-xl border ${meta.border} ${meta.bg} cursor-pointer hover:scale-[1.02] transition group relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{meta.icon}</span>
                    <span className="text-xs font-mono font-bold text-slate-300">{pct}%</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">{count}</div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center justify-between">
                    <span>{meta.name}</span>
                    <ChevronRight size={13} className="text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition" />
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-900/80 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Ingestion Engine Banner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dynamic Real-Time Resume Parsing</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  All candidate resumes from Naukri, LinkedIn, and Indeed are normalized and ready for instant 1-click ATS PDF download.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('candidates')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition"
            >
              Browse All
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Hiring Pipeline Conversion Funnel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award size={16} className="text-emerald-400" />
                Hiring Pipeline Funnel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Stage velocity & conversion drop-off</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              6 Stages
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {funnelStages.map((stage, idx) => (
              <div key={stage.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{stage.count}</span>
                    <span className="text-slate-400 font-mono text-[11px] w-10 text-right">{stage.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`${stage.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(stage.percent, 4)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Ingestion-to-Hire Ratio</span>
            <span className="font-bold text-emerald-400">{metrics.overallConversionRate}% Final Conversion</span>
          </div>
        </div>

      </div>

      {/* Real-Time Live Feed & Instant Resume Download Center */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-indicator"></span>
              <h3 className="text-base font-bold text-white">Live Candidate Stream & Instant Resume Download</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant 1-click verified ATS resume generation for candidates across any integrated platform.
            </p>
          </div>
          <button
            onClick={() => setActiveView('candidates')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            View Full Candidate Directory ({candidates.length}) <ChevronRight size={14} />
          </button>
        </div>

        {/* Live Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {recentCandidates.map((cand) => {
            const meta = sourceMetaConfig[cand.source];
            return (
              <div
                key={cand.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  {/* Top Bar: Platform Badge + ATS Score */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${meta.border} ${meta.bg} ${meta.color} flex items-center gap-1`}>
                      <span>{meta.icon}</span> {meta.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {cand.atsMatchScore}% Match
                    </span>
                  </div>

                  {/* Candidate Name & Role */}
                  <h4 
                    onClick={() => setSelectedCandidate(cand)}
                    className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-1"
                  >
                    {cand.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{cand.jobAppliedFor}</p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>Exp: <strong className="text-slate-300">{cand.experienceYears}y</strong></span>
                    <span>•</span>
                    <span>Notice: <strong className="text-slate-300">{cand.noticePeriod}</strong></span>
                    <span>•</span>
                    <span>CTC: <strong className="text-slate-300">{cand.expectedSalary}</strong></span>
                  </div>
                </div>

                {/* Bottom Action Row: Resume Download + ATS Profile */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewResumeCandidate(cand)}
                      title="Preview Resume"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline text-[11px]">Preview</span>
                    </button>
                    <button
                      onClick={() => downloadResume(cand.id)}
                      title="Instant Real-Time PDF Download"
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-xs flex items-center gap-1 shadow-md shadow-indigo-900/30"
                    >
                      <Download size={13} />
                      <span className="text-[11px]">Download PDF</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    ATS Profile <ExternalLink size={11} />
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
