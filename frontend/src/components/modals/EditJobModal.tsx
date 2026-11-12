import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  GraduationCap 
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { JobPosting, KeyResultArea } from '../../types';
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

interface EditJobModalProps {
  job: JobPosting | null;
  onClose: () => void;
}

export const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose }) => {
  const { updateJob, showToast } = useRecruitment();

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
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [mandatoryQualification, setMandatoryQualification] = useState('');
  const [preferredQualification, setPreferredQualification] = useState('');
  const [reportsTo, setReportsTo] = useState('');
  const [industry, setIndustry] = useState('Real Estate Development');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setDepartment(job.department || 'Civil');
      setLocation(job.location || 'Jaipur, Rajasthan (On-Site)');
      setJobType(job.type || 'Full-time');
      setExperienceRequired(job.experienceRequired || '3-5 Years');
      setSalaryRange(job.salaryRange || 'Competitive');
      setOpenPositions(job.openPositions || 1);
      setRolePurpose(job.rolePurpose || '');
      setResponsibilities(job.responsibilities || []);
      setKeyResultAreas(job.keyResultAreas || []);
      setCompetencies(job.competencies || []);
      setMandatoryQualification(job.mandatoryQualification || '');
      setPreferredQualification(job.preferredQualification || '');
      setReportsTo(job.reportsTo || '');
      setIndustry(job.industry || 'Real Estate Development');
    }
  }, [job]);

  if (!job) return null;

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
    setCompetencies(competencies.filter((c) => c !== tag));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Missing Title', 'Please enter a Job Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<JobPosting> = {
        title: title.trim(),
        department,
        location,
        type: jobType,
        experienceRequired,
        salaryRange,
        openPositions: Number(openPositions) || 1,
        rolePurpose: rolePurpose.trim(),
        responsibilities,
        keyResultAreas,
        competencies,
        mandatoryQualification: mandatoryQualification.trim(),
        preferredQualification: preferredQualification.trim(),
        reportsTo: reportsTo.trim(),
        industry: industry.trim()
      };

      await updateJob(job.id, updates);
      onClose();
    } catch (err: any) {
      console.error('Failed to update job:', err);
      showToast('error', 'Update Failed', err.message || 'Error updating requisition.');
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
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Edit Job Requisition</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold tracking-wide uppercase">
                  Requisition #{job.id}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate">
                Update job details, responsibilities, KRAs, and requirements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          
          {/* Row 1: Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
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
                {DEPARTMENTS.map((d) => (
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
                placeholder="Add responsibility bullet..."
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
                placeholder="Add competency (e.g. Site Supervision, CRM, Negotiation)..."
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
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

