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
import { UrbanGaonLogo, UrbanGaonIcon } from './UrbanGaonLogo';
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
    <aside className="w-56 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 font-sans tracking-tight">
      
      {/* Top Brand & Navigation */}
      <div className="p-3.5 space-y-5 overflow-y-auto">
        
        {/* Brand Header with Exact Attached Logo */}
        <div className="px-1.5 pt-1 pb-2 flex items-center">
          <UrbanGaonLogo size="md" className="h-9 w-auto object-contain" />
        </div>

        {/* Main Navigation Menu */}
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => handleGeneralViewClick('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all tracking-tight ${
              activeView === 'dashboard' || activeView === 'overview'
                ? 'bg-[#2563eb] text-white font-medium shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <LayoutGrid size={16} className={activeView === 'dashboard' || activeView === 'overview' ? 'text-white' : 'text-slate-400'} />
            <span>Dashboard</span>
          </button>

          {/* All Candidates */}
          <button
            onClick={() => handleGeneralViewClick('candidates')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all tracking-tight ${
              activeView === 'candidates'
                ? 'bg-[#2563eb] text-white font-medium shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={16} className={activeView === 'candidates' ? 'text-white' : 'text-slate-400'} />
              <span>All Candidates</span>
            </div>
            <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded-full ${
              activeView === 'candidates' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {candidates.length}
            </span>
          </button>

          {/* Job Openings */}
          <button
            onClick={() => handleGeneralViewClick('jobs')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all tracking-tight ${
              activeView === 'jobs'
                ? 'bg-[#2563eb] text-white font-medium shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase size={16} className={activeView === 'jobs' ? 'text-white' : 'text-slate-400'} />
              <span>Job Openings</span>
            </div>
            <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded-full ${
              activeView === 'jobs' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {jobs.length}
            </span>
          </button>

          {/* Pipeline Stages */}
          <button
            onClick={() => handleGeneralViewClick('pipeline')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all tracking-tight ${
              activeView === 'pipeline'
                ? 'bg-[#2563eb] text-white font-medium shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <Kanban size={16} className={activeView === 'pipeline' ? 'text-white' : 'text-slate-400'} />
            <span>Pipeline Stages</span>
          </button>
        </div>

        {/* Portals Section */}
        <div className="pt-2 border-t border-slate-100 space-y-0.5">
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Sourcing Portals
          </div>

          <button
            onClick={() => handlePortalClick('linkedin')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all tracking-tight ${
              activeView === 'linkedin'
                ? 'bg-sky-50 text-sky-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">💼</span>
              <span>LinkedIn</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('linkedin')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('naukri')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all tracking-tight ${
              activeView === 'naukri'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🔵</span>
              <span>Naukri.com</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('naukri')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('indeed')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all tracking-tight ${
              activeView === 'indeed'
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🔷</span>
              <span>Indeed</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('indeed')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('apna')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all tracking-tight ${
              activeView === 'apna'
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🟢</span>
              <span>Apna.co</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('apna')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('urbangaon')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-all tracking-tight ${
              activeView === 'urbangaon'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">🏠</span>
              <span>UrbanGaon</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('urbangaon')}
            </span>
          </button>
        </div>

      </div>

      {/* Bottom Settings & User Profile Footer */}
      <div className="p-3.5 border-t border-slate-100 space-y-2">
        <button
          onClick={() => handleGeneralViewClick('overview')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-normal text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition tracking-tight"
        >
          <Settings size={16} className="text-slate-400" />
          <span>Hiring Settings</span>
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-1.5">
          <span className="font-semibold text-slate-800 text-[11px] tracking-tight">Akash Das</span>

          <button
            onClick={() => alert('Demo HR Session')}
            className="flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-600 transition tracking-tight"
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
