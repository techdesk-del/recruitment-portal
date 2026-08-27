import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Briefcase, 
  Kanban, 
  Settings, 
  LogOut, 
  Globe, 
  FileText,
  CheckCircle2,
  Building2,
  GraduationCap
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
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30 shadow-xs">
      
      {/* Top Brand & Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <UrbanGaonIcon size={38} />
          <div>
            <div className="flex items-center gap-1 leading-tight">
              <h1 className="font-extrabold text-slate-900 text-base font-sans">UrbanGaon</h1>
              <span className="text-[10px] text-slate-400 font-bold">®</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Admin / HR Lead</p>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <div className="space-y-1.5">
          <button
            onClick={() => handleGeneralViewClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'dashboard' || activeView === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleGeneralViewClick('candidates')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'candidates'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} />
              <span>All Candidates</span>
            </div>
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              activeView === 'candidates' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => handleGeneralViewClick('jobs')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'jobs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={18} />
              <span>Job Openings</span>
            </div>
            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              activeView === 'jobs' ? 'bg-blue-800/80 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => handleGeneralViewClick('pipeline')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'pipeline'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Kanban size={18} />
            <span>Pipeline Stages</span>
          </button>
        </div>

        {/* Portal Integrations Section */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Sourcing Portals
          </div>

          <button
            onClick={() => handlePortalClick('linkedin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'linkedin'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">💼</span>
              <span>LinkedIn</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {getPortalCount('linkedin')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('naukri')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'naukri'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔵</span>
              <span>Naukri.com</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {getPortalCount('naukri')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('indeed')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'indeed'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔷</span>
              <span>Indeed</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {getPortalCount('indeed')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('apna')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'apna'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🟢</span>
              <span>Apna.co</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {getPortalCount('apna')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('internshala')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'internshala'
                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🎓</span>
              <span>Internshala</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {getPortalCount('internshala')}
            </span>
          </button>

          <button
            onClick={() => handlePortalClick('urbangaon')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'urbangaon'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🏠</span>
              <span>UrbanGaon Careers</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {getPortalCount('urbangaon')}
            </span>
          </button>
        </div>

      </div>

      {/* Bottom Settings & User Profile Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
        <button
          onClick={() => handleGeneralViewClick('overview')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <Settings size={16} />
          <span>Hiring Settings</span>
        </button>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              A
            </div>
            <span className="font-bold text-slate-800 text-xs">Akash Das</span>
          </div>

          <button
            onClick={() => alert('Demo HR Session')}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition"
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
