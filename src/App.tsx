import React from 'react';
import { Sidebar, TopHeader } from './components/layout';
import { 
  MainDashboard, 
  CandidateTable, 
  JobsView, 
  CandidateKanban, 
  InterviewScheduler,
  CallingDesk 
} from './components/views';
import { 
  CandidateProfileModal, 
  ResumePreviewModal, 
  JobPostingsModal,
  WebhookSimulatorModal 
} from './components/modals';
import { ToastContainer } from './components/common';
import { useRecruitment } from './context';

export const App: React.FC = () => {
  const { activeView } = useRecruitment();

  const isPortalView = ['linkedin', 'naukri', 'indeed', 'apna', 'urbangaon', 'internshala', 'referral'].includes(activeView);

  return (
    <div className="h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Left Sidebar Layout */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic Page Views */}
        <main className={`flex-1 w-full mx-auto ${
          activeView === 'pipeline' 
            ? 'px-6 py-4 overflow-hidden flex flex-col max-w-full' 
            : 'px-6 py-6 overflow-y-auto max-w-7xl'
        }`}>
          {(activeView === 'dashboard' || activeView === 'overview') && <MainDashboard />}
          {activeView === 'candidates' && <CandidateTable />}
          {isPortalView && <CandidateTable />}
          {activeView === 'jobs' && <JobsView />}
          {activeView === 'pipeline' && <CandidateKanban />}
          {(activeView === 'scheduler' || activeView === 'interview-scheduler') && <InterviewScheduler />}
          {(activeView === 'calling' || activeView === 'calling-desk') && <CallingDesk />}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CandidateProfileModal />
      <ResumePreviewModal />
      <JobPostingsModal />
      <WebhookSimulatorModal />
      <ToastContainer />
    </div>
  );
};
