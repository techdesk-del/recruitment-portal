import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Briefcase, 
  Kanban, 
  Settings, 
  LogOut,
  Calendar,
  Layers,
  PhoneCall,
  FolderKanban,
  Building2,
  TrendingUp,
  Inbox
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
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 font-sans">
      
      {/* Top Brand & Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Brand Header matching exact reference screenshot */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-2">
          <UrbanGaonIcon size={38} className="rounded-full shrink-0" />
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-slate-900 text-[16px] leading-tight tracking-tight">UrbanGaon</h1>
            <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">Admin / CEO</p>
          </div>
        </div>

        {/* Main Navigation Menu matching exact screenshot */}
        <div className="space-y-1">
          {/* Active Dashboard Button */}
          <button
            onClick={() => handleGeneralViewClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
              activeView === 'dashboard' || activeView === 'overview'
                ? 'bg-[#2563eb] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <LayoutGrid size={18} className={activeView === 'dashboard' || activeView === 'overview' ? 'text-white' : 'text-slate-400'} />
            <span>Dashboard</span>
          </button>

          {/* Today */}
          <button
            onClick={() => handleGeneralViewClick('dashboard')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <Calendar size={18} className="text-slate-400" />
            <span>Today</span>
          </button>

          {/* Projects / Jobs */}
          <button
            onClick={() => handleGeneralViewClick('jobs')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
              activeView === 'jobs'
                ? 'bg-[#2563eb] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderKanban size={18} className={activeView === 'jobs' ? 'text-white' : 'text-slate-400'} />
              <span>Projects / Jobs</span>
            </div>
            <span className={`text-[11px] font-normal px-2 py-0.2 rounded-full ${
              activeView === 'jobs' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {jobs.length}
            </span>
          </button>

          {/* Leads / Candidates */}
          <button
            onClick={() => handleGeneralViewClick('candidates')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
              activeView === 'candidates'
                ? 'bg-[#2563eb] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} className={activeView === 'candidates' ? 'text-white' : 'text-slate-400'} />
              <span>Leads / Applicants</span>
            </div>
            <span className={`text-[11px] font-normal px-2 py-0.2 rounded-full ${
              activeView === 'candidates' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {candidates.length}
            </span>
          </button>

          {/* Calls / Interviews */}
          <button
            onClick={() => handleGeneralViewClick('pipeline')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
              activeView === 'pipeline'
                ? 'bg-[#2563eb] text-white font-medium shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <PhoneCall size={18} className={activeView === 'pipeline' ? 'text-white' : 'text-slate-400'} />
            <span>Calls / Pipeline</span>
          </button>
        </div>

        {/* Portals Section */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="px-3.5 pb-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Sourcing Portals
          </div>

          <button
            onClick={() => handlePortalClick('linkedin')}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all ${
              activeView === 'linkedin'
                ? 'bg-sky-50 text-sky-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">💼</span>
              <span>LinkedIn</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('linkedin')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('naukri')}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all ${
              activeView === 'naukri'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">🔵</span>
              <span>Naukri.com</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('naukri')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('indeed')}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all ${
              activeView === 'indeed'
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">🔷</span>
              <span>Indeed</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('indeed')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('apna')}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all ${
              activeView === 'apna'
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">🟢</span>
              <span>Apna.co</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('apna')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('urbangaon')}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all ${
              activeView === 'urbangaon'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">🏠</span>
              <span>UrbanGaon</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              {getPortalCount('urbangaon')}
            </span>
          </button>
        </div>

      </div>

      {/* Bottom Settings & User Profile Footer matching screenshot */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={() => handleGeneralViewClick('overview')}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-normal text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
        >
          <Settings size={18} className="text-slate-400" />
          <span>Settings</span>
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2">
          <span className="font-semibold text-slate-900 text-xs">Yudhister Tiwari</span>

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
