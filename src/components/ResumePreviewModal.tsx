import React from 'react';
import { X, Download, Printer, Copy, CheckCircle2 } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { getSourceMeta } from '../utils/resumeGenerator';

export const ResumePreviewModal: React.FC = () => {
  const { previewResumeCandidate, setPreviewResumeCandidate, downloadResume, showToast } = useRecruitment();

  if (!previewResumeCandidate) return null;

  const cand = previewResumeCandidate;
  const sourceMeta = getSourceMeta(cand.source);

  const handleCopyText = () => {
    const text = `${cand.name} - ${cand.jobAppliedFor}
Email: ${cand.email} | Phone: ${cand.phone} | Location: ${cand.location}
Source: ${cand.source.toUpperCase()} (${sourceMeta.label})
Experience: ${cand.experienceYears} Years | Expected CTC: ${cand.expectedSalary} | Notice: ${cand.noticePeriod}

Summary:
${cand.resumeData.summary}

Skills:
${cand.resumeData.skills.join(', ')}`;

    navigator.clipboard.writeText(text);
    showToast('success', 'Copied to Clipboard', 'Resume details copied successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Verified ATS Resume</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {cand.source.toUpperCase()}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{cand.name} • {cand.jobAppliedFor}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              title="Copy details"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
            >
              <Copy size={14} />
              <span className="hidden sm:inline">Copy Info</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Resume"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => downloadResume(cand.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/40 transition"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => setPreviewResumeCandidate(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Resume Sheet Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/70">
          <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-300 font-sans space-y-6 max-w-2xl mx-auto">
            
            {/* Top Source Badge Watermark */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <span className="text-[10px] font-bold tracking-widest text-indigo-700 uppercase">
                [ {sourceMeta.iconText} ]
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                REF: {cand.id.toUpperCase()} • MATCH: {cand.atsMatchScore}%
              </span>
            </div>

            {/* Candidate Header */}
            <div>
              <h1 className="text-2xl font-black text-slate-900">{cand.name}</h1>
              <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide mt-0.5">{cand.jobAppliedFor}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                <span>📧 {cand.email}</span>
                <span>📞 {cand.phone}</span>
                <span>📍 {cand.location}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Exp: <strong>{cand.experienceYears}y</strong> • Notice: <strong>{cand.noticePeriod}</strong> • Expected CTC: <strong>{cand.expectedSalary}</strong>
              </div>
            </div>

            {/* Summary */}
            {cand.resumeData.summary && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-wider">
                  EXECUTIVE SUMMARY
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">{cand.resumeData.summary}</p>
              </div>
            )}

            {/* Skills */}
            {cand.resumeData.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-wider">
                  CORE TECHNICAL PROFICIENCIES
                </h3>
                <p className="text-xs text-slate-800 font-semibold">{cand.resumeData.skills.join('   •   ')}</p>
              </div>
            )}

            {/* Experience */}
            {cand.resumeData.experience.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 tracking-wider">
                  PROFESSIONAL EXPERIENCE
                </h3>
                <div className="space-y-4">
                  {cand.resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{exp.role}</span>
                        <span className="text-slate-500 font-normal">{exp.duration}</span>
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
            )}

            {/* Education */}
            {cand.resumeData.education.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 tracking-wider">
                  EDUCATION & CREDENTIALS
                </h3>
                {cand.resumeData.education.map((edu, idx) => (
                  <div key={idx} className="text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree}</span>
                      <div className="text-slate-600">{edu.institution}</div>
                    </div>
                    <span className="text-slate-500">{edu.year}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
              <span>UrbanGaon ATS • Verified multi-source candidate ingestion</span>
              <span>100% Downloadable PDF Ready</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
