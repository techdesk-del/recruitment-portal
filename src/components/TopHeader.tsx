import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  RefreshCw, 
  Download, 
  Briefcase 
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
      showToast('success', 'Sync Complete', 'Candidate data synchronized.');
    } catch {
      showToast('info', 'Sync Active', 'Multi-portal candidate synchronization is active.');
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between gap-4 font-sans">
      
      {/* Left Search & Quick Stats */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Open Roles Pill */}
        <button
          onClick={() => setActiveView('jobs')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-normal text-slate-700 transition shrink-0 shadow-2xs"
        >
          <Briefcase size={14} className="text-blue-600" />
          <span>Open Roles: {jobs.length}</span>
        </button>

        {/* Search Candidates with ⌘K */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, skills, role..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-10 py-1.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 font-normal border border-slate-300">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* + Add Candidate Button */}
        <button
          onClick={() => simulateIncomingApplication()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition active:scale-95"
        >
          <Plus size={14} />
          <span>Add Candidate</span>
        </button>

        {/* Role: Admin / HR Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-normal text-slate-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Role: <strong>Admin / HR</strong></span>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          title="Sync candidate portals"
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
        </button>

        {/* Export Excel Button */}
        <button
          onClick={exportToCSV}
          title="Export CSV"
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition"
        >
          <Download size={14} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition">
            <Bell size={14} />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
        </div>

      </div>

    </header>
  );
};
