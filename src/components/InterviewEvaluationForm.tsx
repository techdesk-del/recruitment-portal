import React, { useState, useMemo } from 'react';
import {
  Download,
  Save,
  CheckCircle2,
  FileText,
  Star,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  UserCheck,
  Layers
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
  const [activeTab, setActiveTab] = useState<'all' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6'>('all');
  const [showLogistics, setShowLogistics] = useState(false);

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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const ratingPills = [
    { score: 5, label: 'Exceptional', activeClass: 'bg-emerald-600 text-white shadow-xs font-black' },
    { score: 4, label: 'Above Avg', activeClass: 'bg-blue-600 text-white shadow-xs font-black' },
    { score: 3, label: 'Average', activeClass: 'bg-indigo-600 text-white shadow-xs font-black' },
    { score: 2, label: 'Satisfactory', activeClass: 'bg-amber-500 text-white shadow-xs font-black' },
    { score: 1, label: 'Unsatisfactory', activeClass: 'bg-rose-600 text-white shadow-xs font-black' }
  ];

  const criteriaList = [
    {
      id: 'q1',
      key: 'coreValues' as const,
      num: '01',
      title: 'Core Values & Culture Fit',
      desc: 'Alignment with company core values (Delight, Smile, Move Fast, Don\'t Waste, Keep it Simple).',
      bullets: ['✨ Delight', '😊 Smile', '⚡ Move Fast', '🌱 Don’t Waste', '🎯 Keep it Simple']
    },
    {
      id: 'q2',
      key: 'personality' as const,
      num: '02',
      title: 'Personality Development',
      desc: 'Personality, Grooming, Attitude, Attire, and time management skills.'
    },
    {
      id: 'q3',
      key: 'communication' as const,
      num: '03',
      title: 'Communication Skills',
      desc: 'Interpersonal, verbal articulation, active listening, and composure.'
    },
    {
      id: 'q4',
      key: 'adaptability' as const,
      num: '04',
      title: 'Adaptability & Receptiveness',
      desc: 'Ability to adapt, learn from hints, coachability, and self-motivation.'
    },
    {
      id: 'q5',
      key: 'technical' as const,
      num: '05',
      title: 'Technical Qualifications & Depth',
      desc: 'Technical expertise, problem-solving speed, industry insights, and architecture knowledge.'
    },
    {
      id: 'q6',
      key: 'overallImpression' as const,
      num: '06',
      title: 'Overall Impression & Recommendation',
      desc: 'Holistic perception of candidate strengths, growth potential, and offer readiness.'
    }
  ];

  const filteredCriteria = activeTab === 'all'
    ? criteriaList
    : criteriaList.filter(c => c.id === activeTab);

  return (
    <div className="space-y-4 animate-fade-in text-slate-900 pb-4">

      {/* 1. COMPACT EXECUTIVE HEADER BAR (NO VERTICAL WASTE) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-700">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-black text-sm shrink-0">
            ★
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                2025/HRD/EF/Version-1
              </span>
              <span className="text-xs font-black tracking-tight text-white">
                INTERVIEW EVALUATION DOSSIER
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              {candidate.name} • {candidate.jobAppliedFor} ({candidate.department})
            </p>
          </div>
        </div>

        {/* Live Score + Fast Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">

          {/* Score Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Score:</span>
            <span className="text-sm font-black text-emerald-400">{scoreStats.average} / 5.0</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">({scoreStats.percentage}%)</span>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Save size={13} />
            <span>{isSaved ? 'Saved!' : 'Save Evaluation'}</span>
          </button>
        </div>

      </div>

      {/* 2. MAIN 2-COLUMN SPLIT SCREEN (ZERO SCROLL COCKPIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT COLUMN: 6 EVALUATION QUESTIONS (7 OF 12 COLS) */}
        <div className="lg:col-span-7 space-y-3">

          {/* Criterion Filter Pills + Presets */}
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                All 6 Criteria
              </button>
              {criteriaList.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setActiveTab(c.id as any)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${activeTab === c.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {c.num}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleApplyPreset('strong')}
                title="Fill Strong Bar (5s)"
                className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition"
              >
                Preset 5★
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('benchmark')}
                title="Fill Standard Bar (4s)"
                className="text-[10px] font-bold text-slate-600 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition"
              >
                Preset 4★
              </button>
            </div>
          </div>

          {/* Criteria Cards List */}
          <div className="space-y-2.5 max-h-[calc(94vh-220px)] overflow-y-auto pr-1">
            {filteredCriteria.map((item) => {
              const currentSection = evaluation[item.key];
              const sectionAvg = ((currentSection.rp + currentSection.yt + currentSection.ss) / 3).toFixed(1);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 hover:border-blue-300 transition-colors"
                >
                  {/* Criterion Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          {item.num}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>

                      {/* Bullets for Core values */}
                      {item.bullets && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.bullets.map((b, i) => (
                            <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                      Avg: {sectionAvg}
                    </span>
                  </div>

                  {/* 3 Reviewer Rating Rows (RP, YT, SS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-100">
                    {reviewers.map((r) => {
                      const val = currentSection[r.key];
                      return (
                        <div key={r.key} className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${r.badgeClass}`}>
                            {r.label}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((starNum) => {
                                const isFilled = starNum <= val;
                                return (
                                  <button
                                    type="button"
                                    key={starNum}
                                    onClick={() => handleRatingChange(item.key, r.key, starNum)}
                                    title={`${r.label}: ${starNum} Stars (${ratingPills.find(p => p.score === starNum)?.label})`}
                                    className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                                  >
                                    <Star
                                      size={14}
                                      className={`transition-colors ${isFilled
                                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]'
                                        : 'text-slate-300 hover:text-amber-300'
                                        }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 font-mono min-w-[20px] text-right">
                              {val}★
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact Note input */}
                  <div>
                    <input
                      type="text"
                      value={currentSection.comments}
                      onChange={(e) => handleCommentChange(item.key, e.target.value)}
                      placeholder="Add observation or notes for this section..."
                      className="w-full px-2.5 py-1 rounded-lg bg-slate-50/70 border border-slate-200 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: LOGISTICS, 360 FEEDBACK & DECISION (5 OF 12 COLS) */}
        <div className="lg:col-span-5 space-y-3 max-h-[calc(94vh-180px)] overflow-y-auto pr-1">

          {/* A. COLLAPSIBLE LOGISTICS ACCORDION */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div
              onClick={() => setShowLogistics(!showLogistics)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Interview Logistics & Compensation
                </h4>
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-700">
                {showLogistics ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {showLogistics && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Conducted By</label>
                  <input
                    type="text"
                    value={evaluation.conductedBy}
                    onChange={(e) => setEvaluation({ ...evaluation, conductedBy: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Interview Date</label>
                  <input
                    type="date"
                    value={evaluation.interviewDate}
                    onChange={(e) => setEvaluation({ ...evaluation, interviewDate: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Current CTC</label>
                  <input
                    type="text"
                    value={evaluation.currentSalary}
                    onChange={(e) => setEvaluation({ ...evaluation, currentSalary: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block">Expected CTC</label>
                  <input
                    type="text"
                    value={evaluation.expectedSalary}
                    onChange={(e) => setEvaluation({ ...evaluation, expectedSalary: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* B. 360 FEEDBACK: 3 POSITIVES & 3 NEGATIVES */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">

            {/* 3 Positives */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp size={13} className="text-emerald-600" />
                  3 Positive Aspects (Strengths)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Highlights
                </span>
              </div>

              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={evaluation.positives[idx] || ''}
                    onChange={(e) => handlePositiveChange(idx, e.target.value)}
                    placeholder={`Key strength #${idx + 1}...`}
                    className="w-full px-2.5 py-1 rounded-lg bg-emerald-50/40 border border-emerald-200 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>

            {/* 3 Negatives */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-rose-600" />
                  3 Negative Aspects (Improvements)
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                  Caveats
                </span>
              </div>

              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-rose-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={evaluation.negatives[idx] || ''}
                    onChange={(e) => handleNegativeChange(idx, e.target.value)}
                    placeholder={`Improvement area #${idx + 1}...`}
                    className="w-full px-2.5 py-1 rounded-lg bg-rose-50/40 border border-rose-200 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* C. FINAL HIRING DECISION & EXECUTIVE SUMMARY */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
              Final Recommendation Decision
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'strong_hire', label: 'Strong Hire', badge: '🌟 Priority', color: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400' },
                { id: 'hire', label: 'Hire', badge: '✅ Recommended', color: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400' },
                { id: 'neutral', label: 'Hold / Info', badge: '⏳ Review', color: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400' },
                { id: 'do_not_hire', label: 'Do Not Hire', badge: '❌ Reject', color: 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400' }
              ].map((item) => {
                const isSelected = evaluation.overallRecommendation === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setEvaluation({ ...evaluation, overallRecommendation: item.id as any })}
                    className={`p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${isSelected
                      ? item.color
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[9px] opacity-80">{item.badge}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={14} className="text-current shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Final Comments */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">
                Final Evaluation Summary Remarks:
              </label>
              <textarea
                rows={2}
                value={evaluation.finalComments}
                onChange={(e) => setEvaluation({ ...evaluation, finalComments: e.target.value })}
                placeholder="Final summary, salary remarks or joining notes..."
                className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Quick Action Footer in Right Card */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download size={13} />
                <span>PDF Form</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save size={13} />
                <span>{isSaved ? 'Saved!' : 'Save Form'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
