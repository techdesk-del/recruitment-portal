import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Save, 
  CheckCircle2, 
  FileText, 
  Star, 
  Sparkles, 
  UserCheck, 
  Award,
  Clock,
  Calendar,
  Building2,
  DollarSign,
  ThumbsUp,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { Candidate, DetailedInterviewEvaluation, Scorecard } from '../types';
import { generateEvaluationFormPdf } from '../utils/evaluationFormPdfGenerator';

interface InterviewEvaluationFormProps {
  candidate: Candidate;
  onSave: (scorecard: Scorecard) => void;
}

export const InterviewEvaluationForm: React.FC<InterviewEvaluationFormProps> = ({
  candidate,
  onSave
}) => {
  const existingDetailed = candidate.scorecard?.detailed;

  const [evaluation, setEvaluation] = useState<DetailedInterviewEvaluation>(() => ({
    conductedBy: existingDetailed?.conductedBy || candidate.recruiterAssigned || 'Priya Sharma (HR Lead)',
    interviewDate: existingDetailed?.interviewDate || new Date().toISOString().slice(0, 10),
    interviewStartTime: existingDetailed?.interviewStartTime || '11:30 AM',
    department: existingDetailed?.department || candidate.department || 'Engineering & Technology',
    currentSalary: existingDetailed?.currentSalary || candidate.currentSalary || '₹14 LPA',
    expectedSalary: existingDetailed?.expectedSalary || candidate.expectedSalary || '₹18 LPA',

    coreValues: existingDetailed?.coreValues || { rp: 4, yt: 5, ss: 4, comments: '' },
    personality: existingDetailed?.personality || { rp: 4, yt: 4, ss: 4, comments: '' },
    communication: existingDetailed?.communication || { rp: 5, yt: 4, ss: 4, comments: '' },
    adaptability: existingDetailed?.adaptability || { rp: 4, yt: 4, ss: 5, comments: '' },
    technical: existingDetailed?.technical || { rp: candidate.scorecard?.technical || 4, yt: 5, ss: 4, comments: '' },
    overallImpression: existingDetailed?.overallImpression || { rp: 4, yt: 5, ss: 4, comments: '' },

    positives: existingDetailed?.positives || [
      'Strong architectural clarity & clean component structuring in React/TypeScript',
      'High receptiveness to feedback; demonstrated structured problem-solving',
      'Excellent cultural fit with UrbanGaon core tenets — fast execution & high ownership'
    ],
    negatives: existingDetailed?.negatives || [
      '30-day notice period — buyout negotiation advised for urgent sprint needs',
      'Moderate hands-on experience with real-time WebSocket scaling, but eager to learn',
      'Can further refine cross-team technical documentation habits'
    ],

    overallRecommendation: candidate.scorecard?.overallRecommendation || existingDetailed?.overallRecommendation || 'hire',
    finalComments: existingDetailed?.finalComments || candidate.scorecard?.evaluationNotes || 'Strong candidate who exceeded benchmarks in communication, problem solving, and cultural alignment. Recommended for immediate offer rollout.',
    evaluatedBy: existingDetailed?.evaluatedBy || 'Priya Sharma (HR Lead)'
  }));

  const [isSaved, setIsSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'logistics' | 'culture' | 'skills' | 'overall'>('all');

  // Compute live aggregate score
  const scoreStats = useMemo(() => {
    const sections = [
      evaluation.coreValues,
      evaluation.personality,
      evaluation.communication,
      evaluation.adaptability,
      evaluation.technical,
      evaluation.overallImpression
    ];

    let totalPoints = 0;
    const maxPoints = sections.length * 3 * 5; // 90

    sections.forEach((s) => {
      totalPoints += (s.rp || 0) + (s.yt || 0) + (s.ss || 0);
    });

    const average = (totalPoints / (sections.length * 3)).toFixed(1);
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    return { totalPoints, maxPoints, average, percentage };
  }, [evaluation]);

  const handleRatingChange = (
    section: 'coreValues' | 'personality' | 'communication' | 'adaptability' | 'technical' | 'overallImpression',
    reviewer: 'rp' | 'yt' | 'ss',
    score: number
  ) => {
    setEvaluation((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [reviewer]: score
      }
    }));
  };

  const handleCommentChange = (
    section: 'coreValues' | 'personality' | 'communication' | 'adaptability' | 'technical' | 'overallImpression',
    comments: string
  ) => {
    setEvaluation((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        comments
      }
    }));
  };

  const handlePositiveChange = (index: number, val: string) => {
    const updated = [...evaluation.positives] as [string, string, string];
    updated[index] = val;
    setEvaluation((prev) => ({ ...prev, positives: updated }));
  };

  const handleNegativeChange = (index: number, val: string) => {
    const updated = [...evaluation.negatives] as [string, string, string];
    updated[index] = val;
    setEvaluation((prev) => ({ ...prev, negatives: updated }));
  };

  const handleApplyPreset = (preset: 'strong' | 'benchmark') => {
    if (preset === 'strong') {
      setEvaluation((prev) => ({
        ...prev,
        coreValues: { rp: 5, yt: 5, ss: 5, comments: prev.coreValues.comments },
        personality: { rp: 5, yt: 4, ss: 5, comments: prev.personality.comments },
        communication: { rp: 5, yt: 5, ss: 4, comments: prev.communication.comments },
        adaptability: { rp: 5, yt: 5, ss: 5, comments: prev.adaptability.comments },
        technical: { rp: 5, yt: 5, ss: 4, comments: prev.technical.comments },
        overallImpression: { rp: 5, yt: 5, ss: 5, comments: prev.overallImpression.comments },
        overallRecommendation: 'strong_hire'
      }));
    } else {
      setEvaluation((prev) => ({
        ...prev,
        coreValues: { rp: 4, yt: 4, ss: 4, comments: prev.coreValues.comments },
        personality: { rp: 4, yt: 4, ss: 4, comments: prev.personality.comments },
        communication: { rp: 4, yt: 4, ss: 4, comments: prev.communication.comments },
        adaptability: { rp: 4, yt: 4, ss: 4, comments: prev.adaptability.comments },
        technical: { rp: 4, yt: 4, ss: 4, comments: prev.technical.comments },
        overallImpression: { rp: 4, yt: 4, ss: 4, comments: prev.overallImpression.comments },
        overallRecommendation: 'hire'
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedScorecard: Scorecard = {
      technical: evaluation.technical.rp || 4,
      communication: evaluation.communication.rp || 4,
      problemSolving: evaluation.adaptability.rp || 4,
      cultureFit: evaluation.coreValues.rp || 4,
      overallRecommendation: evaluation.overallRecommendation,
      evaluationNotes: evaluation.finalComments,
      evaluatedBy: evaluation.conductedBy,
      evaluatedAt: new Date().toISOString(),
      detailed: evaluation
    };

    onSave(updatedScorecard);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDownloadPdf = () => {
    const doc = generateEvaluationFormPdf(candidate, evaluation);
    doc.save(`UrbanGaon_Interview_Evaluation_${candidate.name.replace(/\s+/g, '_')}.pdf`);
  };

  const reviewers: { key: 'rp' | 'yt' | 'ss'; label: string; name: string; badgeClass: string }[] = [
    { key: 'rp', label: 'RP', name: 'Recruitment Lead', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
    { key: 'yt', label: 'YT', name: 'Technical Head', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
    { key: 'ss', label: 'SS', name: 'HR Department', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  ];

  const ratingOptions = [
    { score: 5, label: 'Exceptional', short: '5', activeClass: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 font-extrabold' },
    { score: 4, label: 'Above Avg', short: '4', activeClass: 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 font-extrabold' },
    { score: 3, label: 'Average', short: '3', activeClass: 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 font-extrabold' },
    { score: 2, label: 'Satisfactory', short: '2', activeClass: 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300 font-extrabold' },
    { score: 1, label: 'Unsatisfactory', short: '1', activeClass: 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300 font-extrabold' }
  ];

  // Helper to render rating row for each reviewer with clean responsive buttons
  const renderReviewerRow = (
    sectionKey: 'coreValues' | 'personality' | 'communication' | 'adaptability' | 'technical' | 'overallImpression',
    reviewer: typeof reviewers[0]
  ) => {
    const currentVal = evaluation[sectionKey][reviewer.key];

    return (
      <div 
        key={reviewer.key}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${reviewer.badgeClass}`}>
            {reviewer.label}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {reviewer.name}
          </span>
        </div>

        {/* 5-point segmented scale */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {ratingOptions.map((opt) => {
            const isSelected = currentVal === opt.score;
            return (
              <button
                type="button"
                key={opt.score}
                onClick={() => handleRatingChange(sectionKey, reviewer.key, opt.score)}
                title={`${reviewer.label}: ${opt.score} (${opt.label})`}
                className={`min-w-[34px] h-[30px] px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? opt.activeClass
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 font-medium'
                }`}
              >
                <span>{opt.short}</span>
                {isSelected && <span className="text-[10px] hidden md:inline opacity-90">{opt.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-fade-in pb-10 text-slate-900">
      
      {/* 1. EXECUTIVE COMMAND HEADER & BENCHMARK BAR */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-700">
        
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 tracking-wider">
              2025/HRD/EF/Version-1
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <CheckCircle2 size={12} /> Standard HR Assessment Protocol
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            INTERVIEW EVALUATION DOSSIER
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Multi-panel appraisal matrix evaluating core values, soft skills, technical expertise, and final hiring recommendation.
          </p>
        </div>

        {/* Live Score KPI & Fast Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* KPI Meter */}
          <div className="px-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
              ★
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Composite Score</div>
              <div className="text-base font-black text-white flex items-baseline gap-1">
                <span className="text-emerald-400">{scoreStats.average}</span>
                <span className="text-xs text-slate-400 font-normal">/ 5.0 ({scoreStats.percentage}%)</span>
              </div>
            </div>
          </div>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Download size={15} />
            <span>Download Official PDF</span>
          </button>

          {/* Save Scorecard Button */}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Save size={15} />
            <span>{isSaved ? 'Saved to ATS!' : 'Save Evaluation'}</span>
          </button>
        </div>

      </div>

      {/* 2. SCALE REFERENCE GUIDE & PRESET BAR */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Rating Scale:</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">5 – Exceptional</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">4 – Above Average</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">3 – Average</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">2 – Satisfactory</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">1 – Unsatisfactory</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('strong')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
          >
            Fill Strong Hire Bar
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('benchmark')}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
          >
            Reset to Standard
          </button>
        </div>
      </div>

      {/* 3. CANDIDATE & INTERVIEW LOGISTICS SECTION */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            Candidate & Interview Logistics
          </h3>
          <span className="text-xs text-slate-400 font-medium">Fields sync into official PDF</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Candidate Name</label>
            <input
              type="text"
              readOnly
              value={candidate.name}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Conducted By</label>
            <input
              type="text"
              value={evaluation.conductedBy}
              onChange={(e) => setEvaluation({ ...evaluation, conductedBy: e.target.value })}
              placeholder="e.g. Priya Sharma (HR Lead)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Interview Date</label>
            <input
              type="date"
              value={evaluation.interviewDate}
              onChange={(e) => setEvaluation({ ...evaluation, interviewDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Interview Start Time</label>
            <input
              type="text"
              value={evaluation.interviewStartTime}
              onChange={(e) => setEvaluation({ ...evaluation, interviewStartTime: e.target.value })}
              placeholder="e.g. 11:30 AM"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Contact Number</label>
            <input
              type="text"
              readOnly
              value={candidate.phone}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Email ID</label>
            <input
              type="text"
              readOnly
              value={candidate.email}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Position Applied For</label>
            <input
              type="text"
              readOnly
              value={candidate.jobAppliedFor}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-blue-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Department</label>
            <input
              type="text"
              value={evaluation.department}
              onChange={(e) => setEvaluation({ ...evaluation, department: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Current Salary</label>
            <input
              type="text"
              value={evaluation.currentSalary}
              onChange={(e) => setEvaluation({ ...evaluation, currentSalary: e.target.value })}
              placeholder="e.g. ₹14 LPA"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Expected Salary</label>
            <input
              type="text"
              value={evaluation.expectedSalary}
              onChange={(e) => setEvaluation({ ...evaluation, expectedSalary: e.target.value })}
              placeholder="e.g. ₹18 LPA"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 4. THE 6 OFFICIAL EVALUATION CRITERIA (2025/HRD/EF/Version-1) */}
      <div className="space-y-5">
        
        {/* CRITERION 1: CORE VALUES / CULTURE FIT */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  01
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Core Values / Culture Fit
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                The candidate's responses demonstrated a strong alignment with the company's core values:
              </p>

              {/* 5 Core Values Highlight Badges */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                  <span>✨</span> Believe in Delight (wow)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                  <span>😊</span> Spread smile
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                  <span>⚡</span> Move fast
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                  <span>🌱</span> Don’t waste
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                  <span>🎯</span> Keep it simple
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 shrink-0 self-start">
              Avg: {((evaluation.coreValues.rp + evaluation.coreValues.yt + evaluation.coreValues.ss) / 3).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Reviewers Rating Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reviewers.map((r) => renderReviewerRow('coreValues', r))}
          </div>

          {/* Section Remarks */}
          <div>
            <input
              type="text"
              placeholder="Add specific cultural alignment observations (optional)..."
              value={evaluation.coreValues.comments}
              onChange={(e) => handleCommentChange('coreValues', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* CRITERION 2: PERSONALITY DEVELOPMENT */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  02
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Personality Development
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Personality, Grooming, Attitude, Attire, and time management skills.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 shrink-0 self-start">
              Avg: {((evaluation.personality.rp + evaluation.personality.yt + evaluation.personality.ss) / 3).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Reviewers Rating Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reviewers.map((r) => renderReviewerRow('personality', r))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Notes on punctuality, grooming, attitude, and composure under pressure..."
              value={evaluation.personality.comments}
              onChange={(e) => handleCommentChange('personality', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* CRITERION 3: COMMUNICATION SKILLS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  03
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Communication Skills
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                How were the candidate’s communication skills during the interview? - Interpersonal Skills / Verbal / Passive Listening skills.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 shrink-0 self-start">
              Avg: {((evaluation.communication.rp + evaluation.communication.yt + evaluation.communication.ss) / 3).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Reviewers Rating Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reviewers.map((r) => renderReviewerRow('communication', r))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Notes on clarity of thought, articulation, listening capability..."
              value={evaluation.communication.comments}
              onChange={(e) => handleCommentChange('communication', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* CRITERION 4: ADAPTABILITY & RECEPTIVENESS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  04
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Adaptability and Receptiveness to Feedback
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                How did the candidate demonstrate their ability to adapt or improve based on new information or guidance? (Coachable / Self-motivated / Trainable / Receptive)
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 shrink-0 self-start">
              Avg: {((evaluation.adaptability.rp + evaluation.adaptability.yt + evaluation.adaptability.ss) / 3).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Reviewers Rating Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reviewers.map((r) => renderReviewerRow('adaptability', r))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Examples of how candidate adjusted code, design or assumptions upon interviewer hints..."
              value={evaluation.adaptability.comments}
              onChange={(e) => handleCommentChange('adaptability', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* CRITERION 5: TECHNICAL QUALIFICATIONS / EXPERIENCE */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  05
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Technical Qualifications / Experience
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Does the candidate possess the technical expertise, industry insights, and company-specific knowledge essential for this role?
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 shrink-0 self-start">
              Avg: {((evaluation.technical.rp + evaluation.technical.yt + evaluation.technical.ss) / 3).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Reviewers Rating Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reviewers.map((r) => renderReviewerRow('technical', r))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Coding test performance, architecture depth, edge-case analysis..."
              value={evaluation.technical.comments}
              onChange={(e) => handleCommentChange('technical', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* CRITERION 6: OVERALL IMPRESSION, 3 POSITIVES & 3 NEGATIVES */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5 hover:border-blue-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  06
                </span>
                <h4 className="text-base font-extrabold text-slate-900">
                  Overall Impression and Recommendation
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Summary of your perceptions of the candidate’s strengths/weaknesses. Final comments and recommendations for proceeding with the candidate.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-800 shrink-0 self-start">
              Avg: {((evaluation.overallImpression.rp + evaluation.overallImpression.yt + evaluation.overallImpression.ss) / 3).toFixed(1)} / 5.0
            </div>
          </div>

          {/* Reviewers Rating Row */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reviewers.map((r) => renderReviewerRow('overallImpression', r))}
          </div>

          {/* Dual Column: 3 Positives & 3 Negatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            
            {/* Positives Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <ThumbsUp size={14} className="text-emerald-700" />
                  Three Positive Aspects About Candidate
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                  Strengths
                </span>
              </div>

              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={evaluation.positives[idx] || ''}
                    onChange={(e) => handlePositiveChange(idx, e.target.value)}
                    placeholder={`Key strength #${idx + 1}...`}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>
              ))}
            </div>

            {/* Negatives Card */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-700" />
                  Three Negative Aspects About Candidate
                </label>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded-full">
                  Improvement Areas
                </span>
              </div>

              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={evaluation.negatives[idx] || ''}
                    onChange={(e) => handleNegativeChange(idx, e.target.value)}
                    placeholder={`Area of development or caveat #${idx + 1}...`}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* 5. EXECUTIVE HIRING DECISION SELECTOR TILES */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
              Final Hiring Decision & Recommendation
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'strong_hire',
                  label: 'Strong Hire',
                  desc: 'Exceptional talent; fast-track offer rollout',
                  badge: '🌟 Priority Offer',
                  color: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400'
                },
                {
                  id: 'hire',
                  label: 'Hire',
                  desc: 'Meets & exceeds role bar; proceed with offer',
                  badge: '✅ Offer Recommended',
                  color: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400'
                },
                {
                  id: 'neutral',
                  label: 'Hold / Need Info',
                  desc: 'Requires additional interview round or check',
                  badge: '⏳ Under Review',
                  color: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400'
                },
                {
                  id: 'do_not_hire',
                  label: 'Do Not Hire',
                  desc: 'Does not meet role or cultural requirements',
                  badge: '❌ Archive Application',
                  color: 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400'
                }
              ].map((item) => {
                const isSelected = evaluation.overallRecommendation === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setEvaluation({ ...evaluation, overallRecommendation: item.id as any })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all shadow-xs flex flex-col justify-between ${
                      isSelected
                        ? item.color
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm">{item.label}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-current" />}
                      </div>
                      <p className="text-[11px] opacity-80 leading-snug">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold mt-2 inline-block opacity-90">{item.badge}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Executive Summary Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-800 block">
              Final Evaluation Summary & Sign-off Notes:
            </label>
            <textarea
              rows={3}
              value={evaluation.finalComments}
              onChange={(e) => setEvaluation({ ...evaluation, finalComments: e.target.value })}
              placeholder="Provide final evaluation summary, salary remarks, joining urgency, or interviewer notes..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-2xs"
            />
          </div>

        </div>

      </div>

      {/* 5. BOTTOM ACTION FOOTER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
          <Sparkles size={16} className="text-blue-600 shrink-0" />
          <span>Form is certified under <strong>UrbanGaon HRD EF v1</strong> protocol. Instant PDF compilation ready.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            <span>Download Official PDF</span>
          </button>

          <button
            type="submit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSaved ? 'Saved to ATS!' : 'Save Evaluation Form'}</span>
          </button>
        </div>
      </div>

    </form>
  );
};
