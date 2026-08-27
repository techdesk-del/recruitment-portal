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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UrbanGaonLogo size="sm" showTagline={true} taglineText="a perfect balance" theme="light" />
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">HR Recruitment & Talent Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 size={13} /> Sourced via Naukri, LinkedIn, Indeed & UrbanGaon Portal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
