import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Briefcase, 
  Kanban, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { UrbanGaonIcon } from './UrbanGaonLogo';
import { CandidateSource } from '../types';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, candidates, jobs, setFilters } = useRecruitment();

  const getPortalCount = (source: CandidateSource) => {
    return candidates.filter((c) => c.source === source).length;
  };

  const handlePortalClick = (source: CandidateSource) => {
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

  const handleGeneralViewClick = (view: string) => {
    if (view === 'candidates') {
      setFilters((prev) => ({ ...prev, source: 'all' }));
    }
    setActiveView(view);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 shadow-xs font-sans">
      
      {/* Top Brand & Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Brand Header matching reference screenshot */}
        <div className="flex items-center gap-3 px-2 py-1">
          <UrbanGaonIcon size={38} />
          <div>
            <div className="flex items-center gap-0.5 leading-none">
              <span className="font-bold text-slate-900 text-[17px] font-sans tracking-tight">UrbanGaon</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-1">Admin / HR Lead</p>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <div className="space-y-1">
          <button
            onClick={() => handleGeneralViewClick('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeView === 'dashboard' || activeView === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleGeneralViewClick('candidates')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeView === 'candidates'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Users size={18} />
              <span>All Candidates</span>
            </div>
            <span className={`text-[11px] font-medium px-2 py-0.2 rounded-full ${
              activeView === 'candidates' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => handleGeneralViewClick('jobs')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeView === 'jobs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Briefcase size={18} />
              <span>Job Openings</span>
            </div>
            <span className={`text-[11px] font-medium px-2 py-0.2 rounded-full ${
              activeView === 'jobs' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => handleGeneralViewClick('pipeline')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeView === 'pipeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Kanban size={18} />
            <span>Pipeline Stages</span>
          </button>
        </div>

        {/* Portal Integrations Section */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <div className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Sourcing Portals
          </div>

          <button
            onClick={() => handlePortalClick('linkedin')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-normal transition-all ${
              activeView === 'linkedin'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">💼</span>
              <span>LinkedIn</span>
            </div>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
              {getPortalCount('linkedin')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('naukri')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-normal transition-all ${
              activeView === 'naukri'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🔵</span>
              <span>Naukri.com</span>
            </div>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
              {getPortalCount('naukri')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('indeed')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-normal transition-all ${
              activeView === 'indeed'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🔷</span>
              <span>Indeed</span>
            </div>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
              {getPortalCount('indeed')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('apna')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-normal transition-all ${
              activeView === 'apna'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🟢</span>
              <span>Apna.co</span>
            </div>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
              {getPortalCount('apna')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('internshala')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-normal transition-all ${
              activeView === 'internshala'
                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🎓</span>
              <span>Internshala</span>
            </div>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
              {getPortalCount('internshala')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('urbangaon')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-normal transition-all ${
              activeView === 'urbangaon'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🏠</span>
              <span>UrbanGaon Careers</span>
            </div>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
              {getPortalCount('urbangaon')}
            </span>
          </button>
        </div>

      </div>

      {/* Bottom Settings & User Profile Footer matching screenshot */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <button
          onClick={() => handleGeneralViewClick('overview')}
          className="w-full flex items-center gap-3.5 px-4 py-2 text-sm font-normal text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs px-2">
          <span className="font-semibold text-slate-900 text-xs">Akash Das</span>

          <button
            onClick={() => alert('Demo HR Session')}
            className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600 transition"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
