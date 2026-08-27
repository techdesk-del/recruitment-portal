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
  Sparkles,
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
    evaluatedBy: 'Priya Sharma (Hiring Lead)'
  }));

  if (!selectedCandidate) return null;

  const cand = selectedCandidate;

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri Corporate Sync', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🔵' },
    linkedin: { label: 'LinkedIn EasyApply', class: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: '💼' },
    indeed: { label: 'Indeed Real-Time Webhook', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: '🔷' },
    apna: { label: 'Apna.co Verified Profile', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon Careers (a perfect balance)', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🏠' },
    internshala: { label: 'Internshala Direct', class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: '🎓' },
    referral: { label: 'Internal Employee Referral', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '🤝' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-indigo-400/30 shrink-0">
              {cand.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{cand.name}</h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.class} flex items-center gap-1`}>
                  <span>{badge.icon}</span> {badge.label}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {cand.atsMatchScore}% ATS Match
                </span>
              </div>
              <p className="text-xs text-indigo-300 font-semibold mt-0.5">{cand.jobAppliedFor}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Download size={14} />
              Download Resume (PDF)
            </button>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Controls Bar: Status, Recruiter, Rating */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Pipeline Stage:</span>
              <select
                value={cand.status}
                onChange={(e) => updateCandidateStatus(cand.id, e.target.value as CandidateStatus)}
                className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 font-bold focus:outline-none cursor-pointer"
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
              <span className="text-slate-400 font-medium">Assigned Recruiter:</span>
              <select
                value={cand.recruiterAssigned || ''}
                onChange={(e) => assignRecruiter(cand.id, e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
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
            <span className="text-slate-400 font-medium">Candidate Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  onClick={() => updateCandidateRating(cand.id, star)}
                  className={`cursor-pointer ${
                    star <= cand.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Candidate Dossier & ATS Info
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={13} />
            Live Resume Viewer
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'scorecard'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award size={13} />
            Interview Scorecard
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={13} />
            Activity Log ({cand.activityHistory.length})
          </button>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: PROFILE DOSSIER */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Key Compensation & Notice Period Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Total Experience</span>
                  <p className="text-base font-bold text-white mt-1">{cand.experienceYears} Years</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Current Salary</span>
                  <p className="text-base font-bold text-white mt-1">{cand.currentSalary || 'N/A'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Expected Salary</span>
                  <p className="text-base font-bold text-indigo-300 mt-1">{cand.expectedSalary}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Notice Period</span>
                  <p className="text-base font-bold text-emerald-400 mt-1">{cand.noticePeriod}</p>
                </div>
              </div>

              {/* Executive Summary */}
              {cand.resumeData.summary && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Professional Summary</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{cand.resumeData.summary}</p>
                </div>
              )}

              {/* Skills Tags */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Skills & Proficiencies</h4>
                <div className="flex flex-wrap gap-2">
                  {cand.resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience Timeline */}
              {cand.resumeData.experience.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work Experience</h4>
                  <div className="space-y-4">
                    {cand.resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5 className="text-sm font-bold text-white">{exp.role}</h5>
                          <span className="text-xs text-slate-400 font-medium">{exp.duration}</span>
                        </div>
                        <div className="text-xs text-indigo-400 font-semibold">{exp.company} — {exp.location}</div>
                        <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                          {exp.highlights.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {cand.resumeData.education.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education & Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cand.resumeData.education.map((edu, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <h5 className="text-xs font-bold text-white">{edu.degree}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{edu.institution}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                          <span>{edu.year}</span>
                          {edu.grade && <span className="text-indigo-300 font-medium">{edu.grade}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE RESUME VIEWER */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Real-Time Formatted ATS Resume Document ({cand.source.toUpperCase()})</span>
                </div>
                <button
                  onClick={() => downloadResume(cand.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  <Download size={13} />
                  Download PDF
                </button>
              </div>

              {/* Rendered A4 Styled Resume Preview */}
              <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-300 font-sans space-y-6 max-w-3xl mx-auto">
                {/* Header */}
                <div className="border-b-2 border-indigo-600 pb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{cand.name}</h2>
                    <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide mt-0.5">{cand.jobAppliedFor}</p>
                    <div className="text-xs text-slate-600 mt-2 space-x-3">
                      <span>📧 {cand.email}</span>
                      <span>📞 {cand.phone}</span>
                      <span>📍 {cand.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ORIGIN: {cand.source.toUpperCase()}
                    </span>
                    <div className="text-xs text-slate-500 mt-2 font-mono">
                      Ref: {cand.id}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-xs font-bold text-indigo-900 border-b border-indigo-200 pb-1 mb-2 tracking-wider">
                    PROFESSIONAL SUMMARY
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{cand.resumeData.summary}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xs font-bold text-indigo-900 border-b border-indigo-200 pb-1 mb-2 tracking-wider">
                    TECHNICAL SKILLS & COMPETENCIES
                  </h3>
                  <p className="text-xs text-slate-800 font-semibold">{cand.resumeData.skills.join('  •  ')}</p>
                </div>

                {/* Work Experience */}
                <div>
                  <h3 className="text-xs font-bold text-indigo-900 border-b border-indigo-200 pb-1 mb-3 tracking-wider">
                    PROFESSIONAL EXPERIENCE
                  </h3>
                  <div className="space-y-4">
                    {cand.resumeData.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-900">
                          <span>{exp.role}</span>
                          <span className="text-slate-600 font-normal">{exp.duration}</span>
                        </div>
                        <div className="text-xs font-semibold text-indigo-700">{exp.company} — {exp.location}</div>
                        <ul className="text-xs text-slate-700 space-y-1 pt-1">
                          {exp.highlights.map((h, hIdx) => (
                            <li key={hIdx}>• {h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-xs font-bold text-indigo-900 border-b border-indigo-200 pb-1 mb-2 tracking-wider">
                    EDUCATION
                  </h3>
                  {cand.resumeData.education.map((edu, idx) => (
                    <div key={idx} className="text-xs flex justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{edu.degree}</span>
                        <div className="text-slate-600">{edu.institution}</div>
                      </div>
                      <span className="text-slate-600">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCORECARD */}
          {activeTab === 'scorecard' && (
            <form onSubmit={handleSaveScorecard} className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-300">Structured Interview Scorecard Evaluation</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluate the candidate across core dimensions to generate standard ATS interview feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Technical Capability */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200">1. Technical Proficiency</span>
                    <span className="font-bold text-indigo-400">{scorecardState.technical} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={scorecardState.technical}
                    onChange={(e) => setScorecardState({ ...scorecardState, technical: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500">Core framework, architecture & coding ability</span>
                </div>

                {/* Problem Solving */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200">2. Problem Solving & Logic</span>
                    <span className="font-bold text-indigo-400">{scorecardState.problemSolving} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={scorecardState.problemSolving}
                    onChange={(e) => setScorecardState({ ...scorecardState, problemSolving: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500">System design trade-offs and analytical speed</span>
                </div>

                {/* Communication */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200">3. Communication & Articulation</span>
                    <span className="font-bold text-indigo-400">{scorecardState.communication} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={scorecardState.communication}
                    onChange={(e) => setScorecardState({ ...scorecardState, communication: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500">Clarity, presentation, active listening</span>
                </div>

                {/* Culture Fit */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200">4. Cultural Alignment</span>
                    <span className="font-bold text-indigo-400">{scorecardState.cultureFit} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={scorecardState.cultureFit}
                    onChange={(e) => setScorecardState({ ...scorecardState, cultureFit: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500">Ownership mindset, speed of execution, team player</span>
                </div>
              </div>

              {/* Overall Recommendation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300">Overall Hiring Recommendation</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'strong_hire', label: '⭐ Strong Hire', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
                    { id: 'hire', label: '✅ Hire', color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10' },
                    { id: 'neutral', label: '⚖️ Neutral / Borderline', color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                    { id: 'do_not_hire', label: '❌ Do Not Hire', color: 'border-rose-500 text-rose-400 bg-rose-500/10' }
                  ].map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setScorecardState({ ...scorecardState, overallRecommendation: rec.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        scorecardState.overallRecommendation === rec.id
                          ? rec.color
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Evaluation Feedback */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Interviewer Notes & Synthesis</label>
                <textarea
                  rows={4}
                  value={scorecardState.evaluationNotes}
                  onChange={(e) => setScorecardState({ ...scorecardState, evaluationNotes: e.target.value })}
                  placeholder="Record strengths, improvement areas, and code challenge feedback..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                Save Scorecard & Submit Evaluation
              </button>
            </form>
          )}

          {/* TAB 4: TIMELINE & NOTES */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              {/* Add Recruiter Note Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-indigo-400" />
                  Recruiter Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add private recruiter notes, compensation remarks, or interview notes..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Send size={12} />
                  Save Notes
                </button>
              </div>

              {/* Chronological Activity Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Audit History</h4>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
                  {cand.activityHistory.map((log) => (
                    <div key={log.id} className="relative space-y-0.5">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900"></span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{log.action}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(log.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{log.details}</p>
                      <span className="text-[10px] text-indigo-400">By: {log.performedBy}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
