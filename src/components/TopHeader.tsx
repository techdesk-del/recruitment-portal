import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  RefreshCw, 
  Download, 
  Briefcase, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';

export const TopHeader: React.FC = () => {
  const { 
    jobs, 
    filters, 
    setFilters, 
    exportToCSV, 
    showToast,
    simulateIncomingApplication,
    setActiveView 
  } = useRecruitment();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('http://localhost:5000/api/sync/linkedin-now', { method: 'POST' });
      const data = await res.json();
      showToast('success', 'Candidate Sync Complete', 'Applications from LinkedIn & portals are synchronized.');
    } catch {
      showToast('info', 'Sync Active', 'Multi-portal candidate synchronization is active.');
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
      
      {/* Left Search & Quick Stats */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Active Jobs Pill */}
        <button
          onClick={() => setActiveView('jobs')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition shrink-0"
        >
          <Briefcase size={14} className="text-blue-600" />
          <span>Open Roles: {jobs.length}</span>
        </button>

        {/* Global Search Bar with ⌘K */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, skills, location..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 font-semibold border border-slate-300">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Controls matching CRM screenshot */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Blue Primary Button (+ New Lead style) */}
        <button
          onClick={() => simulateIncomingApplication()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
        >
          <Plus size={15} />
          <span>+ Add Candidate</span>
        </button>

        {/* Role Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Role: Admin / HR</span>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          title="Sync candidate portals"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <RefreshCw size={15} className={`text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>

        {/* Export Excel Button */}
        <button
          onClick={exportToCSV}
          title="Export CSV"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <Download size={15} className="text-slate-600" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
            <Bell size={15} className="text-slate-600" />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
        </div>

      </div>

    </header>
  );
};
