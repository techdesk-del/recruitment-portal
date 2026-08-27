import React from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CandidateKanban } from './components/CandidateKanban';
import { CandidateTable } from './components/CandidateTable';
import { JobsView } from './components/JobsView';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { ResumePreviewModal } from './components/ResumePreviewModal';
import { JobPostingsModal } from './components/JobPostingsModal';
import { ToastContainer } from './components/ToastContainer';
import { useRecruitment } from './context/RecruitmentContext';
import { CheckCircle2 } from 'lucide-react';
import { UrbanGaonLogo } from './components/UrbanGaonLogo';

export const App: React.FC = () => {
  const { activeView } = useRecruitment();

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Clean Modern Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeView === 'candidates' && <CandidateTable />}
        {activeView === 'jobs' && <JobsView />}
        {activeView === 'pipeline' && <CandidateKanban />}
        {activeView === 'overview' && <OverviewDashboard />}
      </main>

      {/* Global Modals & Overlays */}
      <CandidateProfileModal />
      <ResumePreviewModal />
      <JobPostingsModal />
      <ToastContainer />

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UrbanGaonLogo size="sm" showTagline={true} taglineText="a perfect balance" />
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">HR Recruitment & Talent Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 size={13} /> Sourced via Naukri, LinkedIn, Indeed & UrbanGaon Portal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
