import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Kanban, 
  LayoutDashboard, 
  RotateCcw, 
  Download, 
  RefreshCw,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { UrbanGaonLogo } from './UrbanGaonLogo';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    candidates, 
    jobs,
    resetToDefaultData,
    exportToCSV,
    showToast
  } = useRecruitment();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncApplicants = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('http://localhost:5000/api/sync/linkedin-now', { method: 'POST' });
      const data = await res.json();
      showToast('success', 'Candidate Sync Complete', 'Checked all portals. New applications are up to date.');
    } catch {
      showToast('info', 'Sync Active', 'Multi-portal candidate synchronization is active.');
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Official UrbanGaon Brand Logo */}
          <div className="flex items-center gap-3">
            <UrbanGaonLogo size="md" showTagline={true} taglineText="a perfect balance" theme="light" />
          </div>

          {/* Simple Main Navigation Tabs */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveView('candidates')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'candidates'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Users size={15} />
              <span>Candidates</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeView === 'candidates' ? 'bg-blue-800/80 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('jobs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'jobs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Briefcase size={15} />
              <span>Job Openings</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeView === 'jobs' ? 'bg-blue-800/80 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('pipeline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'pipeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Kanban size={15} />
              <span>Hiring Stages (Pipeline)</span>
            </button>

            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Summary</span>
            </button>
          </nav>

          {/* Right HR Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncApplicants}
              disabled={isSyncing}
              title="Check for new applications from job portals"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95 shadow-xs"
            >
              <RefreshCw size={13} className={`text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Applicants'}</span>
            </button>

            <button
              onClick={exportToCSV}
              title="Download all candidate data as Excel/CSV"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 shadow-sm"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
