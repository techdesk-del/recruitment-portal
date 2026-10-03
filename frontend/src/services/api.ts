import { Candidate, CandidateStatus, Scorecard, JobPosting, InterviewSchedule, CallRecord } from '../types';

// Dynamic base URL:
// - Uses VITE_API_URL if configured
// - When deployed on Vercel or cloud domain, uses relative '' to route to cloud API
// - On localhost, routes to local backend port 5000
const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '';
    }
  }
  return 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();

// Simple helper to send JSON requests and parse responses
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API error (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

export const recruitmentApi = {
  // --- Candidates ---
  fetchCandidates: () => request<Candidate[]>('/api/candidates'),
  
  createCandidate: (candidate: Partial<Candidate>) => 
    request<{ success: boolean; candidate: Candidate }>('/api/candidates', {
      method: 'POST',
      body: JSON.stringify(candidate)
    }),

  bulkCreateCandidates: (candidates: Candidate[]) => 
    request<{ success: boolean; count: number }>('/api/candidates/bulk', {
      method: 'POST',
      body: JSON.stringify({ candidates })
    }),

  updateCandidate: (id: string, updates: Record<string, any>) => 
    request<{ success: boolean; candidate?: Candidate }>(`/api/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  updateCandidateStatus: (id: string, status: CandidateStatus, details?: string, performedBy?: string) => 
    request<{ success: boolean; candidate?: Candidate }>(`/api/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, details, performedBy })
    }),

  updateCandidateNotes: (id: string, notes: string) => 
    request<{ success: boolean; id: string; notes: string }>(`/api/candidates/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes })
    }),

  updateCandidateRating: (id: string, rating: number) => 
    request<{ success: boolean; id: string; rating: number }>(`/api/candidates/${id}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating })
    }),

  updateCandidateRecruiter: (id: string, recruiter: string) => 
    request<{ success: boolean; id: string; recruiter: string }>(`/api/candidates/${id}/recruiter`, {
      method: 'PATCH',
      body: JSON.stringify({ recruiter })
    }),

  updateCandidateScorecard: (id: string, scorecard: Scorecard) => 
    request<{ success: boolean; id: string; scorecard: Scorecard }>(`/api/candidates/${id}/scorecard`, {
      method: 'PATCH',
      body: JSON.stringify({ scorecard })
    }),

  updateCandidateCalling: (id: string, updates: Record<string, any>) => 
    request<{ success: boolean; id: string }>(`/api/candidates/${id}/calling`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  deleteCandidate: (id: string) => 
    request<{ success: boolean; id: string }>(`/api/candidates/${id}`, { method: 'DELETE' }),

  // --- Jobs ---
  fetchJobs: () => request<JobPosting[]>('/api/jobs'),

  createJob: (job: Partial<JobPosting>) => 
    request<JobPosting>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job)
    }),

  updateJob: (id: string, updates: Partial<JobPosting>) => 
    request<{ success: boolean; job: JobPosting }>(`/api/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // --- Interviews ---
  fetchInterviews: () => request<InterviewSchedule[]>('/api/interviews'),

  createInterview: (interview: Partial<InterviewSchedule>) => 
    request<InterviewSchedule>('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(interview)
    }),

  updateInterview: (id: string, updates: Partial<InterviewSchedule>) => 
    request<{ success: boolean; interview: InterviewSchedule }>(`/api/interviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  deleteInterview: (id: string) => 
    request<{ success: boolean; id: string }>(`/api/interviews/${id}`, { method: 'DELETE' }),

  // --- Calls ---
  fetchCalls: () => request<CallRecord[]>('/api/calls'),

  createCall: (callData: Record<string, any>) => 
    request<CallRecord>('/api/calls', {
      method: 'POST',
      body: JSON.stringify(callData)
    }),

  deleteCall: (id: string) => 
    request<{ success: boolean; id: string }>(`/api/calls/${id}`, { method: 'DELETE' }),

  // --- Sync & Health ---
  triggerLinkedInSync: () => 
    request<{ status: string; message: string }>('/api/sync/linkedin-now', { method: 'POST' }),

  syncLinkedInNow: () => 
    request<{ status: string; message: string }>('/api/sync/linkedin-now', { method: 'POST' }),

  checkHealth: () => 
    request<{ status: string; timestamp: string }>('/api/health')
};
