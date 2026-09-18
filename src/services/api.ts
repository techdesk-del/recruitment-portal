import { Candidate, CandidateStatus, Scorecard } from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export const recruitmentApi = {
  async fetchCandidates(): Promise<Candidate[]> {
    const res = await fetch(`${BASE_URL}/api/candidates`);
    if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.statusText}`);
    return res.json();
  },

  async updateCandidateStatus(
    id: string,
    status: CandidateStatus,
    details?: string,
    performedBy?: string
  ): Promise<{ success: boolean; candidate?: Candidate }> {
    const res = await fetch(`${BASE_URL}/api/candidates/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, details, performedBy })
    });
    if (!res.ok) throw new Error(`Failed to update candidate status: ${res.statusText}`);
    return res.json();
  },

  async updateCandidateNotes(
    id: string,
    notes: string
  ): Promise<{ success: boolean; id: string; notes: string }> {
    const res = await fetch(`${BASE_URL}/api/candidates/${id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });
    if (!res.ok) throw new Error(`Failed to update candidate notes: ${res.statusText}`);
    return res.json();
  },

  async updateCandidateScorecard(
    id: string,
    scorecard: Scorecard
  ): Promise<{ success: boolean; id: string; scorecard: Scorecard }> {
    const res = await fetch(`${BASE_URL}/api/candidates/${id}/scorecard`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scorecard })
    });
    if (!res.ok) throw new Error(`Failed to update candidate scorecard: ${res.statusText}`);
    return res.json();
  },

  async syncLinkedInNow(): Promise<{ status: string; message: string; count?: number }> {
    const res = await fetch(`${BASE_URL}/api/sync/linkedin-now`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`Failed to trigger LinkedIn sync: ${res.statusText}`);
    return res.json();
  }
};
