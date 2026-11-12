import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Briefcase, 
  Plus, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Award, 
  Check, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRecruitment } from '../../context/RecruitmentContext';
import { CandidateSource, JobPosting, KeyResultArea } from '../../types';
import { resumeApi } from '../../services/api';
import { parseJdText } from '../../utils/jdParser';
import { 
  extractPdfTextStreams, 
  extractDocxText, 
  fileToBase64 
} from '../../utils/resumeParser';
import { UrbanGaonLogo } from '../common/UrbanGaonLogo';

const DEPARTMENTS = [
  'Civil',
  'Architecture & Design',
  'Project Management',
  'Procurement / Supply Chain & Contracts',
  'Sales & Marketing',
  'Executive Office',
  'Finance & Accounts',
  'AI, IT & Research',
  'Administration / Corporate HR'
];

const PLATFORMS_LIST: { id: CandidateSource; label: string; color: string }[] = [
  { id: 'naukri', label: 'Naukri.com', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'linkedin', label: 'LinkedIn', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { id: 'indeed', label: 'Indeed', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'apna', label: 'Apna.co', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'urbangaon', label: 'UrbanGaon Careers', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'referral', label: 'Internal Referral', color: 'bg-purple-50 border-purple-200 text-purple-700' }
];

export const AddJobModal: React.FC = () => {
  const { 
    isAddJobModalOpen, 
    setIsAddJobModalOpen, 
    addJob, 
    setActiveView, 
    showToast 
  } = useRecruitment();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parseConfidence, setParseConfidence] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Civil');
  const [location, setLocation] = useState('Jaipur, Rajasthan (On-Site)');
  const [jobType, setJobType] = useState<JobPosting['type']>('Full-time');
  const [experienceRequired, setExperienceRequired] = useState('3-5 Years');
  const [salaryRange, setSalaryRange] = useState('₹6,00,000 - ₹10,00,000 P.A.');
  const [openPositions, setOpenPositions] = useState(1);
  const [rolePurpose, setRolePurpose] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState('');
  const [keyResultAreas, setKeyResultAreas] = useState<KeyResultArea[]>([]);
  const [newKra, setNewKra] = useState('');
  const [availableRoles, setAvailableRoles] = useState<{ title: string; text: string }[]>([]);
  const [currentRoleIdx, setCurrentRoleIdx] = useState(0);
  const [fullExtractedText, setFullExtractedText] = useState('');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [mandatoryQualification, setMandatoryQualification] = useState('');
  const [preferredQualification, setPreferredQualification] = useState('');
  const [reportsTo, setReportsTo] = useState('');
  const [industry, setIndustry] = useState('Real Estate / Construction');
  const [selectedPlatforms, setSelectedPlatforms] = useState<CandidateSource[]>([
    'naukri',
    'linkedin',
    'indeed',
    'apna',
    'urbangaon'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddJobModalOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDepartment('Civil');
    setLocation('Jaipur, Rajasthan (On-Site)');
    setJobType('Full-time');
    setExperienceRequired('3-5 Years');
    setSalaryRange('₹6,00,000 - ₹10,00,000 P.A.');
    setOpenPositions(1);
    setRolePurpose('');
    setResponsibilities([]);
    setNewResp('');
    setKeyResultAreas([]);
    setNewKra('');
    setAvailableRoles([]);
    setCurrentRoleIdx(0);
    setFullExtractedText('');
    setCompetencies([]);
    setNewCompetency('');
    setMandatoryQualification('');
    setPreferredQualification('');
    setReportsTo('');
    setIndustry('Real Estate / Construction');
    setSelectedPlatforms(['naukri', 'linkedin', 'indeed', 'apna', 'urbangaon']);
    setUploadedFileName('');
    setParseConfidence(null);
  };

  const handleClose = () => {
    resetForm();
    setIsAddJobModalOpen(false);
  };

  const handleSwitchRole = (idx: number) => {
    if (!fullExtractedText || !availableRoles[idx]) return;
    setCurrentRoleIdx(idx);
    const reParsed = parseJdText(fullExtractedText, uploadedFileName, idx);

    if (reParsed.title) setTitle(reParsed.title);
    if (reParsed.department) setDepartment(reParsed.department);
    if (reParsed.location) setLocation(reParsed.location);
    if (reParsed.type) setJobType(reParsed.type);
    if (reParsed.experienceRequired) setExperienceRequired(reParsed.experienceRequired);
    if (reParsed.salaryRange) setSalaryRange(reParsed.salaryRange);
    if (reParsed.openPositions) setOpenPositions(reParsed.openPositions);
    if (reParsed.rolePurpose) setRolePurpose(reParsed.rolePurpose);
    if (Array.isArray(reParsed.responsibilities)) setResponsibilities(reParsed.responsibilities);
    if (Array.isArray(reParsed.competencies)) setCompetencies(reParsed.competencies);
    if (Array.isArray(reParsed.keyResultAreas)) setKeyResultAreas(reParsed.keyResultAreas);
    if (reParsed.mandatoryQualification) setMandatoryQualification(reParsed.mandatoryQualification);
    if (reParsed.preferredQualification) setPreferredQualification(reParsed.preferredQualification);
    if (reParsed.reportsTo) setReportsTo(reParsed.reportsTo);
    if (reParsed.industry) setIndustry(reParsed.industry);

    showToast('info', 'Loaded Role Specification', `Switched to "${reParsed.title}"`);
  };

  const handleProcessFile = async (file: File) => {
    setIsParsing(true);
    setUploadedFileName(file.name);
    setParsingStep('Extracting document stream & text...');

    try {
      let extractedText = '';
      let base64Data: string | undefined;

      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.pdf')) {
        setParsingStep('Reading PDF visual layout & text layers...');
        const streamRes = await extractPdfTextStreams(file);
        extractedText = streamRes.fullText;
        try {
          base64Data = await fileToBase64(file);
        } catch {
          // base64 conversion is secondary
        }
      } else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
        setParsingStep('Parsing Word document XML structure...');
        extractedText = await extractDocxText(file);
      } else {
        extractedText = await file.text();
      }

      setFullExtractedText(extractedText);

      // Instant High-Precision Deterministic Parser (Exact Document Stream Extraction)
      setParsingStep('Extracting exact specifications from document...');
      const localParsed = parseJdText(extractedText, file.name);

      if (localParsed.title) setTitle(localParsed.title);
      if (localParsed.department) setDepartment(localParsed.department);
      if (localParsed.location) setLocation(localParsed.location);
      if (localParsed.type) setJobType(localParsed.type);
      if (localParsed.experienceRequired) setExperienceRequired(localParsed.experienceRequired);
      if (localParsed.salaryRange) setSalaryRange(localParsed.salaryRange);
      if (localParsed.openPositions) setOpenPositions(localParsed.openPositions);
      if (localParsed.rolePurpose) setRolePurpose(localParsed.rolePurpose);
      if (Array.isArray(localParsed.responsibilities) && localParsed.responsibilities.length > 0) {
        setResponsibilities(localParsed.responsibilities);
      }
      if (Array.isArray(localParsed.competencies) && localParsed.competencies.length > 0) {
        setCompetencies(localParsed.competencies);
      }
      if (Array.isArray(localParsed.keyResultAreas) && localParsed.keyResultAreas.length > 0) {
        setKeyResultAreas(localParsed.keyResultAreas);
      }
      if (Array.isArray(localParsed.roleBlocks) && localParsed.roleBlocks.length > 1) {
        setAvailableRoles(localParsed.roleBlocks);
        setCurrentRoleIdx(0);
      } else {
        setAvailableRoles([]);
      }
      if (localParsed.mandatoryQualification) setMandatoryQualification(localParsed.mandatoryQualification);
      if (localParsed.preferredQualification) setPreferredQualification(localParsed.preferredQualification);
      if (localParsed.reportsTo) setReportsTo(localParsed.reportsTo);
      if (localParsed.industry) setIndustry(localParsed.industry);
      setParseConfidence(100);

      showToast(
        'success',
        'JD Parsed Successfully',
        `Extracted exact details for "${localParsed.title || file.name}". Review specifications below.`
      );
    } catch (err: any) {
      console.error('JD Parsing Error:', err);
      showToast(
        'error',
        'JD Parse Warning',
        'Could not read file text. Please verify the document format or fill fields manually.'
      );
    } finally {
      setIsParsing(false);
      setParsingStep('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const togglePlatform = (p: CandidateSource) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleAddResponsibility = () => {
    if (!newResp.trim()) return;
    setResponsibilities([...responsibilities, newResp.trim()]);
    setNewResp('');
  };

  const handleRemoveResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  const handleAddKra = () => {
    if (!newKra.trim()) return;
    const wtMatch = newKra.match(/\s+(\d+%\s*)$/);
    if (wtMatch) {
      const weight = wtMatch[1].trim();
      const rest = newKra.slice(0, wtMatch.index).trim();
      setKeyResultAreas([...keyResultAreas, { raw: newKra.trim(), weight, details: rest }]);
    } else {
      setKeyResultAreas([...keyResultAreas, { raw: newKra.trim(), details: newKra.trim() }]);
    }
    setNewKra('');
  };

  const handleRemoveKra = (idx: number) => {
    setKeyResultAreas(keyResultAreas.filter((_, i) => i !== idx));
  };

  const handleAddCompetency = () => {
    if (!newCompetency.trim()) return;
    if (!competencies.includes(newCompetency.trim())) {
      setCompetencies([...competencies, newCompetency.trim()]);
    }
    setNewCompetency('');
  };

  const handleRemoveCompetency = (tag: string) => {
    setCompetencies(competencies.filter(c => c !== tag));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Missing Title', 'Please enter a Job Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newJobData: Partial<JobPosting> = {
        title: title.trim(),
        department,
        location,
        type: jobType,
        experienceRequired,
        salaryRange,
        openPositions: Number(openPositions) || 1,
        rolePurpose: rolePurpose.trim(),
        responsibilities,
        competencies,
        keyResultAreas,
        mandatoryQualification: mandatoryQualification.trim(),
        preferredQualification: preferredQualification.trim(),
        reportsTo: reportsTo.trim(),
        industry: industry.trim(),
        platforms: selectedPlatforms,
        status: 'active'
      };

      const created = await addJob(newJobData);
      if (created) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(
          'success',
          'Job Opening Published!',
          `"${created.title}" is now active and syndicated across selected portals.`
        );
        handleClose();
        setActiveView('jobs');
      }
    } catch (err: any) {
      console.error('Failed to create job requisition:', err);
      showToast('error', 'Failed to Create', err.message || 'Error saving job requisition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl w-[98vw] sm:w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-slate-900">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <UrbanGaonLogo size="md" className="h-8 sm:h-9 w-auto shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Create New Job Opening</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold tracking-wide uppercase">
                  Direct Document Parser
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate">
                Upload your Job Description document (PDF / DOCX) to extract exact details with 100% fidelity
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-white border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud size={14} />
              <span>Upload JD (Instant Direct Parse)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase size={14} />
              <span>Manual Specification</span>
            </button>
          </div>

          {parseConfidence && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Direct Document Match: <strong>{parseConfidence}%</strong></span>
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* Upload Zone (Visible if activeTab === 'upload') */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer bg-white ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/40' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {isParsing ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-sm font-semibold text-slate-800">{parsingStep}</div>
                  <p className="text-xs text-slate-500">Extracting exact specifications from document stream...</p>
                </div>
              ) : uploadedFileName ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <FileCheck size={26} />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{uploadedFileName}</div>
                  <p className="text-xs text-slate-500">
                    JD document successfully parsed! Review and tweak the extracted requisition fields below.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline pt-1"
                  >
                    Upload a different file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                    <UploadCloud size={26} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                      Drag & Drop JD Document here
                    </span>
                    <span className="text-sm text-slate-500"> or </span>
                    <span className="text-sm font-bold text-blue-600 underline">Browse Files</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Supports <strong>PDF</strong> and <strong>DOCX/Word</strong> files. Directly extracts exact Role Title, Department, Experience, Responsibilities, KRAs, and Competencies with 100% fidelity.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multi-Role Detected Selector Banner */}
          {availableRoles.length > 1 && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    Multi-Role Document Detected ({availableRoles.length} Roles Found)
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Click a role below to load its exact purpose, responsibilities, KRAs, and competencies:
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {availableRoles.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSwitchRole(i)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      currentRoleIdx === i
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r.title}</span>
                    {currentRoleIdx === i && <Check size={13} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields Section */}
          <form id="add-job-form" onSubmit={handlePublish} className="space-y-5">
            
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase size={14} className="text-blue-600" />
                <span>Job Requisition Specification</span>
              </h3>
              {title && (
                <span className="text-xs font-semibold text-blue-600">
                  Ready to Syndicate
                </span>
              )}
            </div>

            {/* Row 1: Title & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supervisor (Civil) or Head of Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Location, Type, Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Experience Required
                </label>
                <input
                  type="text"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  placeholder="e.g. 3-5 Years"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Row 3: Salary, Open Positions, Reports To */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Salary Range (P.A.)
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. ₹6,00,000 - ₹9,00,000 P.A."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Open Positions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={openPositions}
                  onChange={(e) => setOpenPositions(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reports To
                </label>
                <input
                  type="text"
                  value={reportsTo}
                  onChange={(e) => setReportsTo(e.target.value)}
                  placeholder="e.g. Director or Head of Civil"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Role Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Purpose / Executive Summary
              </label>
              <textarea
                rows={3}
                value={rolePurpose}
                onChange={(e) => setRolePurpose(e.target.value)}
                placeholder="Briefly summarize why this role exists and its core mandate..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Responsibilities ({responsibilities.length})
              </label>
              
              <div className="space-y-1.5 mb-2">
                {responsibilities.map((resp, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 group"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{resp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(idx)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a key responsibility bullet..."
                  value={newResp}
                  onChange={(e) => setNewResp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddResponsibility();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Key Result Areas & Performance Indicators (KRAs) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Key Result Areas & Performance Indicators ({keyResultAreas.length})
                </label>
                <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <Award size={13} />
                  <span>KRA / Target Metrics</span>
                </span>
              </div>

              {keyResultAreas.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {keyResultAreas.map((kra, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start sm:items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 leading-snug">
                            {kra.details || kra.raw}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {kra.weight && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                            {kra.weight}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveKra(idx)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition opacity-60 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add KRA / KPI measure (e.g. Sales Closures - Achieve monthly targets 25%)..."
                  value={newKra}
                  onChange={(e) => setNewKra(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKra();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddKra}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add KRA</span>
                </button>
              </div>
            </div>

            {/* Competencies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Competencies & Required Skills ({competencies.length})
              </label>
              
              <div className="flex flex-wrap gap-1.5 mb-2">
                {competencies.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetency(c)}
                      className="hover:text-rose-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill or competency (e.g. Site Supervision, AutoCAD, Negotiation)..."
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompetency();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddCompetency}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Qualifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandatory Qualification
                </label>
                <input
                  type="text"
                  value={mandatoryQualification}
                  onChange={(e) => setMandatoryQualification(e.target.value)}
                  placeholder="e.g. B.Tech / Diploma in Civil Engineering"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Qualification
                </label>
                <input
                  type="text"
                  value={preferredQualification}
                  onChange={(e) => setPreferredQualification(e.target.value)}
                  placeholder="e.g. NICMAR or PMP Certification"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Sourcing Platforms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Sourcing Portals & Syndication
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS_LIST.map((p) => {
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? p.color + ' ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                      <span>{p.label}</span>
                      {isSelected && <Check size={13} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Publishing this requisition will immediately sync with the database and open portal pipelines.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-job-form"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Publish Job Requisition</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
