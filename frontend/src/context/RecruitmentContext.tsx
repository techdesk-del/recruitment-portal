import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Candidate,
  CandidateSource,
  CandidateStatus,
  JobPosting,
  FilterState,
  Scorecard,
  ToastMessage,
  DashboardMetrics,
  InterviewSchedule,
  CallRecord,
  CallingOverallStatus,
  ActivityLog
} from '../types';
import { INITIAL_CANDIDATES, INITIAL_JOBS, INITIAL_INTERVIEWS, INITIAL_CALL_RECORDS } from '../data/mockData';
import { downloadCandidateResume as downloadPdf, downloadBulkResumes as downloadBulkPdf } from '../utils/resumeGenerator';
import { getSocket, closeSocket } from '../services/socket';
import { recruitmentApi } from '../services/api';

export interface CallingMetrics {
  totalCallsMade: number;
  connectedRate: number;
  qualifiedRate: number;
  followUpsTodayCount: number;
  pendingCallsCount: number;
  totalDurationMinutes: number;
}

interface RecruitmentContextType {
  candidates: Candidate[];
  jobs: JobPosting[];
  interviews: InterviewSchedule[];
  callRecords: CallRecord[];
  activeView: string;
  setActiveView: (view: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  candidateModalTab: 'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline';
  setCandidateModalTab: (tab: 'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline') => void;
  openCandidateModal: (candidate: Candidate, tab?: 'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline') => void;
  previewResumeCandidate: Candidate | null;
  setPreviewResumeCandidate: (candidate: Candidate | null) => void;
  activeDialerCandidate: Candidate | null;
  setActiveDialerCandidate: (candidate: Candidate | null) => void;
  isJobModalOpen: boolean;
  setIsJobModalOpen: (open: boolean) => void;
  isWebhookModalOpen: boolean;
  setIsWebhookModalOpen: (open: boolean) => void;
  isBulkUploadModalOpen: boolean;
  setIsBulkUploadModalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  metrics: DashboardMetrics;
  callingMetrics: CallingMetrics;

  updateCandidateStatus: (id: string, newStatus: CandidateStatus, details?: string) => void;
  updateCandidateNotes: (id: string, notes: string) => void;
  updateCandidateScorecard: (id: string, scorecard: Scorecard) => void;
  assignRecruiter: (id: string, recruiter: string) => void;
  updateCandidateRating: (id: string, rating: number) => void;
  updateCandidateDetails: (id: string, updates: Partial<Candidate>, activityDetail?: string) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  downloadResume: (id: string) => void;
  bulkDownloadResumes: (candidateIds: string[]) => void;
  bulkUpdateStatus: (candidateIds: string[], status: CandidateStatus) => void;
  exportToCSV: () => void;
  exportToExcel: () => void;
  simulateIncomingApplication: (source?: CandidateSource) => void;
  bulkAddCandidates: (newCandidates: Candidate[]) => void;
  resetToDefaultData: () => void;

  scheduleInterview: (interviewData: Omit<InterviewSchedule, 'id' | 'createdAt' | 'updatedAt'>) => InterviewSchedule;
  updateInterview: (id: string, updates: Partial<InterviewSchedule>) => void;
  rescheduleInterview: (id: string, newDate: string, newStartTime: string, newEndTime: string, notes?: string) => void;
  cancelInterview: (id: string, reason?: string) => void;
  markInterviewCompleted: (id: string) => void;
  deleteInterview: (id: string) => void;

  logCallRecord: (
    recordData: Omit<CallRecord, 'id' | 'callTime'> & {
      promoteToInterview?: boolean;
      interviewData?: Partial<InterviewSchedule>;
    }
  ) => CallRecord;
  deleteCallRecord: (callId: string) => void;
  quickScheduleFollowUp: (candidateId: string, date: string, time: string, note?: string) => void;
  shiftCandidateToCalling: (candidate: Candidate) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  candidates: 'urbangaon_recruitment_candidates_v7',
  jobs: 'urbangaon_recruitment_jobs_v7',
  interviews: 'urbangaon_recruitment_interviews_v7',
  calls: 'urbangaon_recruitment_calls_v7'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (key === STORAGE_KEYS.candidates && Array.isArray(parsed)) {
      // Purge any stale deleted test candidate from client localStorage
      return parsed.filter((c: any) => c.id !== 'cand-010651' && c.email !== 'test@gmail.com' && c.name?.toLowerCase() !== 'test') as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Core State ---
  const [candidates, setCandidates] = useState<Candidate[]>(() => loadStorage(STORAGE_KEYS.candidates, INITIAL_CANDIDATES));
  const [jobs, setJobs] = useState<JobPosting[]>(() => loadStorage(STORAGE_KEYS.jobs, INITIAL_JOBS));
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(() => loadStorage(STORAGE_KEYS.interviews, INITIAL_INTERVIEWS));
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => loadStorage(STORAGE_KEYS.calls, INITIAL_CALL_RECORDS));

  // --- UI & Modal State ---
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateModalTab, setCandidateModalTab] = useState<'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline'>('profile');
  const [previewResumeCandidate, setPreviewResumeCandidate] = useState<Candidate | null>(null);
  const [activeDialerCandidate, setActiveDialerCandidate] = useState<Candidate | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    source: 'all',
    referrerId: undefined,
    status: 'all',
    jobId: 'all',
    experienceRange: 'all',
    recruiter: 'all',
    dateRange: 'all',
    minRating: 0
  });

  // --- Helper to update candidate state & timeline cleanly ---
  const updateCandidateState = (
    id: string,
    updates: Partial<Candidate>,
    activity?: { action: string; details: string; type?: ActivityLog['type']; performedBy?: string }
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const history = activity
          ? [
              {
                id: `act-${Date.now()}`,
                action: activity.action,
                details: activity.details,
                performedBy: activity.performedBy || 'Lead Recruiter',
                timestamp: new Date().toISOString(),
                type: activity.type || 'status'
              },
              ...c.activityHistory
            ]
          : c.activityHistory;

        const updated: Candidate = {
          ...c,
          ...updates,
          lastUpdatedDate: new Date().toISOString(),
          activityHistory: history
        };

        if (selectedCandidate?.id === id) {
          setSelectedCandidate(updated);
        }
        return updated;
      })
    );
  };

  // --- Persistence to LocalStorage ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.interviews, JSON.stringify(interviews));
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.calls, JSON.stringify(callRecords));
  }, [callRecords]);

  // --- Initial Data Hydration from MongoDB Atlas ---
  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        const [candRes, jobRes, intRes, callRes] = await Promise.allSettled([
          recruitmentApi.fetchCandidates(),
          recruitmentApi.fetchJobs(),
          recruitmentApi.fetchInterviews(),
          recruitmentApi.fetchCalls()
        ]);

        if (!isMounted) return;
        if (candRes.status === 'fulfilled' && candRes.value.length > 0) {
          const cleanCandidates = candRes.value.filter((c: any) => c.id !== 'cand-010651' && c.email !== 'test@gmail.com' && c.name?.toLowerCase() !== 'test');
          setCandidates(cleanCandidates);
          try {
            localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(cleanCandidates));
          } catch (e) {}
        }
        if (jobRes.status === 'fulfilled' && jobRes.value.length > 0) setJobs(jobRes.value);
        if (intRes.status === 'fulfilled' && intRes.value.length > 0) setInterviews(intRes.value);
        if (callRes.status === 'fulfilled' && callRes.value.length > 0) setCallRecords(callRes.value);
      } catch (err) {
        console.warn('Initial Atlas sync fallback to local cache:', err);
      }
    };
    hydrate();
    return () => { isMounted = false; };
  }, []);

  // --- Real-Time Socket.io Live Multi-Device Sync ---
  useEffect(() => {
    const socket = getSocket();

    // 1. New Candidate Ingested (Single / Bulk / Webhook)
    socket.on('NEW_CANDIDATE_INGESTED', (newCand: Candidate) => {
      setCandidates((prev) => {
        if (prev.some((c) => c.id === newCand.id || c.email === newCand.email)) return prev;
        const updated = [newCand, ...prev];
        try { localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      setJobs((prev) =>
        prev.map((j) => (j.id === newCand.jobId || j.title === newCand.jobAppliedFor ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
      );

      showToast('success', `⚡ Live Ingestion: ${newCand.name}`, `Application received from ${newCand.source.toUpperCase()}!`);
    });

    // 2. Candidate Status Updated across any device
    socket.on('CANDIDATE_STATUS_UPDATED', ({ id, status, activityItem }: { id: string; status: CandidateStatus; activityItem?: any }) => {
      setCandidates((prev) => {
        const next = prev.map((c) => {
          if (c.id === id) {
            const nextHistory = activityItem ? [activityItem, ...c.activityHistory] : c.activityHistory;
            return { ...c, status, activityHistory: nextHistory, lastUpdatedDate: new Date().toISOString() };
          }
          return c;
        });
        try { localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(next)); } catch (e) {}
        return next;
      });
    });

    // 3. Generic Candidate Update (Scorecard, Notes, Rating, Recruiter, etc.)
    socket.on('CANDIDATE_UPDATED', (candUpdate: Partial<Candidate> & { id: string }) => {
      setCandidates((prev) => {
        const next = prev.map((c) => (c.id === candUpdate.id ? { ...c, ...candUpdate, lastUpdatedDate: new Date().toISOString() } : c));
        try { localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(next)); } catch (e) {}
        return next;
      });
    });

    // 4. Candidate Deleted
    socket.on('CANDIDATE_DELETED', ({ id }: { id: string }) => {
      setCandidates((prev) => {
        const next = prev.filter((c) => c.id !== id);
        try { localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(next)); } catch (e) {}
        return next;
      });
    });

    // 5. Interview Scheduled / Updated / Deleted
    socket.on('INTERVIEW_CREATED', (newInt: InterviewSchedule) => {
      setInterviews((prev) => (prev.some((i) => i.id === newInt.id) ? prev : [newInt, ...prev]));
    });

    socket.on('INTERVIEW_UPDATED', (updatedInt: Partial<InterviewSchedule> & { id: string }) => {
      setInterviews((prev) => prev.map((i) => (i.id === updatedInt.id ? { ...i, ...updatedInt } : i)));
    });

    socket.on('INTERVIEW_DELETED', ({ id }: { id: string }) => {
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    });

    // 6. Calling Log Created / Deleted
    socket.on('CALL_RECORD_CREATED', (newCall: CallRecord) => {
      setCallRecords((prev) => (prev.some((c) => c.id === newCall.id) ? prev : [newCall, ...prev]));
    });

    socket.on('CALL_RECORD_DELETED', ({ id }: { id: string }) => {
      setCallRecords((prev) => prev.filter((c) => c.id !== id));
    });

    return () => {
      closeSocket();
    };
  }, []);

  // --- Real-Time Global Cloud Poller (Heartbeat for All PCs Worldwide) ---
  useEffect(() => {
    let isMounted = true;

    const pollAtlasSync = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return; // Don't burn bandwidth if tab is hidden
      }

      try {
        const [cloudCandidates, cloudInterviews, cloudCalls] = await Promise.allSettled([
          recruitmentApi.fetchCandidates(),
          recruitmentApi.fetchInterviews(),
          recruitmentApi.fetchCalls()
        ]);

        if (!isMounted) return;

        // Sync Candidates
        if (cloudCandidates.status === 'fulfilled' && Array.isArray(cloudCandidates.value) && cloudCandidates.value.length > 0) {
          const remoteList = cloudCandidates.value.filter(
            (c: any) => c.id !== 'cand-010651' && c.email !== 'test@gmail.com' && c.name?.toLowerCase() !== 'test'
          );

          setCandidates((current) => {
            // Check if there are updates
            if (current.length !== remoteList.length) {
              try { localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(remoteList)); } catch (e) {}
              return remoteList;
            }

            const currentMap = new Map(current.map((c) => [c.id, c]));
            let hasChanged = false;
            for (const rem of remoteList) {
              const loc = currentMap.get(rem.id);
              if (!loc || loc.status !== rem.status || loc.lastUpdatedDate !== rem.lastUpdatedDate || loc.notes !== rem.notes) {
                hasChanged = true;
                break;
              }
            }

            if (hasChanged) {
              try { localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(remoteList)); } catch (e) {}
              return remoteList;
            }
            return current;
          });
        }

        // Sync Interviews
        if (cloudInterviews.status === 'fulfilled' && Array.isArray(cloudInterviews.value) && cloudInterviews.value.length > 0) {
          setInterviews((curr) => (curr.length !== cloudInterviews.value.length ? cloudInterviews.value : curr));
        }

        // Sync Calling Logs
        if (cloudCalls.status === 'fulfilled' && Array.isArray(cloudCalls.value) && cloudCalls.value.length > 0) {
          setCallRecords((curr) => (curr.length !== cloudCalls.value.length ? cloudCalls.value : curr));
        }
      } catch (err) {
        // Silent background fallback
      }
    };

    // Poll every 4.5 seconds for instant multi-device sync
    const syncInterval = setInterval(pollAtlasSync, 4500);

    // Instant re-sync when tab becomes active / focused
    const handleRevalidate = () => {
      if (document.visibilityState === 'visible') {
        pollAtlasSync();
      }
    };

    window.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      window.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('focus', handleRevalidate);
    };
  }, []);

  // --- Toast Notifications ---
  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts((prev) => [newToast, ...prev]);
    setTimeout(() => removeToast(newToast.id), 4500);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const openCandidateModal = (candidate: Candidate, tab: 'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline' = 'profile') => {
    setSelectedCandidate(candidate);
    setCandidateModalTab(tab);
  };

  // --- Candidate Actions ---
  const updateCandidateStatus = (id: string, newStatus: CandidateStatus, details?: string) => {
    updateCandidateState(id, { status: newStatus }, {
      action: `Status changed to ${newStatus.toUpperCase()}`,
      details: details || `Moved to ${newStatus}`
    });

    recruitmentApi.updateCandidateStatus(id, newStatus, details).catch(() => {});

    if (newStatus === 'offered' || newStatus === 'joined') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast('success', 'Status Updated', `Candidate moved to ${newStatus.toUpperCase()}!`);
    } else {
      showToast('info', 'Status Updated', `Candidate moved to ${newStatus}.`);
    }
  };

  const updateCandidateNotes = (id: string, notes: string) => {
    updateCandidateState(id, { notes });
    recruitmentApi.updateCandidateNotes(id, notes).catch(() => {});
    showToast('success', 'Notes Saved', 'Recruiter notes saved to MongoDB.');
  };

  const updateCandidateScorecard = (id: string, scorecard: Scorecard) => {
    updateCandidateState(id, { scorecard: { ...scorecard, evaluatedAt: new Date().toISOString() } }, {
      action: 'Interview Scorecard Submitted',
      details: `Recommendation: ${scorecard.overallRecommendation.toUpperCase()}`,
      type: 'scorecard',
      performedBy: scorecard.evaluatedBy || 'Interviewer'
    });
    recruitmentApi.updateCandidateScorecard(id, scorecard).catch(() => {});
    showToast('success', 'Scorecard Recorded', 'Interview scorecard saved.');
  };

  const assignRecruiter = (id: string, recruiter: string) => {
    updateCandidateState(id, { recruiterAssigned: recruiter }, {
      action: 'Recruiter Assigned',
      details: `Assigned to ${recruiter}`,
      performedBy: 'Hiring Manager'
    });
    recruitmentApi.updateCandidateRecruiter(id, recruiter).catch(() => {});
    showToast('info', 'Recruiter Assigned', `Assigned to ${recruiter}.`);
  };

  const updateCandidateRating = (id: string, rating: number) => {
    updateCandidateState(id, { rating });
    recruitmentApi.updateCandidateRating(id, rating).catch(() => {});
  };

  const updateCandidateDetails = async (id: string, updates: Partial<Candidate>, activityDetail?: string) => {
    updateCandidateState(id, updates, {
      action: 'Candidate Profile & Details Updated',
      details: activityDetail || 'Profile information and resume details updated',
      performedBy: updates.recruiterAssigned || 'HR Recruiter'
    });
    try {
      await recruitmentApi.updateCandidate(id, updates);
      showToast('success', 'Profile Saved', 'Candidate details and resume updated successfully.');
    } catch (e) {
      console.warn('Backend update error, saved in local session:', e);
      showToast('info', 'Saved Locally', 'Candidate details saved in session.');
    }
  };

  const deleteCandidate = async (id: string) => {
    const candidateToDelete = candidates.find((c) => c.id === id);
    const candidateName = candidateToDelete?.name || 'Candidate';

    // 1. Remove from local candidates list and persist immediately to localStorage
    setCandidates((prev) => {
      const updated = prev.filter((c) => c.id !== id && (c as any)._id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.candidates, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Decrement applicants count on related job
    if (candidateToDelete?.jobId) {
      setJobs((prev) => {
        const updatedJobs = prev.map((j) =>
          j.id === candidateToDelete.jobId
            ? { ...j, applicantsCount: Math.max(0, j.applicantsCount - 1) }
            : j
        );
        try {
          localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(updatedJobs));
        } catch (e) {}
        return updatedJobs;
      });
    }

    // 3. Close open views if current candidate is selected
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(null);
    }
    if (previewResumeCandidate?.id === id) {
      setPreviewResumeCandidate(null);
    }
    if (activeDialerCandidate?.id === id) {
      setActiveDialerCandidate(null);
    }

    // 4. Call backend to persist delete in MongoDB Atlas & server cache
    try {
      await recruitmentApi.deleteCandidate(id);
      showToast('success', 'Candidate Deleted', `${candidateName} has been permanently deleted.`);
    } catch (e) {
      console.warn('Backend delete error, removed from active session:', e);
      showToast('info', 'Candidate Removed', `${candidateName} removed from session.`);
    }
  };

  const downloadResume = (id: string) => {
    const cand = candidates.find((c) => c.id === id);
    if (!cand) return showToast('error', 'Download Failed', 'Candidate not found.');
    const res = downloadPdf(cand);
    if (res.success) showToast('success', 'Resume Downloaded', `Generated ATS resume for ${cand.name}!`);
    else showToast('error', 'Download Failed', 'Could not generate PDF resume.');
  };

  const bulkDownloadResumes = async (candidateIds: string[]) => {
    const target = candidates.filter((c) => candidateIds.includes(c.id));
    if (!target.length) return showToast('warning', 'No Candidates', 'Select at least 1 candidate.');
    showToast('info', 'Generating Resumes', `Preparing ${target.length} resumes...`);
    await downloadBulkPdf(target);
    showToast('success', 'Complete', `${target.length} resumes generated.`);
  };

  const bulkUpdateStatus = (candidateIds: string[], status: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (candidateIds.includes(c.id) ? { ...c, status, lastUpdatedDate: new Date().toISOString() } : c))
    );
    candidateIds.forEach((id) => recruitmentApi.updateCandidateStatus(id, status).catch(() => {}));
    showToast('success', 'Batch Updated', `${candidateIds.length} candidates updated to ${status}.`);
  };

  // --- Interview Tracker Sheet Export (Excel & CSV) ---
  const exportToExcel = async () => {
    try {
      showToast('info', 'Generating Tracker Sheet', 'Preparing Excel workbook in exact Candidate Tracker format...');
      const response = await fetch('http://localhost:5000/api/candidates/export/excel');
      if (!response.ok) throw new Error(`Export failed with status: ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Tracker_Sheet_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('success', 'Excel Tracker Exported', 'Candidate Tracker and Dashboard successfully exported to Excel.');
    } catch (err) {
      console.warn('Backend Excel export error, falling back to tracker CSV:', err);
      exportToCSV();
    }
  };

  const exportToCSV = async () => {
    try {
      // First attempt downloading server-rendered synced CSV
      const response = await fetch('http://localhost:5000/api/candidates/export/csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Interview_Tracker_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('success', 'Tracker CSV Exported', 'Candidate Tracker exported in exact Interview Tracker format.');
        return;
      }
    } catch (err) {
      console.warn('Direct CSV fetch failed, rendering client-side tracker CSV:', err);
    }

    // Client-side exact format fallback:
    const cleanRoleStr = (role?: string) => {
      if (!role) return '';
      const r = role.trim();
      if (r.includes('Deputy Project Manager') || r === 'DPM') return 'DPM';
      if (r.includes('Executive Assistant') || r === 'EA') return 'EA';
      if (r.includes('Driver')) return 'Driver';
      if (r.includes('Civil Supervisor')) return 'Civil Supervisor';
      if (r.includes('Talent Acquisition') || r === 'Talent') return 'Talent';
      if (r.includes('Sales & Marketing') || r.includes('Sales& Marketing')) return 'Sales& Marketing';
      if (r.includes('Senior Project Manager') || r === 'Project Manager') return 'Project Manager';
      if (r.includes('Purchase Manager')) return 'Purchase Manager';
      if (r.includes('Architect')) return 'Architect';
      return r;
    };

    const formatTrackerDate = (dStr?: string) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
    };

    const csvLines = [
      'CANDIDATE-WISE INTERVIEW TRACKER',
      '"One row per candidate. \'Final Status\' drives the Dashboard pipeline counts — use the exact dropdown values."',
      'S.No,Candidate Name,Position Applied For,Source,CV Received Date,R1 Interview Date,R1 Status,R2 Interview Date,R2 Status,Final Status,Offer/Joining Date,Recruiter,Remarks'
    ];

    const sortedCandidates = [...candidates].sort((a, b) => {
      const numA = parseInt((a.id || '').replace(/\D/g, '')) || 999999;
      const numB = parseInt((b.id || '').replace(/\D/g, '')) || 999999;
      return numA - numB;
    });

    sortedCandidates.forEach((cand, idx) => {
      const sNo = idx + 1;
      const name = cand.name || '';
      const position = cleanRoleStr(cand.jobAppliedFor || cand.department);

      let source = 'Naukri';
      const src = (cand.source || '').toLowerCase();
      if (src.includes('referral')) source = 'Referrals';
      else if (src.includes('newspaper')) source = 'Newspaper AD';
      else if (src.includes('apna')) source = 'Apna';
      else if (src.includes('naukri')) source = 'Naukri';
      else if (src.includes('linkedin')) source = 'LinkedIn';
      else if (src.includes('indeed')) source = 'Indeed';

      const cvDate = formatTrackerDate(cand.appliedDate || cand.lastUpdatedDate);

      const activities = cand.activityHistory || [];
      const r1Act = activities.find(a => 
        (a.action && a.action.toUpperCase().includes('ROUND 1')) ||
        (a.details && a.details.toUpperCase().includes('ROUND 1'))
      );
      let r1Date = r1Act ? formatTrackerDate(r1Act.timestamp) : (cand.status === 'interview_r1' ? formatTrackerDate(cand.callingDetails?.nextFollowUpDate || cand.lastUpdatedDate) : '');
      let r1Status = r1Act ? (r1Act.action.toUpperCase().includes('CLEARED') ? 'Cleared' : (r1Act.action.toUpperCase().includes('REJECTED') ? 'Rejected' : 'Pending')) : '';

      const r2Act = activities.find(a => 
        (a.action && a.action.toUpperCase().includes('ROUND 2')) ||
        (a.details && a.details.toUpperCase().includes('ROUND 2'))
      );
      let r2Date = r2Act ? formatTrackerDate(r2Act.timestamp) : (cand.status === 'interview_r2' ? formatTrackerDate(cand.callingDetails?.nextFollowUpDate || cand.lastUpdatedDate) : '');
      let r2Status = r2Act ? (r2Act.action.toUpperCase().includes('CLEARED') ? 'Cleared' : (r2Act.action.toUpperCase().includes('REJECTED') ? 'Rejected' : 'Pending')) : '';

      const offerAct = activities.find(a => 
        (a.action && (a.action.toUpperCase().includes('OFFER') || a.action.toUpperCase().includes('JOINED')))
      );
      const offerDate = offerAct ? formatTrackerDate(offerAct.timestamp) : '';

      let finalStatus = '';
      const st = (cand.status || '').toLowerCase();
      if (st === 'joined' || st === 'selected' || st === 'hired') {
        finalStatus = 'Selected';
        if (!r1Status) r1Status = 'Cleared';
        if (!r2Status && r2Date) r2Status = 'Cleared';
      } else if (st === 'offered') {
        finalStatus = 'R2 Cleared / Offer Pending';
        if (!r1Status) r1Status = 'Cleared';
        if (!r2Status) r2Status = 'Cleared';
      } else if (r2Status === 'Rejected' || (st === 'rejected' && r2Date)) {
        finalStatus = 'Rejected';
      }

      let recruiter = '';
      if (cand.recruiterAssigned) {
        recruiter = cand.recruiterAssigned.replace(/^Dr\s+/i, '').trim();
      }

      let remarks = '';
      if (st === 'joined') remarks = 'Joined';
      else if (st === 'offered') remarks = 'Offer released, awaiting joining';
      else if (cand.notes && !cand.notes.startsWith('Candidate tracked')) remarks = cand.notes;

      const escape = (val: string | number) => {
        if (!val) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      csvLines.push([
        sNo,
        escape(name),
        escape(position),
        escape(source),
        escape(cvDate),
        escape(r1Date),
        escape(r1Status),
        escape(r2Date),
        escape(r2Status),
        escape(finalStatus),
        escape(offerDate),
        escape(recruiter),
        escape(remarks)
      ].join(','));
    });

    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_Tracker_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Tracker CSV Exported', 'Candidate Tracker table exported successfully in template format.');
  };

  // --- Simulation & Bulk Ingestion ---
  const simulateIncomingApplication = (sourceOverride?: CandidateSource) => {
    const sources: CandidateSource[] = ['naukri', 'linkedin', 'indeed', 'urbangaon', 'internshala', 'referral'];
    const src = sourceOverride || sources[Math.floor(Math.random() * sources.length)];
    const jobsList = jobs.length > 0 ? jobs : INITIAL_JOBS;
    const targetJob = jobsList[Math.floor(Math.random() * jobsList.length)];
    const randomNum = Math.floor(Math.random() * 900 + 100);

    const newCandidate: Candidate = {
      id: `cand-sim-${Date.now().toString().slice(-6)}`,
      name: `Applicant ${randomNum}`,
      email: `applicant.${randomNum}@candidate.io`,
      phone: `+91 98${randomNum} 10${randomNum % 100}`,
      location: 'Bengaluru, India',
      source: src,
      sourceId: `${src.toUpperCase()}-${randomNum}`,
      jobAppliedFor: targetJob.title,
      jobId: targetJob.id,
      department: targetJob.department,
      appliedDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      status: 'applied',
      atsMatchScore: Math.floor(Math.random() * 18 + 80),
      rating: 4,
      experienceYears: 3.5,
      currentCompany: 'Tech Services Pvt Ltd',
      currentDesignation: 'Software Engineer',
      currentSalary: '₹12 LPA',
      expectedSalary: '₹18 - 22 LPA',
      noticePeriod: '30 Days',
      recruiterAssigned: 'Dr Sharmila Yadav',
      tags: targetJob.platforms || ['React', 'Node.js', 'TypeScript'],
      notes: `Application received via ${src.toUpperCase()} live simulation.`,
      resumeData: {
        summary: `Experienced developer with 3.5+ years building scalable software products for ${targetJob.title}.`,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'REST APIs', 'Git'],
        experience: [{ company: 'Tech Services Pvt Ltd', role: 'Software Engineer', duration: '2022 - Present', location: 'Bengaluru', highlights: ['Delivered core features on time with 99.9% uptime.'] }],
        education: [{ degree: 'B.Tech Computer Science', institution: 'NIT', year: '2018 - 2022' }]
      },
      activityHistory: [{
        id: `act-${Date.now()}`,
        action: 'Application Ingested',
        details: `Simulated application received from ${src.toUpperCase()}`,
        performedBy: `${src.toUpperCase()} Gateway`,
        timestamp: new Date().toISOString(),
        type: 'ingestion'
      }]
    };

    setCandidates((prev) => [newCandidate, ...prev]);
    recruitmentApi.createCandidate(newCandidate).catch(() => {});
    setJobs((prev) => prev.map((j) => (j.id === targetJob.id ? { ...j, applicantsCount: j.applicantsCount + 1 } : j)));
    showToast('success', `⚡ Live Ingestion: ${newCandidate.name}`, `Application received from ${src.toUpperCase()} for ${targetJob.title}!`);
  };

  const bulkAddCandidates = (newCandidates: Candidate[]) => {
    if (!newCandidates?.length) return;
    const unique = newCandidates.filter((nc) => !candidates.some((c) => c.id === nc.id || c.email === nc.email));
    if (!unique.length) return showToast('info', 'No New Candidates', 'All candidates already exist.');

    setCandidates((prev) => [...unique, ...prev]);
    recruitmentApi.bulkCreateCandidates(unique).catch(() => {});

    // Update job counts
    setJobs((prev) =>
      prev.map((j) => {
        const added = unique.filter((c) => c.jobId === j.id).length;
        return added ? { ...j, applicantsCount: j.applicantsCount + added } : j;
      })
    );

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast('success', `🚀 ${unique.length} Resumes Added!`, 'Profiles extracted and added to dashboard.');
  };

  // --- Interview Scheduler Actions ---
  const scheduleInterview = (data: Omit<InterviewSchedule, 'id' | 'createdAt' | 'updatedAt'>): InterviewSchedule => {
    const newInterview: InterviewSchedule = {
      ...data,
      id: `int-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInterviews((prev) => [newInterview, ...prev]);
    const nextStatus: CandidateStatus = data.round.includes('Round 2') ? 'interview_r2' : 'interview_r1';
    
    updateCandidateState(data.candidateId, { status: nextStatus }, {
      action: 'Interview Scheduled',
      details: `${data.round} on ${data.date} at ${data.startTime} with ${data.interviewerName}`,
      performedBy: data.interviewerName,
      type: 'interview'
    });

    recruitmentApi.createInterview(newInterview).catch(() => {});
    recruitmentApi.updateCandidateStatus(data.candidateId, nextStatus, `${data.round} scheduled`).catch(() => {});
    showToast('success', 'Interview Scheduled', `${data.round} set for ${data.candidateName}.`);
    return newInterview;
  };

  const updateInterview = (id: string, updates: Partial<InterviewSchedule>) => {
    setInterviews((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item)));
    recruitmentApi.updateInterview(id, updates).catch(() => {});
    showToast('info', 'Updated', 'Interview details updated.');
  };

  const rescheduleInterview = (id: string, newDate: string, newStartTime: string, newEndTime: string, notes?: string) => {
    const target = interviews.find((i) => i.id === id);
    if (!target) return;

    setInterviews((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, date: newDate, startTime: newStartTime, endTime: newEndTime, status: 'rescheduled', notes: notes ? `${i.notes || ''} | Rescheduled: ${notes}` : i.notes, updatedAt: new Date().toISOString() } : i
      )
    );

    updateCandidateState(target.candidateId, {}, {
      action: 'Interview Rescheduled',
      details: `${target.round} rescheduled to ${newDate} at ${newStartTime}`,
      type: 'interview'
    });

    recruitmentApi.updateInterview(id, { date: newDate, startTime: newStartTime, endTime: newEndTime, status: 'rescheduled', notes }).catch(() => {});
    showToast('info', 'Rescheduled', `${target.round} moved to ${newDate} at ${newStartTime}.`);
  };

  const cancelInterview = (id: string, reason?: string) => {
    const target = interviews.find((i) => i.id === id);
    if (!target) return;

    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'cancelled', notes: reason || i.notes, updatedAt: new Date().toISOString() } : i)));
    updateCandidateState(target.candidateId, {}, { action: 'Interview Cancelled', details: reason || 'Cancelled by recruiter', type: 'interview' });
    recruitmentApi.updateInterview(id, { status: 'cancelled', notes: reason }).catch(() => {});
    showToast('warning', 'Cancelled', `Interview for ${target.candidateName} cancelled.`);
  };

  const markInterviewCompleted = (id: string) => {
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'completed', feedbackStatus: 'submitted', updatedAt: new Date().toISOString() } : i)));
    recruitmentApi.updateInterview(id, { status: 'completed', feedbackStatus: 'submitted' }).catch(() => {});
    showToast('success', 'Completed', 'Interview marked as completed.');
  };

  const deleteInterview = (id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
    recruitmentApi.deleteInterview(id).catch(() => {});
    showToast('info', 'Deleted', 'Interview record deleted.');
  };

  // --- Calling & Screening CRM ---
  const logCallRecord = (
    data: Omit<CallRecord, 'id' | 'callTime'> & { promoteToInterview?: boolean; interviewData?: Partial<InterviewSchedule> }
  ): CallRecord => {
    const nowIso = new Date().toISOString();
    const newRecord: CallRecord = {
      ...data,
      id: `call-${Date.now().toString().slice(-6)}`,
      recruiterName: data.recruiterName || 'Dr Sharmila Yadav',
      callTime: nowIso,
      durationSeconds: data.durationSeconds || 0,
      notes: data.notes || '',
      tags: data.tags || []
    };

    setCallRecords((prev) => [newRecord, ...prev]);

    // Map disposition to stage
    let callStatus: CallingOverallStatus = 'connected';
    let newStage: CandidateStatus | undefined;
    if (['connected_screening_passed', 'connected_interested'].includes(data.disposition)) {
      callStatus = data.disposition === 'connected_screening_passed' ? 'qualified' : 'connected';
      newStage = data.promoteToInterview ? 'interview_r1' : 'screening';
    } else if (data.disposition === 'connected_callback_requested') {
      callStatus = 'follow_up';
    } else if (['connected_screening_failed', 'connected_not_interested'].includes(data.disposition)) {
      callStatus = 'disqualified';
      newStage = 'rejected';
    } else if (['ringing_no_answer', 'busy', 'switched_off'].includes(data.disposition)) {
      callStatus = 'unreachable';
    }

    const cand = candidates.find((c) => c.id === data.candidateId);
    if (cand) {
      const callHistory = [newRecord, ...(cand.callingDetails?.callHistory || [])];
      updateCandidateState(
        data.candidateId,
        {
          ...(newStage && { status: newStage }),
          currentSalary: data.confirmedCurrentCtc || cand.currentSalary,
          expectedSalary: data.confirmedExpectedCtc || cand.expectedSalary,
          noticePeriod: data.confirmedNoticePeriod || cand.noticePeriod,
          location: data.confirmedLocation || cand.location,
          isCallingQueued: false,
          callingDetails: {
            totalCalls: (cand.callingDetails?.totalCalls || 0) + 1,
            lastCallTime: nowIso,
            lastDisposition: data.disposition,
            lastCallNotes: data.notes,
            nextFollowUpDate: data.followUpDate,
            nextFollowUpTime: data.followUpTime,
            callStatus,
            confirmedCurrentSalary: data.confirmedCurrentCtc,
            confirmedExpectedSalary: data.confirmedExpectedCtc,
            confirmedNoticePeriod: data.confirmedNoticePeriod,
            confirmedLocation: data.confirmedLocation,
            callHistory
          }
        },
        {
          action: `Screening: ${data.disposition.replace(/_/g, ' ').toUpperCase()}`,
          details: `Duration: ${Math.floor((data.durationSeconds || 0) / 60)}m. Notes: ${data.notes || 'Screened.'}`,
          type: 'call'
        }
      );
    }

    if (data.promoteToInterview && data.interviewData) {
      scheduleInterview({
        candidateId: data.candidateId,
        candidateName: data.candidateName,
        candidateEmail: data.interviewData.candidateEmail || `${data.candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        candidatePhone: data.candidatePhone || '',
        jobTitle: data.jobTitle || 'Software Engineer',
        jobId: data.jobId || 'job-general',
        department: data.interviewData.department || 'Engineering',
        round: data.interviewData.round || 'Round 1: Screening / Technical',
        date: data.interviewData.date || new Date().toISOString().slice(0, 10),
        startTime: data.interviewData.startTime || '14:00',
        endTime: data.interviewData.endTime || '15:00',
        interviewerName: data.interviewData.interviewerName || 'Engineering Lead',
        interviewerRole: data.interviewData.interviewerRole || 'Engineering Lead',
        interviewerEmail: data.interviewData.interviewerEmail || 'lead@urbangaon.com',
        platform: data.interviewData.platform || 'google_meet',
        meetingLink: data.interviewData.meetingLink || 'https://meet.google.com/urbangaon-interview',
        status: 'scheduled',
        feedbackStatus: 'pending',
        notes: data.notes
      });
    }

    recruitmentApi.createCall(newRecord).catch(() => {});
    showToast('success', 'Call Synced', `Screening logged for ${data.candidateName}.`);
    return newRecord;
  };

  const deleteCallRecord = (callId: string) => {
    setCallRecords((prev) => prev.filter((r) => r.id !== callId));
    recruitmentApi.deleteCall(callId).catch(() => {});
    showToast('info', 'Deleted', 'Call record deleted.');
  };

  const quickScheduleFollowUp = (candidateId: string, date: string, time: string, note?: string) => {
    const cand = candidates.find((c) => c.id === candidateId);
    if (!cand) return;

    updateCandidateState(
      candidateId,
      {
        callingDetails: {
          ...cand.callingDetails,
          totalCalls: cand.callingDetails?.totalCalls || 0,
          nextFollowUpDate: date,
          nextFollowUpTime: time,
          callStatus: 'follow_up',
          callHistory: cand.callingDetails?.callHistory || []
        }
      },
      { action: 'Follow-up Call Scheduled', details: `Scheduled on ${date} at ${time}. ${note || ''}`, type: 'call' }
    );

    recruitmentApi.updateCandidateCalling(candidateId, { callingDetails: { nextFollowUpDate: date, nextFollowUpTime: time, callStatus: 'follow_up' } }).catch(() => {});
    showToast('info', 'Follow-up Scheduled', `Follow-up set for ${date} at ${time}.`);
  };

  const shiftCandidateToCalling = (candidate: Candidate) => {
    updateCandidateState(
      candidate.id,
      { isCallingQueued: true },
      { action: 'Shifted to Calling Desk', details: 'Candidate queued for telephonic evaluation.', type: 'call' }
    );
    recruitmentApi.updateCandidateCalling(candidate.id, { isCallingQueued: true }).catch(() => {});
    setActiveDialerCandidate(candidate);
    setActiveView('calling');
    showToast('success', 'Calling Desk', `${candidate.name} is now queued for calling.`);
  };

  const resetToDefaultData = () => {
    setCandidates(INITIAL_CANDIDATES);
    setJobs(INITIAL_JOBS);
    setInterviews(INITIAL_INTERVIEWS);
    setCallRecords(INITIAL_CALL_RECORDS);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    showToast('info', 'Reset', 'Demo data reloaded.');
  };

  // --- Real-Time Analytics & Metrics Calculation ---
  const sourceBreakdown: Record<CandidateSource, number> = {
    naukri: candidates.filter((c) => c.source === 'naukri').length,
    linkedin: candidates.filter((c) => c.source === 'linkedin').length,
    indeed: candidates.filter((c) => c.source === 'indeed').length,
    apna: candidates.filter((c) => c.source === 'apna').length,
    urbangaon: candidates.filter((c) => c.source === 'urbangaon').length,
    internshala: candidates.filter((c) => c.source === 'internshala').length,
    referral: candidates.filter((c) => c.source === 'referral').length,
    newspaper: candidates.filter((c) => c.source === 'newspaper').length,
    other: candidates.filter((c) => c.source === 'other').length
  };

  const statusBreakdown: Record<CandidateStatus, number> = {
    applied: candidates.filter((c) => c.status === 'applied').length,
    screening: candidates.filter((c) => c.status === 'screening').length,
    shortlisted: candidates.filter((c) => c.status === 'shortlisted').length,
    interview_r1: candidates.filter((c) => c.status === 'interview_r1').length,
    interview_r2: candidates.filter((c) => c.status === 'interview_r2').length,
    offered: candidates.filter((c) => c.status === 'offered').length,
    joined: candidates.filter((c) => c.status === 'joined').length,
    rejected: candidates.filter((c) => c.status === 'rejected').length
  };

  const totalApplications = candidates.length;
  const activeCandidates = candidates.filter((c) => c.status !== 'rejected' && c.status !== 'joined').length;
  const activeInterviews = statusBreakdown.interview_r1 + statusBreakdown.interview_r2;
  const openPositionsCount = jobs.reduce((acc, j) => acc + (j.status === 'active' ? j.openPositions : 0), 0);
  const joinedCount = statusBreakdown.joined;
  const offeredCount = statusBreakdown.offered + statusBreakdown.joined;
  const overallConversionRate = totalApplications > 0 ? Math.round((joinedCount / totalApplications) * 1000) / 10 : 0;
  const offerAcceptanceRate = offeredCount > 0 ? Math.round((joinedCount / offeredCount) * 100) : 85;

  const metrics: DashboardMetrics = {
    totalApplications,
    activeCandidates,
    avgTimeToHireDays: 14.2,
    overallConversionRate,
    openPositionsCount,
    activeInterviews,
    offerAcceptanceRate,
    sourceBreakdown,
    statusBreakdown,
    monthlyTrend: [
      { date: 'Aug 01', applications: 24, hires: 1 },
      { date: 'Aug 05', applications: 38, hires: 2 },
      { date: 'Aug 10', applications: 56, hires: 1 },
      { date: 'Aug 15', applications: 72, hires: 3 },
      { date: 'Aug 20', applications: 94, hires: 2 },
      { date: 'Aug 26', applications: totalApplications, hires: joinedCount }
    ]
  };

  // Calling Metrics
  const totalCallsMade = callRecords.length;
  const connectedCalls = callRecords.filter((r) => ['connected_interested', 'connected_screening_passed', 'connected_hold', 'connected_callback_requested', 'connected_not_interested', 'connected_screening_failed'].includes(r.disposition)).length;
  const qualifiedCalls = callRecords.filter((r) => r.disposition === 'connected_screening_passed').length;
  const todayStr = new Date().toISOString().split('T')[0];

  const callingMetrics: CallingMetrics = {
    totalCallsMade,
    connectedRate: totalCallsMade > 0 ? Math.round((connectedCalls / totalCallsMade) * 100) : 0,
    qualifiedRate: connectedCalls > 0 ? Math.round((qualifiedCalls / connectedCalls) * 100) : 0,
    followUpsTodayCount: candidates.filter((c) => c.callingDetails?.nextFollowUpDate === todayStr).length,
    pendingCallsCount: candidates.filter((c) => !c.callingDetails || c.callingDetails.totalCalls === 0).length,
    totalDurationMinutes: Math.round(callRecords.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 60)
  };

  return (
    <RecruitmentContext.Provider
      value={{
        candidates,
        jobs,
        interviews,
        callRecords,
        activeView,
        setActiveView,
        filters,
        setFilters,
        selectedCandidate,
        setSelectedCandidate,
        candidateModalTab,
        setCandidateModalTab,
        openCandidateModal,
        previewResumeCandidate,
        setPreviewResumeCandidate,
        activeDialerCandidate,
        setActiveDialerCandidate,
        isJobModalOpen,
        setIsJobModalOpen,
        isWebhookModalOpen,
        setIsWebhookModalOpen,
        isBulkUploadModalOpen,
        setIsBulkUploadModalOpen,
        toasts,
        showToast,
        removeToast,
        metrics,
        callingMetrics,
        updateCandidateStatus,
        updateCandidateNotes,
        updateCandidateScorecard,
        assignRecruiter,
        updateCandidateRating,
        updateCandidateDetails,
        deleteCandidate,
        downloadResume,
        bulkDownloadResumes,
        bulkUpdateStatus,
        exportToCSV,
        exportToExcel,
        simulateIncomingApplication,
        bulkAddCandidates,
        resetToDefaultData,
        scheduleInterview,
        updateInterview,
        rescheduleInterview,
        cancelInterview,
        markInterviewCompleted,
        deleteInterview,
        logCallRecord,
        deleteCallRecord,
        quickScheduleFollowUp,
        shiftCandidateToCalling
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) throw new Error('useRecruitment must be used within a RecruitmentProvider');
  return context;
};
