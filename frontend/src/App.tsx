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
  WebhookSimulatorModal,
  BulkResumeUploadModal 
} from './components/modals';
import { ToastContainer } from './components/common';
import { AuthPage } from './components/auth';
import { useRecruitment, useAuth } from './context';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeView } = useRecruitment();

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 animate-pulse">
            UG
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Verifying Corporate Authentication Session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

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
      <BulkResumeUploadModal />
      <ToastContainer />
    </div>
  );
};
