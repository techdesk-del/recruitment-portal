import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  Briefcase, 
  TrendingUp, 
  UserCheck, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Plus 
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateSource, JobPosting } from '../../types';
import { 
  parseResumeFile, 
  DEMO_RESUME_BATCHES, 
  createCandidateFromDemoItem 
} from '../../utils/resumeParser';
import { UrbanGaonLogo } from '../common/UrbanGaonLogo';

export const BulkResumeUploadModal: React.FC = () => {
  const { 
    jobs, 
    isBulkUploadModalOpen, 
    setIsBulkUploadModalOpen, 
    bulkAddCandidates, 
    setActiveView,
    setFilters
  } = useRecruitment();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedJobId, setSelectedJobId] = useState<string>('auto');
  const [selectedSource, setSelectedSource] = useState<CandidateSource>('urbangaon');
  const [initialStatus, setInitialStatus] = useState<'applied' | 'screening'>('applied');
  const [recruiterProfile, setRecruiterProfile] = useState<string>('Akash Das (SDE-3 / Admin)');
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStepText, setProcessingStepText] = useState('');
  
  const [stagedCandidates, setStagedCandidates] = useState<{
    candidate: Candidate;
    fileName: string;
    fileSizeText: string;
  }[]>([]);

  if (!isBulkUploadModalOpen) return null;

  // Handle files dropped or picked
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => 
      f.name.endsWith('.pdf') || 
      f.name.endsWith('.doc') || 
      f.name.endsWith('.docx') || 
      f.name.endsWith('.txt') || 
      f.name.endsWith('.rtf') ||
      f.name.endsWith('.md')
    );

    if (fileArray.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStepText(`Reading ${fileArray.length} document stream${fileArray.length > 1 ? 's' : ''}...`);

    const newStaged: { candidate: Candidate; fileName: string; fileSizeText: string }[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const percent = Math.round(15 + ((i + 1) / fileArray.length) * 75);
      setProcessingProgress(percent);
      setProcessingStepText(`Parsing NLP entities & ATS keywords for ${file.name}...`);

      // Artificial small delay for smooth visual feedback
      await new Promise((r) => setTimeout(r, 120));

      const parsed = await parseResumeFile(file, jobs, {
        targetJobId: selectedJobId === 'auto' ? undefined : selectedJobId,
        targetSource: selectedSource,
        recruiterAssigned: recruiterProfile,
        initialStatus: initialStatus
      });

      newStaged.push({
        candidate: parsed.candidate,
        fileName: file.name,
        fileSizeText: (file.size / 1024).toFixed(1) + ' KB'
      });
    }

    setProcessingProgress(100);
    setProcessingStepText('Extraction complete! Verifying ATS alignment...');
    
    setTimeout(() => {
      setStagedCandidates((prev) => [...newStaged, ...prev]);
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStepText('');
    }, 300);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Load predefined demo batch
  const handleLoadDemoBatch = (batchId: string) => {
    const batch = DEMO_RESUME_BATCHES.find((b) => b.id === batchId);
    if (!batch) return;

    setIsProcessing(true);
    setProcessingProgress(20);
    setProcessingStepText(`Injecting batch: ${batch.title}...`);

    setTimeout(() => {
      setProcessingProgress(70);
      setProcessingStepText('Parsing skills taxonomy, experience curves, and matching open jobs...');
    }, 200);

    setTimeout(() => {
      const newItems = batch.candidates.map((c) => {
        const candidate = createCandidateFromDemoItem(c, {
          targetJobId: selectedJobId === 'auto' ? undefined : selectedJobId,
          targetSource: c.source || selectedSource,
          recruiterAssigned: recruiterProfile,
          initialStatus: initialStatus
        });

        return {
          candidate,
          fileName: c.fileName,
          fileSizeText: '42.8 KB'
        };
      });

      setStagedCandidates((prev) => [...newItems, ...prev]);
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStepText('');
    }, 500);
  };

  // Remove individual staged candidate
  const handleRemoveStaged = (index: number) => {
    setStagedCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  // Commit and ingest all staged candidates
  const handleCommitIngestion = () => {
    if (stagedCandidates.length === 0) return;

    // Mark candidates as queued for calling so they appear at the top of Calling Desk
    const candidatesToIngest = stagedCandidates.map((s) => ({
      ...s.candidate,
      isCallingQueued: true
    }));
    bulkAddCandidates(candidatesToIngest);

    // Reset and close
    setStagedCandidates([]);
    setIsBulkUploadModalOpen(false);

    // Navigate directly to Calling Desk
    setActiveView('calling');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UrbanGaonLogo size="md" className="h-9 w-auto" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Bulk Resume Ingestion & Calling Pipeline
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  <Sparkles size={11} className="text-blue-600" />
                  Telecalling Desk Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Drop multiple candidate resumes at once. Parses contact details, skills & experience, and stages candidates directly into the Calling Desk.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBulkUploadModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/40">
          
          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Target Requisition */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Briefcase size={12} className="text-blue-600" />
                Target Requisition
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="auto">🤖 Auto-Detect from Resume (AI)</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.openPositions} open)
                  </option>
                ))}
              </select>
            </div>

            {/* Sourcing Channel */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Layers size={12} className="text-indigo-600" />
                Sourcing Channel
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as CandidateSource)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="urbangaon">UrbanGaon Careers (Direct Portal)</option>
                <option value="linkedin">LinkedIn Recruiter</option>
                <option value="naukri">Naukri.com FastForward</option>
                <option value="indeed">Indeed Resume</option>
                <option value="apna">Apna.co Verified</option>
                <option value="internshala">Internshala</option>
                <option value="referral">Internal Employee Referral</option>
              </select>
            </div>

            {/* Ingestion Lead */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <UserCheck size={12} className="text-emerald-600" />
                Ingestion Operator
              </label>
              <select
                value={recruiterProfile}
                onChange={(e) => setRecruiterProfile(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Akash Das (SDE-3 / Admin)">Akash Das (SDE-3 / Admin)</option>
                <option value="Vikram Singhania (CEO)">Vikram Singhania (CEO)</option>
                <option value="Priya Sharma (Lead Recruiter)">Priya Sharma (Lead Recruiter)</option>
              </select>
            </div>

            {/* Initial Stage */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <ShieldCheck size={12} className="text-purple-600" />
                Initial Hiring Stage
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as 'applied' | 'screening')}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="applied">Applied (Inbox Pool)</option>
                <option value="screening">Screening (Under Review)</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging 
                ? 'border-blue-600 bg-blue-50/80 scale-[1.01]' 
                : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 shadow-2xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.rtf,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-2xs">
              <UploadCloud size={28} />
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              Drag & Drop Bulk Resumes Here, or <span className="text-blue-600 underline">Browse Local Files</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Supports bulk upload of multiple documents (.PDF, .DOCX, .DOC, .TXT). Deep NLP parser extracts Candidate Name, Email, Phone, Skills, Experience & calculates ATS match.
            </p>

            <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> Multi-file Ingestion
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> Instant ATS Scoring
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> Live State Sync
              </span>
            </div>
          </div>

          {/* Quick 1-Click Demo Batches (For instantaneous demonstration) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Quick 1-Click Curated Batches (Instant Testing)
              </span>
              <span className="text-[11px] text-slate-400">Click to instantly simulate bulk resumes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_RESUME_BATCHES.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => handleLoadDemoBatch(batch.id)}
                  disabled={isProcessing}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 text-left transition flex items-start justify-between gap-3 group disabled:opacity-50"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {batch.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {batch.description}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shrink-0 shadow-2xs">
                    Load Batch
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Progress Indicator during Processing */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  {processingStepText}
                </span>
                <span className="font-mono">{processingProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Staged Candidates Review Table / Cards */}
          {stagedCandidates.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Parsed Candidates Ready to Ingest ({stagedCandidates.length})
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Avg ATS Score: {Math.round(stagedCandidates.reduce((acc, curr) => acc + curr.candidate.atsMatchScore, 0) / stagedCandidates.length)}%
                  </span>
                </div>

                <button
                  onClick={() => setStagedCandidates([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {stagedCandidates.map((item, index) => {
                  const cand = item.candidate;
                  return (
                    <div
                      key={cand.id || index}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      {/* Left: Candidate Info & Extracted Details */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                          {cand.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {cand.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 font-mono">
                              {cand.email}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {cand.phone}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-blue-700">
                              {cand.jobAppliedFor}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({cand.experienceYears} Yrs Exp • {cand.location})
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              File: {item.fileName} ({item.fileSizeText})
                            </span>
                          </div>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {cand.tags.slice(0, 5).map((skill, si) => (
                              <span
                                key={si}
                                className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {cand.tags.length > 5 && (
                              <span className="text-[10px] text-slate-400">
                                +{cand.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: ATS Score & Delete button */}
                      <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs font-bold text-emerald-600">
                              {cand.atsMatchScore}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              ATS Match
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Target: {cand.department}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveStaged(index)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Remove candidate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            {stagedCandidates.length > 0 ? (
              <span>
                <strong className="text-slate-900 font-bold">{stagedCandidates.length} Candidates</strong> staged for ingestion. All dashboard tables & statistics will update instantly.
              </span>
            ) : (
              <span>Upload or select files above to populate candidate review queue.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsBulkUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex-1 sm:flex-none"
            >
              Cancel
            </button>

            <button
              onClick={handleCommitIngestion}
              disabled={stagedCandidates.length === 0 || isProcessing}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition active:scale-95 flex-1 sm:flex-none"
            >
              <CheckCircle2 size={15} />
              <span>Confirm & Ingest {stagedCandidates.length > 0 ? `(${stagedCandidates.length})` : ''} Candidates</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
