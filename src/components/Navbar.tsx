import React, { useState } from 'react';
import { 
  Briefcase, 
  LayoutDashboard, 
  Kanban, 
  Users, 
  Zap, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Layers, 
  Download
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { UrbanGaonLogo } from './UrbanGaonLogo';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    filters, 
    setFilters, 
    candidates, 
    setIsJobModalOpen, 
    setIsWebhookModalOpen,
    resetToDefaultData,
    exportToCSV
  } = useRecruitment();

  const [showSyncDetails, setShowSyncDetails] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner / Sync Bar */}
      <div className="bg-gradient-to-r from-blue-950/50 via-slate-900/80 to-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 live-indicator"></span>
            UrbanGaon ATS Engine • a perfect balance
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px]">
              <CheckCircle2 size={11} className="text-blue-400" /> Naukri API (Live)
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[11px]">
              <CheckCircle2 size={11} className="text-indigo-400" /> LinkedIn Parser (Live)
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[11px]">
              <CheckCircle2 size={11} className="text-sky-400" /> Indeed Webhook (Live)
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
              <CheckCircle2 size={11} className="text-emerald-400" /> UrbanGaon Portal (Live)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={resetToDefaultData}
            title="Reset to initial demo data"
            className="flex items-center gap-1 px-2 py-0.5 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
          >
            <RotateCcw size={11} /> Reset Data
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition"
          >
            <Download size={11} /> Export Master CSV
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Official UrbanGaon Logo with Tagline */}
          <div className="flex items-center gap-2.5">
            <UrbanGaonLogo size="md" showTagline={true} taglineText="a perfect balance" />
            <span className="hidden sm:inline-block text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 ml-0.5">
              ATS PRO
            </span>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard size={15} />
              Overview
            </button>

            <button
              onClick={() => setActiveView('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Kanban size={15} />
              Pipeline (Kanban)
            </button>

            <button
              onClick={() => setActiveView('candidates')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'candidates'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users size={15} />
              All Candidates ({candidates.length})
            </button>

            <button
              onClick={() => setIsJobModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
            >
              <Briefcase size={15} />
              Job Roles
            </button>
          </nav>

          {/* Right Actions & Search */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden lg:block w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates, skills..."
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Sync LinkedIn Inbox Button */}
            <button
              onClick={async () => {
                try {
                  const res = await fetch('http://localhost:5000/api/sync/linkedin-now', { method: 'POST' });
                  const data = await res.json();
                  if (data.status === 'success') {
                    // Success toast
                  }
                } catch {}
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/30 text-sky-300 text-xs font-semibold transition active:scale-95"
              title="Poll recruiting inbox for new LinkedIn applicants"
            >
              <RotateCcw size={13} className="text-sky-400" />
              <span>Sync LinkedIn</span>
            </button>

            {/* Ingestion Simulator Action Button */}
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 border border-emerald-400/30 transition active:scale-95"
            >
              <Zap size={14} className="text-emerald-200 fill-emerald-200" />
              <span>Simulate Ingestion</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
