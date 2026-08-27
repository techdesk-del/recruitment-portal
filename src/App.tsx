import React from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CandidateKanban } from './components/CandidateKanban';
import { CandidateTable } from './components/CandidateTable';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { ResumePreviewModal } from './components/ResumePreviewModal';
import { JobPostingsModal } from './components/JobPostingsModal';
import { WebhookSimulatorModal } from './components/WebhookSimulatorModal';
import { ToastContainer } from './components/ToastContainer';
import { useRecruitment } from './context/RecruitmentContext';
import { ShieldCheck, Zap, Download, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const { activeView, setActiveView, metrics, candidates, setIsWebhookModalOpen } = useRecruitment();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeView === 'overview' && <OverviewDashboard />}
        {activeView === 'pipeline' && <CandidateKanban />}
        {activeView === 'candidates' && <CandidateTable />}
      </main>

      {/* Floating Fast Action Bubble */}
      <div className="fixed bottom-6 left-6 z-30 hidden sm:flex items-center gap-2">
        <button
          onClick={() => setIsWebhookModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-bold transition hover:border-indigo-500/50 group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator"></span>
          <span>Simulate Live Webhook</span>
          <Zap size={13} className="text-emerald-400 group-hover:scale-110 transition" />
        </button>
      </div>

      {/* Global Modals & Overlays */}
      <CandidateProfileModal />
      <ResumePreviewModal />
      <JobPostingsModal />
      <WebhookSimulatorModal />
      <ToastContainer />

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950/80 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">UrbanGaon ATS</span>
            <span>•</span>
            <span>Real-Time Multi-Source Resume & Recruitment Hub</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={12} /> Real-Time PDF Engine Online
            </span>
            <span>Naukri API • LinkedIn Parser • Indeed Webhook</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
