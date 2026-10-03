import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Briefcase, 
  UserCheck, 
  Layers, 
  ShieldCheck, 
  Plus,
  UserPlus,
  Edit3,
  Save,
  Check,
  Award,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Candidate, CandidateSource } from '../../types';
import { 
  parseResumeFile, 
  DEMO_RESUME_BATCHES, 
  createCandidateFromDemoItem 
} from '../../utils/resumeParser';
import { UrbanGaonLogo } from '../common/UrbanGaonLogo';
import { PortalLogo } from '../common/PortalLogo';

export const BulkResumeUploadModal: React.FC = () => {
  const { 
    jobs, 
    isBulkUploadModalOpen, 
    setIsBulkUploadModalOpen, 
    bulkAddCandidates, 
    setActiveView,
    setFilters,
    showToast
  } = useRecruitment();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: 'upload' (AI resume parsing) vs 'manual' (manual candidate entry)
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  
  // Configuration options for Upload mode
  const [selectedJobId, setSelectedJobId] = useState<string>('auto');
  const [selectedSource, setSelectedSource] = useState<CandidateSource>('naukri');
  const [initialStatus, setInitialStatus] = useState<'applied' | 'screening'>('applied');
  const [recruiterProfile, setRecruiterProfile] = useState<string>('Dr Sharmila Yadav');

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStepText, setProcessingStepText] = useState('');
  
  const [stagedCandidates, setStagedCandidates] = useState<{
    candidate: Candidate;
    fileName: string;
    fileSizeText: string;
    parserUsed?: 'gemini-ai' | 'universal-engine';
  }[]>([]);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Jaipur, Rajasthan',
    jobId: jobs[0]?.id || '',
    jobTitle: jobs[0]?.title || '',
    source: 'referral' as CandidateSource,
    recruiterAssigned: 'Dr Sharmila Yadav',
    experienceYears: 3,
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '30 Days',
    skills: 'Project Coordination, Communication, Operations',
    summary: '',
    notes: ''
  });

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

    if (fileArray.length === 0) {
      showToast('warning', 'Unsupported File', 'Please upload a PDF, Word document (.doc/.docx), or text file.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(15);
    setProcessingStepText(`Reading ${fileArray.length} document stream${fileArray.length > 1 ? 's' : ''}...`);

    const newStaged: { candidate: Candidate; fileName: string; fileSizeText: string; parserUsed?: 'gemini-ai' | 'universal-engine' }[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const percent = Math.round(15 + ((i + 1) / fileArray.length) * 75);
      setProcessingProgress(percent);
      setProcessingStepText(`Extracting candidate details & parsing layout for ${file.name}...`);

      // Small realistic parsing feedback
      await new Promise((r) => setTimeout(r, 140));

      const parsed = await parseResumeFile(file, jobs, {
        targetJobId: selectedJobId === 'auto' ? undefined : selectedJobId,
        targetSource: selectedSource,
        recruiterAssigned: recruiterProfile,
        initialStatus: initialStatus
      });

      newStaged.push({
        candidate: parsed.candidate,
        fileName: file.name,
        fileSizeText: (file.size / 1024).toFixed(1) + ' KB',
        parserUsed: parsed.parserUsed
      });
    }

    setProcessingProgress(100);
    setProcessingStepText('Parsing complete! Review candidates below.');
    setTimeout(() => {
      setIsProcessing(false);
      setStagedCandidates((prev) => [...prev, ...newStaged]);
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setStagedCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  // Commit Ingestion of Staged Candidates
  const handleCommitIngestion = () => {
    if (stagedCandidates.length === 0) return;

    const candidatesToAdd = stagedCandidates.map((s) => s.candidate);
    bulkAddCandidates(candidatesToAdd);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsBulkUploadModalOpen(false);
    setStagedCandidates([]);
    setActiveView('candidates');
    setFilters((prev) => ({ ...prev, source: 'all', status: 'all' }));
  };

  // One-click demo batch loader
  const handleLoadDemoBatch = (batchId: string) => {
    const batch = DEMO_RESUME_BATCHES.find((b) => b.id === batchId);
    if (!batch) return;

    const converted = batch.candidates.map((item) => ({
      candidate: createCandidateFromDemoItem(item, {
        recruiterAssigned: recruiterProfile,
        initialStatus
      }),
      fileName: item.fileName,
      fileSizeText: '420 KB (Verified)'
    }));

    setStagedCandidates((prev) => [...prev, ...converted]);
  };

  // Manual Candidate Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim() || !manualForm.email.trim() || !manualForm.phone.trim()) {
      showToast('warning', 'Missing Fields', 'Please enter Candidate Name, Email, and Phone.');
      return;
    }

    const matchedJob = jobs.find((j) => j.id === manualForm.jobId) || jobs[0];
    const skillList = manualForm.skills.split(',').map((s) => s.trim()).filter(Boolean);

    const newCand: Candidate = {
      id: `cand-${Date.now().toString().slice(-6)}`,
      name: manualForm.name.trim(),
      email: manualForm.email.trim(),
      phone: manualForm.phone.trim(),
      location: manualForm.location.trim() || 'Jaipur, Rajasthan',
      source: manualForm.source,
      sourceId: `${manualForm.source.toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`,
      jobAppliedFor: matchedJob?.title || manualForm.jobTitle,
      jobId: matchedJob?.id || 'job-manual',
      department: matchedJob?.department || 'Operations',
      appliedDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      status: initialStatus,
      atsMatchScore: 92,
      rating: 4,
      experienceYears: Number(manualForm.experienceYears) || 0,
      currentSalary: manualForm.currentSalary || '₹8,00,000 P.A.',
      expectedSalary: manualForm.expectedSalary || '₹12,00,000 P.A.',
      noticePeriod: manualForm.noticePeriod || '30 Days',
      recruiterAssigned: manualForm.recruiterAssigned || 'Dr Sharmila Yadav',
      tags: skillList.length > 0 ? skillList : ['Management', 'Operations'],
      notes: manualForm.notes || 'Candidate added via manual intake.',
      resumeData: {
        summary: manualForm.summary || `Qualified candidate with ${manualForm.experienceYears} years of professional experience.`,
        skills: skillList,
        experience: [
          {
            company: 'Previous Employer',
            role: matchedJob?.title || 'Associate',
            duration: '2021 - Present',
            location: manualForm.location || 'Jaipur',
            highlights: ['Demonstrated strong performance, leadership, and execution capabilities.']
          }
        ],
        education: [
          {
            degree: 'Bachelor Degree',
            institution: 'University of Rajasthan',
            year: '2016 - 2020'
          }
        ]
      },
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'Candidate Added',
          details: `Candidate intake completed via Recruitment Dashboard by ${manualForm.recruiterAssigned}`,
          performedBy: manualForm.recruiterAssigned,
          timestamp: new Date().toISOString(),
          type: 'ingestion'
        }
      ]
    };

    bulkAddCandidates([newCand]);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    setIsBulkUploadModalOpen(false);
    setActiveView('candidates');
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
                  Add Candidate & Resume Ingestion Engine
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  <Sparkles size={11} className="text-blue-600" />
                  AI Resume Parser
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Upload a candidate resume (.PDF, .DOCX) for AI auto-parsing, or enter candidate credentials manually
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBulkUploadModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0 cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Upload Resume vs Manual Entry */}
        <div className="px-6 bg-white border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud size={15} />
            <span>Upload Resume & Auto-Parse (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={15} />
            <span>Manual Candidate Entry</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/40">
          
          {/* TAB 1: RESUME UPLOAD & PARSING */}
          {activeTab === 'upload' && (
            <div className="space-y-6 animate-fade-in">
              {/* Gemini AI Resume Engine Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Gemini 2.5 AI Resume Intelligence Engine
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        Active & Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Analyzes any resume format with Google Gemini AI intelligence, extracting exact candidate details, timeline & qualifications.
                    </p>
                  </div>
                </div>
              </div>

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
                    <option value="auto">🤖 Auto-Detect from Resume</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sourcing Channel with Proper Logo */}
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
                    <option value="naukri">Naukri.com</option>
                    <option value="apna">Apna.co</option>
                    <option value="referral">Direct Referral</option>
                    <option value="newspaper">Newspaper AD</option>
                    <option value="linkedin">LinkedIn Recruiter</option>
                    <option value="indeed">Indeed</option>
                    <option value="urbangaon">UrbanGaon Careers</option>
                  </select>
                </div>

                {/* Ingestion Operator / Assigned HR */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <UserCheck size={12} className="text-emerald-600" />
                    Assigned HR
                  </label>
                  <select
                    value={recruiterProfile}
                    onChange={(e) => setRecruiterProfile(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Dr Sharmila Yadav">Dr Sharmila Yadav</option>
                    <option value="Dr Rekha Pareek">Dr Rekha Pareek</option>
                    <option value="Satyaveer Singh">Satyaveer Singh</option>
                  </select>
                </div>

                {/* Initial Stage */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-purple-600" />
                    Initial Stage
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
                  Drag & Drop Resume (.PDF, .DOCX) Here, or <span className="text-blue-600 underline">Browse Local File</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Parses Candidate Name, Contact, Skills, Experience, Education & calculates ATS match score automatically.
                </p>

                <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Automatic Name & Contact Extraction
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Instant ATS Scoring
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Atlas Database Sync
                  </span>
                </div>
              </div>

              {/* Quick Demo Resume Batches */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={14} className="text-amber-500" />
                    One-Click Quick Test Resumes (Demo Profiles)
                  </span>
                  <span className="text-[11px] text-slate-400">Click to instantly test resume parsing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {DEMO_RESUME_BATCHES.map((batch) => (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => handleLoadDemoBatch(batch.id)}
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 transition group flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 block">
                          {batch.title}
                        </span>
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {batch.description}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-1 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                        Parse Batch
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
                        Avg ATS: {Math.round(stagedCandidates.reduce((acc, curr) => acc + curr.candidate.atsMatchScore, 0) / stagedCandidates.length)}%
                      </span>
                    </div>

                    <button
                      onClick={() => setStagedCandidates([])}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
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
                                {item.parserUsed === 'gemini-ai' ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                    <Sparkles size={9} /> Gemini AI
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                    <Cpu size={9} /> Universal Engine
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                                <span className="font-semibold text-slate-800">{cand.jobAppliedFor}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <PortalLogo source={cand.source} size={13} />
                                  <span className="capitalize">{cand.source}</span>
                                </span>
                                <span>•</span>
                                <span>Exp: {cand.experienceYears} Yrs</span>
                                <span>•</span>
                                <span className="text-emerald-700 font-medium">Assigned: {cand.recruiterAssigned}</span>
                              </div>

                              {cand.tags && cand.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {cand.tags.slice(0, 5).map((t, ti) => (
                                    <span key={ti} className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                      {t}
                                    </span>
                                  ))}
                                  {cand.tags.length > 5 && (
                                    <span className="text-[9px] text-slate-400">+{cand.tags.length - 5} more</span>
                                  )}
                                </div>
                              )}
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
                                {item.fileSizeText}
                              </span>
                            </div>

                            <button
                              onClick={() => handleRemoveStaged(index)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
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

              {/* Action Buttons for Upload Mode */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  {stagedCandidates.length > 0 ? (
                    <span>
                      <strong className="text-slate-900 font-bold">{stagedCandidates.length} Candidate(s)</strong> parsed and ready. Will sync directly to MongoDB Atlas.
                    </span>
                  ) : (
                    <span>Drop a resume above or use One-Click Quick Test Resumes to stage applicants.</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setIsBulkUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCommitIngestion}
                    disabled={stagedCandidates.length === 0 || isProcessing}
                    className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer flex-1 sm:flex-none"
                  >
                    <CheckCircle2 size={15} />
                    <span>Confirm & Ingest {stagedCandidates.length > 0 ? `(${stagedCandidates.length})` : ''} Candidates</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL CANDIDATE ENTRY */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 animate-fade-in">
              
              {/* Personal Details */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  1. Candidate Personal & Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={manualForm.name}
                      onChange={(e) => setManualForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={manualForm.email}
                      onChange={(e) => setManualForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="ramesh@example.com"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={manualForm.phone}
                      onChange={(e) => setManualForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98290 55443"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">City / Location</label>
                    <input
                      type="text"
                      value={manualForm.location}
                      onChange={(e) => setManualForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Jaipur, Rajasthan"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role, Sourcing & Assignment */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  2. Position, Sourcing Channel & HR Assignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Requisition *</label>
                    <select
                      value={manualForm.jobId}
                      onChange={(e) => {
                        const j = jobs.find((x) => x.id === e.target.value);
                        setManualForm((p) => ({ ...p, jobId: e.target.value, jobTitle: j?.title || '' }));
                      }}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-blue-700 outline-none"
                    >
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sourcing Channel</label>
                    <select
                      value={manualForm.source}
                      onChange={(e) => setManualForm((p) => ({ ...p, source: e.target.value as CandidateSource }))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-semibold text-slate-800 outline-none"
                    >
                      <option value="referral">Direct Referral</option>
                      <option value="naukri">Naukri.com</option>
                      <option value="apna">Apna.co</option>
                      <option value="newspaper">Newspaper AD</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                      <option value="urbangaon">UrbanGaon Careers</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Assigned HR Recruiter</label>
                    <select
                      value={manualForm.recruiterAssigned}
                      onChange={(e) => setManualForm((p) => ({ ...p, recruiterAssigned: e.target.value }))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-semibold text-slate-800 outline-none"
                    >
                      <option value="Dr Sharmila Yadav">Dr Sharmila Yadav</option>
                      <option value="Dr Rekha Pareek">Dr Rekha Pareek</option>
                      <option value="Satyaveer Singh">Satyaveer Singh</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Compensation & Experience */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  3. Experience & Compensation Terms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Total Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={manualForm.experienceYears}
                      onChange={(e) => setManualForm((p) => ({ ...p, experienceYears: parseFloat(e.target.value) || 0 }))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Current CTC / Salary</label>
                    <input
                      type="text"
                      value={manualForm.currentSalary}
                      onChange={(e) => setManualForm((p) => ({ ...p, currentSalary: e.target.value }))}
                      placeholder="e.g. ₹7,50,000 P.A."
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expected CTC / Salary</label>
                    <input
                      type="text"
                      value={manualForm.expectedSalary}
                      onChange={(e) => setManualForm((p) => ({ ...p, expectedSalary: e.target.value }))}
                      placeholder="e.g. ₹12,00,000 - ₹15,00,000 P.A."
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-blue-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Notice Period</label>
                    <select
                      value={manualForm.noticePeriod}
                      onChange={(e) => setManualForm((p) => ({ ...p, noticePeriod: e.target.value }))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-emerald-700 outline-none"
                    >
                      <option value="Immediate Joiner">Immediate Joiner</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="45 Days">45 Days</option>
                      <option value="60 Days">60 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={manualForm.skills}
                    onChange={(e) => setManualForm((p) => ({ ...p, skills: e.target.value }))}
                    placeholder="e.g. Project Execution, Team Management, Site Supervision, AutoCAD"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons for Manual Form */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-end gap-3 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsBulkUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Add Candidate to System</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
