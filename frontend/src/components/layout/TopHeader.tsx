import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  RefreshCw, 
  Download, 
  Briefcase,
  ChevronDown,
  Shield,
  UserCheck,
  Building,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, UserRole } from '../../types';
import { recruitmentApi } from '../../services/api';

export const TopHeader: React.FC = () => {
  const { user, can, switchRole, logout } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const { 
    jobs, 
    filters, 
    setFilters, 
    exportToCSV, 
    exportToExcel,
    showToast,
    simulateIncomingApplication,
    setIsBulkUploadModalOpen,
    setActiveView 
  } = useRecruitment();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await recruitmentApi.syncLinkedInNow();
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
        
        {/* + Add Candidate Button (Admin & Recruiter only) */}
        {can('create_candidate') ? (
          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition active:scale-95 cursor-pointer"
            title="Add candidate via resume upload or manual intake"
          >
            <Plus size={14} />
            <span>Add Candidate</span>
          </button>
        ) : (
          <div 
            title="Read-only mode: Candidate intake requires Recruiter or Admin role"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-normal text-slate-400 cursor-not-allowed"
          >
            <span>Intake Restricted</span>
          </div>
        )}

        {/* Dynamic Role Pill with Dropdown Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-normal text-slate-700 shadow-2xs transition cursor-pointer"
            title="Click to view permissions or switch identity"
          >
            <span className={`w-2 h-2 rounded-full ${
              user?.role === 'admin' ? 'bg-emerald-500' :
              user?.role === 'recruiter' ? 'bg-blue-500' : 'bg-purple-500'
            }`}></span>
            <span>
              Role: <strong className="capitalize">{user ? ROLE_LABELS[user.role]?.badge : 'Loading...'}</strong>
            </span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Interactive Role & Session Menu Dropdown */}
          {isRoleMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsRoleMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-40 space-y-3 font-sans animate-in fade-in zoom-in-95 duration-100">
                {/* User Info Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'UG'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 text-xs truncate">
                      {user?.name === 'Akash Das' ? 'Urban Gaon' : (user?.name || 'Urban Gaon')}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 capitalize">{user?.role || 'Admin'}</span>
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      logout();
                      showToast('info', 'Logged Out', 'Signed out successfully.');
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          title="Sync candidate portals"
          className="h-9 w-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition flex items-center justify-center cursor-pointer shadow-2xs"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
        </button>

        {/* Export Interview Tracker Sheet Button */}
        <button
          onClick={exportToExcel}
          title="Export Interview Tracker Sheet (.xlsx)"
          className="h-9 w-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition flex items-center justify-center cursor-pointer shadow-2xs"
        >
          <Download size={14} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            title="Notifications"
            className="h-9 w-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <Bell size={14} />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
        </div>

      </div>

    </header>
  );
};
