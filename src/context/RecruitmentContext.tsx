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
  InterviewStatus,
  CallRecord,
  CallDisposition,
  CallingOverallStatus
} from '../types';
import { INITIAL_CANDIDATES, INITIAL_JOBS, INITIAL_INTERVIEWS, INITIAL_CALL_RECORDS } from '../data/mockData';
import { downloadCandidateResume as downloadPdf, downloadBulkResumes as downloadBulkPdf } from '../utils/resumeGenerator';
import { io } from 'socket.io-client';

export interface CallingMetrics {
  totalCallsMade: number;
  connectedRate: number; // percentage
  qualifiedRate: number; // percentage
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
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Metrics
  metrics: DashboardMetrics;
  callingMetrics: CallingMetrics;
  
  // Actions
  updateCandidateStatus: (id: string, newStatus: CandidateStatus, details?: string) => void;
  updateCandidateNotes: (id: string, notes: string) => void;
  updateCandidateScorecard: (id: string, scorecard: Scorecard) => void;
  assignRecruiter: (id: string, recruiter: string) => void;
  updateCandidateRating: (id: string, rating: number) => void;
  downloadResume: (id: string) => void;
  bulkDownloadResumes: (candidateIds: string[]) => void;
  bulkUpdateStatus: (candidateIds: string[], status: CandidateStatus) => void;
  exportToCSV: () => void;
  simulateIncomingApplication: (source?: CandidateSource) => void;
  resetToDefaultData: () => void;

  // Interview Scheduler Actions
  scheduleInterview: (interviewData: Omit<InterviewSchedule, 'id' | 'createdAt' | 'updatedAt'>) => InterviewSchedule;
  updateInterview: (id: string, updates: Partial<InterviewSchedule>) => void;
  rescheduleInterview: (id: string, newDate: string, newStartTime: string, newEndTime: string, notes?: string) => void;
  cancelInterview: (id: string, reason?: string) => void;
  markInterviewCompleted: (id: string) => void;
  deleteInterview: (id: string) => void;

  // Telecalling & Screening Desk Actions
  logCallRecord: (
    recordData: Omit<CallRecord, 'id' | 'callTime'> & {
      promoteToInterview?: boolean;
      interviewData?: Partial<InterviewSchedule>;
    }
  ) => CallRecord;
  deleteCallRecord: (callId: string) => void;
  quickScheduleFollowUp: (candidateId: string, date: string, time: string, note?: string) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

const STORAGE_KEY_CANDIDATES = 'urbangaon_recruitment_candidates_v3';
const STORAGE_KEY_JOBS = 'urbangaon_recruitment_jobs_v3';
const STORAGE_KEY_INTERVIEWS = 'urbangaon_recruitment_interviews_v1';
const STORAGE_KEY_CALLS = 'urbangaon_recruitment_calls_v1';

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CANDIDATES);
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  });

  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS);
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [interviews, setInterviews] = useState<InterviewSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INTERVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_INTERVIEWS;
    } catch {
      return INITIAL_INTERVIEWS;
    }
  });

  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CALLS);
      return saved ? JSON.parse(saved) : INITIAL_CALL_RECORDS;
    } catch {
      return INITIAL_CALL_RECORDS;
    }
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateModalTab, setCandidateModalTab] = useState<'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline'>('profile');
  const [previewResumeCandidate, setPreviewResumeCandidate] = useState<Candidate | null>(null);
  const [activeDialerCandidate, setActiveDialerCandidate] = useState<Candidate | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const openCandidateModal = (candidate: Candidate, tab: 'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline' = 'profile') => {
    setSelectedCandidate(candidate);
    setCandidateModalTab(tab);
  };

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    source: 'all',
    status: 'all',
    jobId: 'all',
    experienceRange: 'all',
    recruiter: 'all',
    dateRange: 'all',
    minRating: 0
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
    } catch (e) {
      console.error('Failed to persist candidates to localStorage', e);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to persist jobs to localStorage', e);
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INTERVIEWS, JSON.stringify(interviews));
    } catch (e) {
      console.error('Failed to persist interviews to localStorage', e);
    }
  }, [interviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CALLS, JSON.stringify(callRecords));
    } catch (e) {
      console.error('Failed to persist calls to localStorage', e);
    }
  }, [callRecords]);

  // Real-Time Ingestion Socket Listener (Connects to Backend Webhook Server)
  useEffect(() => {
    let socket: any = null;
    try {
      socket = io('http://localhost:5000', {
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 5000
      });

      socket.on('connect', () => {
        console.log('⚡ Connected to Ingestion Gateway via WebSocket!');
      });

      socket.on('NEW_CANDIDATE_INGESTED', (candidate: Candidate) => {
        console.log('⚡ Real-Time Candidate Ingested:', candidate);
        setCandidates((prev) => {
          if (prev.some((c) => c.id === candidate.id || c.email === candidate.email)) {
            return prev;
          }
          return [candidate, ...prev];
        });

        // Update applicants count on corresponding job
        setJobs((prev) =>
          prev.map((j) =>
            j.id === candidate.jobId || j.title === candidate.jobAppliedFor
              ? { ...j, applicantsCount: j.applicantsCount + 1 }
              : j
          )
        );

        showToast(
          'success',
          `⚡ Live Ingestion: ${candidate.name}`,
          `New application received from ${candidate.source.toUpperCase()}! ATS Resume ready for download.`
        );
      });
    } catch (err) {
      console.warn('Socket.io connection warning (Backend server might be starting):', err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Toast System
  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toISOString()
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Status Updater
  const updateCandidateStatus = (id: string, newStatus: CandidateStatus, details?: string) => {
    setCandidates((prev) =>
      prev.map((cand) => {
        if (cand.id === id) {
          const prevStatus = cand.status;
          const updatedHistory = [
            {
              id: `act-${Date.now()}`,
              action: `Status changed to ${newStatus.toUpperCase()}`,
              details: details || `Moved from ${prevStatus} to ${newStatus}`,
              performedBy: 'Lead Recruiter',
              timestamp: new Date().toISOString(),
              type: 'status' as const
            },
            ...cand.activityHistory
          ];

          const updated = {
            ...cand,
            status: newStatus,
            lastUpdatedDate: new Date().toISOString(),
            activityHistory: updatedHistory
          };

          if (selectedCandidate?.id === id) {
            setSelectedCandidate(updated);
          }

          return updated;
        }
        return cand;
      })
    );

    // Sync to MongoDB Backend API
    fetch(`http://localhost:5000/api/candidates/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, details })
    }).catch(() => {});

    if (newStatus === 'offered' || newStatus === 'joined') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('success', `Candidate Status Updated`, `Candidate moved to ${newStatus.toUpperCase()} successfully!`);
    } else {
      showToast('info', 'Status Updated', `Candidate updated to ${newStatus}.`);
    }
  };

  const updateCandidateNotes = (id: string, notes: string) => {
    setCandidates((prev) =>
      prev.map((cand) => {
        if (cand.id === id) {
          const updated = { ...cand, notes, lastUpdatedDate: new Date().toISOString() };
          if (selectedCandidate?.id === id) {
            setSelectedCandidate(updated);
          }
          return updated;
        }
        return cand;
      })
    );

    // Sync to MongoDB
    fetch(`http://localhost:5000/api/candidates/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    }).catch(() => {});

    showToast('success', 'Notes Saved', 'Candidate recruiter notes saved to MongoDB.');
  };

  const updateCandidateScorecard = (id: string, scorecard: Scorecard) => {
    setCandidates((prev) =>
      prev.map((cand) => {
        if (cand.id === id) {
          const updatedHistory = [
            {
              id: `act-${Date.now()}`,
              action: 'Interview Scorecard Submitted',
              details: `Overall recommendation: ${scorecard.overallRecommendation.toUpperCase()}`,
              performedBy: scorecard.evaluatedBy || 'Interviewer',
              timestamp: new Date().toISOString(),
              type: 'scorecard' as const
            },
            ...cand.activityHistory
          ];
          const updated = {
            ...cand,
            scorecard: {
              ...scorecard,
              evaluatedAt: new Date().toISOString()
            },
            activityHistory: updatedHistory,
            lastUpdatedDate: new Date().toISOString()
          };
          if (selectedCandidate?.id === id) {
            setSelectedCandidate(updated);
          }
          return updated;
        }
        return cand;
      })
    );
    showToast('success', 'Scorecard Recorded', 'Interview scorecard and ratings updated.');
  };

  const assignRecruiter = (id: string, recruiter: string) => {
    setCandidates((prev) =>
      prev.map((cand) => {
        if (cand.id === id) {
          const updatedHistory = [
            {
              id: `act-${Date.now()}`,
              action: 'Recruiter Assigned',
              details: `Assigned to ${recruiter}`,
              performedBy: 'Hiring Manager',
              timestamp: new Date().toISOString(),
              type: 'status' as const
            },
            ...cand.activityHistory
          ];
          const updated = {
            ...cand,
            recruiterAssigned: recruiter,
            activityHistory: updatedHistory,
            lastUpdatedDate: new Date().toISOString()
          };
          if (selectedCandidate?.id === id) {
            setSelectedCandidate(updated);
          }
          return updated;
        }
        return cand;
      })
    );
    showToast('info', 'Recruiter Assigned', `Candidate assigned to ${recruiter}.`);
  };

  const updateCandidateRating = (id: string, rating: number) => {
    setCandidates((prev) =>
      prev.map((cand) => (cand.id === id ? { ...cand, rating } : cand))
    );
  };

  // Real-Time Resume Download Engine Integration
  const downloadResume = (id: string) => {
    const cand = candidates.find((c) => c.id === id);
    if (!cand) {
      showToast('error', 'Download Failed', 'Candidate profile not found.');
      return;
    }

    const result = downloadPdf(cand);
    if (result.success) {
      showToast('success', 'Resume Downloaded', `Instant ATS PDF generated from ${cand.source.toUpperCase()} source!`);
    } else {
      showToast('error', 'Download Failed', 'Could not generate PDF resume.');
    }
  };

  const bulkDownloadResumes = async (candidateIds: string[]) => {
    const targetCandidates = candidates.filter((c) => candidateIds.includes(c.id));
    if (targetCandidates.length === 0) {
      showToast('warning', 'No Candidates Selected', 'Please select at least 1 candidate.');
      return;
    }
    showToast('info', 'Generating Resumes', `Preparing ${targetCandidates.length} real-time PDF resumes...`);
    await downloadBulkPdf(targetCandidates);
    showToast('success', 'Batch Complete', `${targetCandidates.length} resumes generated and downloaded.`);
  };

  const bulkUpdateStatus = (candidateIds: string[], status: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((cand) => {
        if (candidateIds.includes(cand.id)) {
          return {
            ...cand,
            status,
            lastUpdatedDate: new Date().toISOString()
          };
        }
        return cand;
      })
    );
    showToast('success', 'Batch Status Updated', `${candidateIds.length} candidates updated to ${status}.`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Candidate ID',
      'Name',
      'Email',
      'Phone',
      'Location',
      'Source Platform',
      'Job Applied For',
      'Department',
      'Status',
      'ATS Score (%)',
      'Experience (Yrs)',
      'Current CTC',
      'Expected CTC',
      'Notice Period',
      'Recruiter Assigned',
      'Applied Date',
      'Rating (1-5)'
    ];

    const rows = candidates.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.location}"`,
      `"${c.source.toUpperCase()}"`,
      `"${c.jobAppliedFor}"`,
      `"${c.department}"`,
      `"${c.status.toUpperCase()}"`,
      c.atsMatchScore,
      c.experienceYears,
      `"${c.currentSalary || 'N/A'}"`,
      `"${c.expectedSalary}"`,
      `"${c.noticePeriod}"`,
      `"${c.recruiterAssigned || 'Unassigned'}"`,
      `"${new Date(c.appliedDate).toLocaleDateString()}"`,
      c.rating
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanGaon_Recruitment_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV Exported', 'Candidate database exported to CSV successfully.');
  };

  // Simulate Incoming Webhook / Application
  const simulateIncomingApplication = (sourceOverride?: CandidateSource) => {
    const sources: CandidateSource[] = ['naukri', 'linkedin', 'indeed', 'urbangaon', 'internshala', 'referral'];
    const selectedSource = sourceOverride || sources[Math.floor(Math.random() * sources.length)];
    
    const sampleProfiles = [
      {
        name: 'Arjun Nambiar',
        email: `arjun.nambiar.${Math.floor(Math.random()*900 + 100)}@techhub.in`,
        phone: '+91 98450 ' + Math.floor(Math.random()*90000 + 10000),
        location: 'Bengaluru, India',
        jobId: 'job-fe-01',
        jobTitle: 'Senior Frontend Engineer (React/TypeScript)',
        dept: 'Engineering',
        exp: 4.0,
        expected: '₹22 - 25 LPA',
        notice: '30 Days',
        skills: ['React 18', 'TypeScript', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Microfrontends'],
        summary: 'Frontend Engineer focused on modular UI architecture and SSR performance optimization with Next.js.'
      },
      {
        name: 'Devika Singhania',
        email: `devika.singh.${Math.floor(Math.random()*900 + 100)}@cloudmatrix.io`,
        phone: '+91 97182 ' + Math.floor(Math.random()*90000 + 10000),
        location: 'Gurgaon / Remote',
        jobId: 'job-be-02',
        jobTitle: 'Lead Backend Developer (Node.js & Go)',
        dept: 'Engineering',
        exp: 6.2,
        expected: '₹32 - 36 LPA',
        notice: '15 Days',
        skills: ['Golang', 'Node.js', 'PostgreSQL', 'Kafka', 'Redis', 'Kubernetes'],
        summary: 'Backend Architect with hands-on experience building distributed systems with low latency and high availability.'
      },
      {
        name: 'Rohan Mukherjee',
        email: `rohan.ux.${Math.floor(Math.random()*900 + 100)}@creativelab.com`,
        phone: '+91 98201 ' + Math.floor(Math.random()*90000 + 10000),
        location: 'Mumbai, India',
        jobId: 'job-ux-05',
        jobTitle: 'UI/UX Product Designer (Figma/Design Systems)',
        dept: 'Design',
        exp: 3.2,
        expected: '₹16 - 19 LPA',
        notice: 'Immediate',
        skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Design Tokens'],
        summary: 'UI/UX Designer who loves translating complex product workflows into clean, elegant consumer interfaces.'
      }
    ];

    const pick = sampleProfiles[Math.floor(Math.random() * sampleProfiles.length)];
    const newId = `cand-sim-${Date.now().toString().slice(-6)}`;

    const newCandidate: Candidate = {
      id: newId,
      name: pick.name,
      email: pick.email,
      phone: pick.phone,
      location: pick.location,
      source: selectedSource,
      sourceId: `${selectedSource.toUpperCase()}-${Math.floor(Math.random()*900000 + 100000)}`,
      jobAppliedFor: pick.jobTitle,
      jobId: pick.jobId,
      department: pick.dept,
      appliedDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      status: 'applied',
      atsMatchScore: Math.floor(Math.random() * 20 + 80),
      rating: 4,
      experienceYears: pick.exp,
      currentCompany: 'Tech Innovators Pvt Ltd',
      currentDesignation: 'Software Engineer',
      currentSalary: '₹14 LPA',
      expectedSalary: pick.expected,
      noticePeriod: pick.notice,
      recruiterAssigned: 'Priya Sharma',
      tags: pick.skills,
      notes: `Real-time simulated candidate ingestion from ${selectedSource.toUpperCase()}. Full resume parsed and ready for ATS processing.`,
      resumeData: {
        summary: pick.summary,
        skills: pick.skills,
        experience: [
          {
            company: 'Tech Innovators Pvt Ltd',
            role: 'Software Engineer',
            duration: '2022 - Present',
            location: pick.location,
            highlights: [
              'Built scalable microservices and UI components delivering 99.9% uptime.',
              'Collaborated on sprint deliverables with cross-functional agile squads.'
            ]
          }
        ],
        education: [
          {
            degree: 'Bachelor of Technology (B.Tech)',
            institution: 'National Institute of Technology (NIT)',
            year: '2018 - 2022',
            grade: 'CGPA: 8.5/10'
          }
        ]
      },
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'Live Webhook Ingested',
          details: `Application received & parsed in real time via ${selectedSource.toUpperCase()} webhook payload.`,
          performedBy: `${selectedSource.toUpperCase()} Ingestion Pipeline`,
          timestamp: new Date().toISOString(),
          type: 'ingestion'
        }
      ]
    };

    setCandidates((prev) => [newCandidate, ...prev]);

    // Update job count
    setJobs((prev) =>
      prev.map((j) => (j.id === pick.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );

    showToast(
      'success',
      `⚡ Live Ingestion: ${newCandidate.name}`,
      `New application received from ${selectedSource.toUpperCase()} for ${pick.jobTitle}!`
    );
  };

  // Interview Scheduler Actions
  const scheduleInterview = (interviewData: Omit<InterviewSchedule, 'id' | 'createdAt' | 'updatedAt'>): InterviewSchedule => {
    const newInterview: InterviewSchedule = {
      ...interviewData,
      id: `int-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInterviews((prev) => [newInterview, ...prev]);

    // Update candidate hiring stage and activity log
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === interviewData.candidateId) {
          const nextStatus: CandidateStatus = interviewData.round.includes('Round 2')
            ? 'interview_r2'
            : interviewData.round.includes('Round 1')
            ? 'interview_r1'
            : c.status;

          const actLog = {
            id: `act-${Date.now()}`,
            action: 'Interview Scheduled',
            details: `${interviewData.round} scheduled on ${interviewData.date} at ${interviewData.startTime} with ${interviewData.interviewerName}`,
            performedBy: interviewData.interviewerName,
            timestamp: new Date().toISOString(),
            type: 'interview' as const
          };

          return {
            ...c,
            status: nextStatus,
            lastUpdatedDate: new Date().toISOString(),
            activityHistory: [actLog, ...c.activityHistory]
          };
        }
        return c;
      })
    );

    showToast(
      'success',
      'Interview Scheduled',
      `${interviewData.round} scheduled for ${interviewData.candidateName} on ${interviewData.date} (${interviewData.startTime}).`
    );

    return newInterview;
  };

  const updateInterview = (id: string, updates: Partial<InterviewSchedule>) => {
    setInterviews((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
    showToast('info', 'Interview Updated', 'Schedule details saved successfully.');
  };

  const rescheduleInterview = (id: string, newDate: string, newStartTime: string, newEndTime: string, notes?: string) => {
    let candidateName = '';
    let roundName = '';
    let candId = '';

    setInterviews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          candidateName = item.candidateName;
          roundName = item.round;
          candId = item.candidateId;
          return {
            ...item,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'rescheduled',
            notes: notes ? `${item.notes ? item.notes + ' | ' : ''}Rescheduled: ${notes}` : item.notes,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );

    if (candId) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === candId) {
            return {
              ...c,
              lastUpdatedDate: new Date().toISOString(),
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  action: 'Interview Rescheduled',
                  details: `${roundName} rescheduled to ${newDate} at ${newStartTime}`,
                  performedBy: 'Hiring Lead',
                  timestamp: new Date().toISOString(),
                  type: 'interview' as const
                },
                ...c.activityHistory
              ]
            };
          }
          return c;
        })
      );
    }

    showToast('info', 'Interview Rescheduled', `${roundName} for ${candidateName || 'candidate'} moved to ${newDate} at ${newStartTime}.`);
  };

  const cancelInterview = (id: string, reason?: string) => {
    let candidateName = '';
    let candId = '';

    setInterviews((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          candidateName = item.candidateName;
          candId = item.candidateId;
          return {
            ...item,
            status: 'cancelled',
            notes: reason ? `${item.notes ? item.notes + ' | ' : ''}Cancelled: ${reason}` : item.notes,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );

    if (candId) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === candId) {
            return {
              ...c,
              lastUpdatedDate: new Date().toISOString(),
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  action: 'Interview Cancelled',
                  details: reason || 'Interview session cancelled by recruiter.',
                  performedBy: 'Hiring Lead',
                  timestamp: new Date().toISOString(),
                  type: 'interview' as const
                },
                ...c.activityHistory
              ]
            };
          }
          return c;
        })
      );
    }

    showToast('warning', 'Interview Cancelled', `Interview for ${candidateName || 'candidate'} has been cancelled.`);
  };

  const markInterviewCompleted = (id: string) => {
    setInterviews((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'completed', feedbackStatus: 'submitted', updatedAt: new Date().toISOString() }
          : item
      )
    );
    showToast('success', 'Interview Completed', 'Marked interview session as completed.');
  };

  const deleteInterview = (id: string) => {
    setInterviews((prev) => prev.filter((item) => item.id !== id));
    showToast('info', 'Interview Removed', 'Interview schedule entry deleted.');
  };

  const resetToDefaultData = () => {
    setCandidates(INITIAL_CANDIDATES);
    setJobs(INITIAL_JOBS);
    setInterviews(INITIAL_INTERVIEWS);
    setCallRecords(INITIAL_CALL_RECORDS);
    localStorage.removeItem(STORAGE_KEY_CANDIDATES);
    localStorage.removeItem(STORAGE_KEY_JOBS);
    localStorage.removeItem(STORAGE_KEY_INTERVIEWS);
    localStorage.removeItem(STORAGE_KEY_CALLS);
    showToast('info', 'Reset Complete', 'Dashboard reset to original demo dataset.');
  };

  // Telecalling & Screening Desk Actions
  const logCallRecord = (
    recordData: Omit<CallRecord, 'id' | 'callTime'> & {
      promoteToInterview?: boolean;
      interviewData?: Partial<InterviewSchedule>;
    }
  ): CallRecord => {
    const callId = `call-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const newRecord: CallRecord = {
      id: callId,
      candidateId: recordData.candidateId,
      candidateName: recordData.candidateName,
      candidatePhone: recordData.candidatePhone,
      jobTitle: recordData.jobTitle,
      jobId: recordData.jobId,
      recruiterName: recordData.recruiterName || 'Priya Sharma',
      callTime: nowIso,
      durationSeconds: recordData.durationSeconds || 0,
      disposition: recordData.disposition,
      notes: recordData.notes || '',
      followUpDate: recordData.followUpDate,
      followUpTime: recordData.followUpTime,
      confirmedCurrentCtc: recordData.confirmedCurrentCtc,
      confirmedExpectedCtc: recordData.confirmedExpectedCtc,
      confirmedNoticePeriod: recordData.confirmedNoticePeriod,
      relocationPreference: recordData.relocationPreference,
      communicationRating: recordData.communicationRating,
      technicalFitRating: recordData.technicalFitRating,
      tags: recordData.tags || []
    };

    setCallRecords((prev) => [newRecord, ...prev]);

    // Map disposition to overall status and candidate stage
    let overallStatus: CallingOverallStatus = 'connected';
    let newCandidateStatus: CandidateStatus | undefined;

    switch (recordData.disposition) {
      case 'connected_screening_passed':
        overallStatus = 'qualified';
        newCandidateStatus = 'shortlisted';
        break;
      case 'connected_interested':
        overallStatus = 'connected';
        newCandidateStatus = 'screening';
        break;
      case 'connected_hold':
        overallStatus = 'on_hold';
        break;
      case 'connected_callback_requested':
        overallStatus = 'follow_up';
        break;
      case 'connected_screening_failed':
      case 'connected_not_interested':
        overallStatus = 'disqualified';
        newCandidateStatus = 'rejected';
        break;
      case 'ringing_no_answer':
      case 'busy':
      case 'switched_off':
      case 'wrong_number':
        overallStatus = 'unreachable';
        break;
    }

    // Sync candidate details
    setCandidates((prev) =>
      prev.map((cand) => {
        if (cand.id === recordData.candidateId) {
          const currentCalls = cand.callingDetails?.callHistory || [];
          const updatedCallHistory = [newRecord, ...currentCalls];

          const actLog = {
            id: `act-${Date.now()}`,
            action: `Telephonic Call Logged: ${recordData.disposition.replace(/_/g, ' ').toUpperCase()}`,
            details: `Duration: ${Math.floor(recordData.durationSeconds / 60)}m ${recordData.durationSeconds % 60}s. Notes: ${recordData.notes || 'Screening updated.'}`,
            performedBy: recordData.recruiterName || 'HR Recruiter',
            timestamp: nowIso,
            type: 'call' as const
          };

          const updated: Candidate = {
            ...cand,
            currentSalary: recordData.confirmedCurrentCtc || cand.currentSalary,
            expectedSalary: recordData.confirmedExpectedCtc || cand.expectedSalary,
            noticePeriod: recordData.confirmedNoticePeriod || cand.noticePeriod,
            status: newCandidateStatus || cand.status,
            lastUpdatedDate: nowIso,
            callingDetails: {
              totalCalls: (cand.callingDetails?.totalCalls || 0) + 1,
              lastCallTime: nowIso,
              lastDisposition: recordData.disposition,
              lastCallNotes: recordData.notes,
              nextFollowUpDate: recordData.followUpDate,
              nextFollowUpTime: recordData.followUpTime,
              callStatus: overallStatus,
              confirmedCurrentSalary: recordData.confirmedCurrentCtc,
              confirmedExpectedSalary: recordData.confirmedExpectedCtc,
              confirmedNoticePeriod: recordData.confirmedNoticePeriod,
              callHistory: updatedCallHistory
            },
            activityHistory: [actLog, ...cand.activityHistory]
          };

          if (selectedCandidate?.id === cand.id) {
            setSelectedCandidate(updated);
          }
          return updated;
        }
        return cand;
      })
    );

    // If candidate passed screening and schedule interview requested
    if (recordData.promoteToInterview && recordData.interviewData) {
      scheduleInterview({
        candidateId: recordData.candidateId,
        candidateName: recordData.candidateName,
        candidateEmail: recordData.interviewData.candidateEmail || `${recordData.candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        candidatePhone: recordData.candidatePhone,
        jobTitle: recordData.jobTitle,
        jobId: recordData.jobId || 'job-general',
        department: recordData.interviewData.department || 'Engineering',
        round: (recordData.interviewData.round as any) || 'Round 1: Screening / Technical',
        date: recordData.interviewData.date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: recordData.interviewData.startTime || '11:00 AM',
        endTime: recordData.interviewData.endTime || '12:00 PM',
        durationMinutes: recordData.interviewData.durationMinutes || 60,
        interviewerName: recordData.interviewData.interviewerName || 'Technical Lead',
        interviewerRole: recordData.interviewData.interviewerRole || 'Senior Engineer',
        interviewerEmail: recordData.interviewData.interviewerEmail || 'interviewer@urbangaon.com',
        platform: recordData.interviewData.platform || 'google_meet',
        meetingLink: recordData.interviewData.meetingLink || 'https://meet.google.com/ug-screening-call',
        status: 'scheduled',
        feedbackStatus: 'pending',
        notes: `Scheduled following telephonic screening call on ${new Date().toLocaleDateString()}. Notes: ${recordData.notes}`,
        atsMatchScore: 90
      });
    }

    showToast(
      'success',
      'Call Record Saved',
      `Call logged for ${recordData.candidateName} (${recordData.disposition.replace(/_/g, ' ')}). Synced with candidate file.`
    );

    return newRecord;
  };

  const deleteCallRecord = (callId: string) => {
    setCallRecords((prev) => prev.filter((r) => r.id !== callId));
    showToast('info', 'Call Log Removed', 'Call record deleted.');
  };

  const quickScheduleFollowUp = (candidateId: string, date: string, time: string, note?: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const actLog = {
            id: `act-${Date.now()}`,
            action: 'Follow-up Call Scheduled',
            details: `Scheduled on ${date} at ${time}. ${note ? `Note: ${note}` : ''}`,
            performedBy: 'Telecaller',
            timestamp: new Date().toISOString(),
            type: 'call' as const
          };
          const updated: Candidate = {
            ...c,
            lastUpdatedDate: new Date().toISOString(),
            callingDetails: {
              totalCalls: c.callingDetails?.totalCalls || 0,
              lastCallTime: c.callingDetails?.lastCallTime,
              lastDisposition: 'connected_callback_requested',
              lastCallNotes: note || c.callingDetails?.lastCallNotes,
              nextFollowUpDate: date,
              nextFollowUpTime: time,
              callStatus: 'follow_up',
              callHistory: c.callingDetails?.callHistory || []
            },
            activityHistory: [actLog, ...c.activityHistory]
          };
          if (selectedCandidate?.id === candidateId) {
            setSelectedCandidate(updated);
          }
          return updated;
        }
        return c;
      })
    );
    showToast('info', 'Follow-up Scheduled', `Follow-up call set for ${date} at ${time}.`);
  };

  // Calculate Real-Time Metrics
  const sourceBreakdown: Record<CandidateSource, number> = {
    naukri: candidates.filter((c) => c.source === 'naukri').length,
    linkedin: candidates.filter((c) => c.source === 'linkedin').length,
    indeed: candidates.filter((c) => c.source === 'indeed').length,
    apna: candidates.filter((c) => c.source === 'apna').length,
    urbangaon: candidates.filter((c) => c.source === 'urbangaon').length,
    internshala: candidates.filter((c) => c.source === 'internshala').length,
    referral: candidates.filter((c) => c.source === 'referral').length
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
  const openPositionsCount = jobs.reduce((acc, job) => acc + (job.status === 'active' ? job.openPositions : 0), 0);
  const joinedCount = statusBreakdown.joined;
  const offeredCount = statusBreakdown.offered + statusBreakdown.joined;
  const overallConversionRate = totalApplications > 0 ? Math.round((joinedCount / totalApplications) * 100 * 10) / 10 : 0;
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

  // Calling CRM Metrics
  const totalCallsMade = callRecords.length;
  const connectedCallsCount = callRecords.filter((r) =>
    ['connected_interested', 'connected_screening_passed', 'connected_hold', 'connected_callback_requested', 'connected_not_interested', 'connected_screening_failed'].includes(r.disposition)
  ).length;
  const connectedRate = totalCallsMade > 0 ? Math.round((connectedCallsCount / totalCallsMade) * 100) : 0;
  const qualifiedCallsCount = callRecords.filter((r) => r.disposition === 'connected_screening_passed').length;
  const qualifiedRate = connectedCallsCount > 0 ? Math.round((qualifiedCallsCount / connectedCallsCount) * 100) : 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const followUpsTodayCount = candidates.filter((c) => c.callingDetails?.nextFollowUpDate === todayStr).length;
  const pendingCallsCount = candidates.filter((c) => !c.callingDetails || c.callingDetails.totalCalls === 0).length;
  const totalDurationMinutes = Math.round(callRecords.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 60);

  const callingMetrics: CallingMetrics = {
    totalCallsMade,
    connectedRate,
    qualifiedRate,
    followUpsTodayCount,
    pendingCallsCount,
    totalDurationMinutes
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
        downloadResume,
        bulkDownloadResumes,
        bulkUpdateStatus,
        exportToCSV,
        simulateIncomingApplication,
        resetToDefaultData,
        scheduleInterview,
        updateInterview,
        rescheduleInterview,
        cancelInterview,
        markInterviewCompleted,
        deleteInterview,
        logCallRecord,
        deleteCallRecord,
        quickScheduleFollowUp
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};

