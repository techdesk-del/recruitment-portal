import React from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MainDashboard } from './components/MainDashboard';
import { CandidateTable } from './components/CandidateTable';
import { JobsView } from './components/JobsView';
import { CandidateKanban } from './components/CandidateKanban';
import { InterviewScheduler } from './components/InterviewScheduler';
import { CallingDesk } from './components/CallingDesk';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { ResumePreviewModal } from './components/ResumePreviewModal';
import { JobPostingsModal } from './components/JobPostingsModal';
import { ToastContainer } from './components/ToastContainer';
import { useRecruitment } from './context/RecruitmentContext';

export const App: React.FC = () => {
  const { activeView } = useRecruitment();

  const isPortalView = ['linkedin', 'naukri', 'indeed', 'apna', 'urbangaon', 'internshala'].includes(activeView);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar Layout matching reference CRM */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Page Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 overflow-y-auto">
          {(activeView === 'dashboard' || activeView === 'overview') && <MainDashboard />}
          {activeView === 'candidates' && <CandidateTable />}
          {isPortalView && <CandidateTable />}
          {(activeView === 'calling' || activeView === 'telecalling') && <CallingDesk />}
          {activeView === 'jobs' && <JobsView />}
          {activeView === 'pipeline' && <CandidateKanban />}
          {(activeView === 'scheduler' || activeView === 'interview-scheduler') && <InterviewScheduler />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CandidateProfileModal />
      <ResumePreviewModal />
      <JobPostingsModal />
      <ToastContainer />
    </div>
  );
};
