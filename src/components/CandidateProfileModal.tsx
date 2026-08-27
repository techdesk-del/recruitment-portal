import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Eye, 
  Star, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Award, 
  MessageSquare, 
  Clock, 
  Send,
  UserCheck,
  FileText
} from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateStatus, Scorecard, CandidateSource } from '../types';

export const CandidateProfileModal: React.FC = () => {
  const { 
    selectedCandidate, 
    setSelectedCandidate, 
    updateCandidateStatus, 
    updateCandidateNotes, 
    updateCandidateScorecard, 
    assignRecruiter,
    updateCandidateRating,
    downloadResume 
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'scorecard' | 'timeline'>('profile');
  const [noteText, setNoteText] = useState(selectedCandidate?.notes || '');
  
  // Scorecard state
  const [scorecardState, setScorecardState] = useState<Scorecard>(() => ({
    technical: selectedCandidate?.scorecard?.technical || 4,
    problemSolving: selectedCandidate?.scorecard?.problemSolving || 4,
    communication: selectedCandidate?.scorecard?.communication || 4,
    cultureFit: selectedCandidate?.scorecard?.cultureFit || 4,
    overallRecommendation: selectedCandidate?.scorecard?.overallRecommendation || 'hire',
    evaluationNotes: selectedCandidate?.scorecard?.evaluationNotes || '',
    evaluatedBy: 'Priya Sharma (HR Lead)'
  }));

  if (!selectedCandidate) return null;

  const cand = selectedCandidate;

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-50 text-sky-700 border-sky-200', icon: '💼' },
    indeed: { label: 'Indeed', class: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🔷' },
    apna: { label: 'Apna.co', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon Careers', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏠' },
    internshala: { label: 'Internshala', class: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '🎓' },
    referral: { label: 'Employee Referral', class: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🤝' }
  };

  const badge = sourceBadges[cand.source];

  const handleSaveNotes = () => {
    updateCandidateNotes(cand.id, noteText);
  };

  const handleSaveScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidateScorecard(cand.id, scorecardState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {cand.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{cand.name}</h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.class} flex items-center gap-1`}>
                  <span>{badge.icon}</span> {badge.label}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {cand.atsMatchScore}% Match
                </span>
              </div>
              <p className="text-xs text-blue-700 font-bold mt-0.5">{cand.jobAppliedFor}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1"><MapPin size={12} /> {cand.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {cand.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone size={12} /> {cand.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => downloadResume(cand.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Download size={14} />
              Download Resume (PDF)
            </button>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Controls Bar: Status, Recruiter, Rating */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Hiring Stage:</span>
              <select
                value={cand.status}
                onChange={(e) => updateCandidateStatus(cand.id, e.target.value as CandidateStatus)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview_r1">Interview Round 1</option>
                <option value="interview_r2">Interview Round 2</option>
                <option value="offered">Offer Extended</option>
                <option value="joined">Joined / Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold">Assigned HR:</span>
              <select
                value={cand.recruiterAssigned || ''}
                onChange={(e) => assignRecruiter(cand.id, e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                <option value="Priya Sharma">Priya Sharma</option>
                <option value="Amit Singh">Amit Singh</option>
                <option value="Neha Verma">Neha Verma</option>
                <option value="Rajesh Gupta">Rajesh Gupta</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-semibold">Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  onClick={() => updateCandidateRating(cand.id, star)}
                  className={`cursor-pointer ${
                    star <= cand.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Candidate Profile
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={13} />
            Resume Details
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'scorecard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award size={13} />
            Interview Evaluation
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={13} />
            Activity History ({cand.activityHistory.length})
          </button>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: PROFILE DOSSIER */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Key Compensation & Notice Period Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Total Experience</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{cand.experienceYears} Years</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Current Salary</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{cand.currentSalary || 'N/A'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Expected Salary</span>
                  <p className="text-base font-bold text-blue-700 mt-1">{cand.expectedSalary}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Notice Period</span>
                  <p className="text-base font-bold text-emerald-700 mt-1">{cand.noticePeriod}</p>
                </div>
              </div>

              {/* Summary */}
              {cand.resumeData.summary && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Candidate Summary</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{cand.resumeData.summary}</p>
                </div>
              )}

              {/* Skills Tags */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skills & Proficiencies</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cand.resumeData.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recruiter Notes Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-blue-600" />
                    Internal HR Notes & Feedback
                  </h3>
                </div>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add screening feedback, interview notes, or remarks..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs"
                >
                  Save Note
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE RESUME */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{cand.name}</h3>
                  <p className="text-xs text-blue-700 font-bold">{cand.jobAppliedFor}</p>
                </div>

                {cand.resumeData.experience.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Work History</h4>
                    <div className="space-y-3">
                      {cand.resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-900">
                            <span>{exp.role}</span>
                            <span className="text-slate-500 font-normal">{exp.duration}</span>
                          </div>
                          <p className="text-xs text-blue-700 font-semibold">{exp.company} — {exp.location}</p>
                          <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5 pt-1">
                            {exp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cand.resumeData.education.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">Education</h4>
                    {cand.resumeData.education.map((edu, idx) => (
                      <div key={idx} className="text-xs flex justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree}</span>
                          <p className="text-slate-500">{edu.institution}</p>
                        </div>
                        <span className="text-slate-500">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SCORECARD */}
          {activeTab === 'scorecard' && (
            <form onSubmit={handleSaveScorecard} className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interview Evaluation Form</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Technical Skills (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={scorecardState.technical}
                      onChange={(e) => setScorecardState({ ...scorecardState, technical: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Communication (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={scorecardState.communication}
                      onChange={(e) => setScorecardState({ ...scorecardState, communication: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Recommendation</label>
                  <select
                    value={scorecardState.overallRecommendation}
                    onChange={(e) => setScorecardState({ ...scorecardState, overallRecommendation: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  >
                    <option value="strong_hire">Strong Hire</option>
                    <option value="hire">Hire</option>
                    <option value="neutral">Hold / Need More Info</option>
                    <option value="do_not_hire">Reject / Do Not Hire</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Save Scorecard
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ACTIVITY HISTORY */}
          {activeTab === 'timeline' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Activity Timeline</h3>
              <div className="space-y-3">
                {cand.activityHistory.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{act.action}</p>
                      <p className="text-slate-500 mt-0.5">{act.details}</p>
                      <span className="text-[10px] text-blue-600 font-semibold mt-1 block">By: {act.performedBy}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(act.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
