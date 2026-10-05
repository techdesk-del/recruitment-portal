import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { 
  X, 
  Download, 
  Star, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  PhoneCall,
  Calendar, 
  Award, 
  MessageSquare, 
  Clock, 
  UserCheck,
  FileText,
  Edit3,
  Save,
  Plus,
  Trash2,
  Building,
  GraduationCap,
  Sparkles,
  Check
} from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { useAuth } from '../../context/AuthContext';
import { CandidateStatus, CandidateSource, WorkExperience, Education } from '../../types';
import { PortalLogo } from '../common/PortalLogo';
import { InterviewEvaluationForm } from './InterviewEvaluationForm';
import { CandidateCallTab } from '../candidate/CandidateCallTab';
import { CandidateCommunicationsTab } from '../candidate/CandidateCommunicationsTab';

export const CandidateProfileModal: React.FC = () => {
  const { 
    selectedCandidate, 
    setSelectedCandidate, 
    candidateModalTab,
    setCandidateModalTab,
    callRecords,
    jobs,
    updateCandidateStatus, 
    updateCandidateNotes, 
    updateCandidateScorecard, 
    assignRecruiter,
    updateCandidateRating,
    updateCandidateDetails,
    deleteCandidate,
    downloadResume,
    interviews,
    setActiveView,
    shiftCandidateToCalling
  } = useRecruitment();
  const { can } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'scorecard' | 'calling' | 'timeline' | 'communications'>('profile');
  const [noteText, setNoteText] = useState(selectedCandidate?.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Profile Edit State ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    jobAppliedFor: '',
    source: 'referral' as CandidateSource,
    recruiterAssigned: '',
    experienceYears: 0,
    currentCompany: '',
    currentDesignation: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    summary: '',
    skills: [] as string[],
    notes: ''
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  // --- Resume Edit State ---
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeForm, setResumeForm] = useState<{
    summary: string;
    skills: string[];
    experience: WorkExperience[];
    education: Education[];
  }>({
    summary: '',
    skills: [],
    experience: [],
    education: []
  });
  const [newResumeSkillInput, setNewResumeSkillInput] = useState('');

  useEffect(() => {
    if (candidateModalTab) {
      setActiveTab(candidateModalTab);
    }
  }, [candidateModalTab, selectedCandidate?.id]);

  useEffect(() => {
    if (selectedCandidate) {
      const c = selectedCandidate;
      setProfileForm({
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        location: c.location || '',
        jobAppliedFor: c.jobAppliedFor || '',
        source: c.source || 'referral',
        recruiterAssigned: c.recruiterAssigned || 'Dr Sharmila Yadav',
        experienceYears: c.experienceYears || 0,
        currentCompany: c.currentCompany || '',
        currentDesignation: c.currentDesignation || '',
        currentSalary: c.currentSalary || '',
        expectedSalary: c.expectedSalary || '',
        noticePeriod: c.noticePeriod || '30 Days',
        summary: c.resumeData?.summary || '',
        skills: [...(c.resumeData?.skills || c.tags || [])],
        notes: c.notes || ''
      });

      setResumeForm({
        summary: c.resumeData?.summary || '',
        skills: [...(c.resumeData?.skills || c.tags || [])],
        experience: (c.resumeData?.experience || []).map((e) => ({
          ...e,
          highlights: [...(e.highlights || [])]
        })),
        education: (c.resumeData?.education || []).map((ed) => ({ ...ed }))
      });

      setNoteText(c.notes || '');
      setIsEditingProfile(false);
      setIsEditingResume(false);
    }
  }, [selectedCandidate?.id]);

  if (!selectedCandidate) return null;

  const cand = selectedCandidate;

  const candidateTotalCalls = [
    ...callRecords.filter((r) => r.candidateId === cand.id || r.candidateName.toLowerCase() === cand.name.toLowerCase()),
    ...(cand.callingDetails?.callHistory || [])
  ].filter((c, i, s) => i === s.findIndex((x) => x.id === c.id)).length;

  const candScheduledInterview = interviews.find(
    (i) => (i.candidateId === cand.id || i.candidateName === cand.name) && i.status !== 'cancelled'
  );

  const sourceBadges: Record<CandidateSource, { label: string; class: string; icon: string }> = {
    naukri: { label: 'Naukri.com', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔵' },
    linkedin: { label: 'LinkedIn', class: 'bg-sky-50 text-sky-700 border-sky-200', icon: '💼' },
    indeed: { label: 'Indeed', class: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🔷' },
    apna: { label: 'Apna.co', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🟢' },
    urbangaon: { label: 'UrbanGaon Careers', class: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏠' },
    internshala: { label: 'Internshala', class: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '🎓' },
    referral: { label: 'Direct Referral', class: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🤝' },
    newspaper: { label: 'Newspaper AD', class: 'bg-amber-50 text-amber-700 border-amber-200', icon: '📰' },
    other: { label: 'Other Channel', class: 'bg-slate-50 text-slate-700 border-slate-200', icon: '🌐' }
  };

  const badge = sourceBadges[cand.source] || sourceBadges.other;

  const handleSaveNotes = () => {
    updateCandidateNotes(cand.id, noteText);
  };

  // --- Save Profile Changes ---
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) return;
    await updateCandidateDetails(
      cand.id,
      {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        location: profileForm.location.trim(),
        jobAppliedFor: profileForm.jobAppliedFor.trim(),
        source: profileForm.source,
        recruiterAssigned: profileForm.recruiterAssigned,
        experienceYears: Number(profileForm.experienceYears) || 0,
        currentCompany: profileForm.currentCompany.trim(),
        currentDesignation: profileForm.currentDesignation.trim(),
        currentSalary: profileForm.currentSalary.trim(),
        expectedSalary: profileForm.expectedSalary.trim(),
        noticePeriod: profileForm.noticePeriod.trim(),
        notes: profileForm.notes.trim(),
        tags: profileForm.skills,
        resumeData: {
          ...cand.resumeData,
          summary: profileForm.summary.trim(),
          skills: profileForm.skills
        }
      },
      'Candidate profile information updated'
    );
    setIsEditingProfile(false);
  };

  // --- Save Resume Changes ---
  const handleSaveResume = async () => {
    await updateCandidateDetails(
      cand.id,
      {
        tags: resumeForm.skills,
        resumeData: {
          ...cand.resumeData,
          summary: resumeForm.summary.trim(),
          skills: resumeForm.skills,
          experience: resumeForm.experience,
          education: resumeForm.education
        }
      },
      'Candidate resume work history & qualifications updated'
    );
    setIsEditingResume(false);
  };

  // Helper to add skill in profile
  const handleAddProfileSkill = () => {
    const val = newSkillInput.trim();
    if (val && !profileForm.skills.includes(val)) {
      setProfileForm((prev) => ({ ...prev, skills: [...prev.skills, val] }));
      setNewSkillInput('');
    }
  };

  const handleRemoveProfileSkill = (skillToRemove: string) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Helper to add skill in resume
  const handleAddResumeSkill = () => {
    const val = newResumeSkillInput.trim();
    if (val && !resumeForm.skills.includes(val)) {
      setResumeForm((prev) => ({ ...prev, skills: [...prev.skills, val] }));
      setNewResumeSkillInput('');
    }
  };

  const handleRemoveResumeSkill = (skillToRemove: string) => {
    setResumeForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Work experience helpers
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      company: '',
      role: '',
      duration: '2023 - Present',
      location: cand.location || 'Jaipur, Rajasthan',
      highlights: ['Managed key project deliverables and client coordination.']
    };
    setResumeForm((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience]
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setResumeForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    setResumeForm((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  // Education helpers
  const handleAddEducation = () => {
    const newEdu: Education = {
      degree: '',
      institution: '',
      year: new Date().getFullYear().toString()
    };
    setResumeForm((prev) => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setResumeForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    setResumeForm((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  return (
    <div className={clsx('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'p-2', 'sm:p-4', 'bg-slate-900/60', 'backdrop-blur-xs', 'animate-fade-in')}>
      <div className={clsx('bg-white', 'border', 'border-slate-200', 'rounded-3xl', 'w-[96vw]', 'max-w-[1420px]', 'h-[94vh]', 'max-h-[96vh]', 'flex', 'flex-col', 'shadow-2xl', 'overflow-hidden', 'animate-slide-up', 'text-slate-900', 'relative')}>
        
        {/* Dedicated Top-Right Close Button */}
        <button
          onClick={() => setSelectedCandidate(null)}
          title="Close modal (Esc)"
          className="absolute top-5 right-5 z-30 p-2.5 rounded-2xl bg-white/95 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <X size={18} />
        </button>

        {/* Modal Top Header */}
        <div className={clsx('p-6', 'bg-slate-50', 'border-b', 'border-slate-200', 'flex', 'flex-col', 'sm:flex-row', 'sm:items-center', 'justify-between', 'gap-4', 'pr-16')}>
          <div className={clsx('flex', 'items-start', 'gap-4')}>
            <div className={clsx('w-14', 'h-14', 'rounded-2xl', 'bg-blue-600', 'text-white', 'font-extrabold', 'text-2xl', 'flex', 'items-center', 'justify-center', 'shadow-md', 'shrink-0')}>
              {cand.name.charAt(0)}
            </div>
            <div>
              <div className={clsx('flex', 'flex-wrap', 'items-center', 'gap-2')}>
                <h2 className={clsx('text-xl', 'font-extrabold', 'text-slate-900')}>{cand.name}</h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.class} inline-flex items-center gap-1.5`}>
                  <PortalLogo source={cand.source} size={14} />
                  <span>{badge.label}</span>
                </span>
                <span className={clsx('text-xs', 'font-bold', 'text-emerald-700', 'bg-emerald-50', 'px-2', 'py-0.5', 'rounded', 'border', 'border-emerald-200')}>
                  {cand.atsMatchScore}% Match
                </span>
                {candScheduledInterview && (
                  <span className={clsx('text-xs', 'font-bold', 'text-blue-700', 'bg-blue-50', 'px-2.5', 'py-0.5', 'rounded-md', 'border', 'border-blue-200', 'inline-flex', 'items-center', 'gap-1')}>
                    <Calendar size={12} />
                    <span>{candScheduledInterview.round.split(':')[0]} ({candScheduledInterview.date} @ {candScheduledInterview.startTime})</span>
                  </span>
                )}
              </div>
              <p className={clsx('text-xs', 'text-blue-700', 'font-bold', 'mt-0.5')}>{cand.jobAppliedFor}</p>
              <div className={clsx('flex', 'flex-wrap', 'items-center', 'gap-3', 'text-xs', 'text-slate-500', 'mt-1')}>
                <span className={clsx('flex', 'items-center', 'gap-1')}><MapPin size={12} /> {cand.location}</span>
                <span>•</span>
                <span className={clsx('flex', 'items-center', 'gap-1')}><Mail size={12} /> {cand.email}</span>
                <span>•</span>
                <span className={clsx('flex', 'items-center', 'gap-1')}><Phone size={12} /> {cand.phone}</span>
              </div>
            </div>
          </div>

          <div className={clsx('flex', 'flex-wrap', 'items-center', 'gap-2', 'self-end', 'sm:self-center')}>
            {/* Quick Edit Details Button (Admin & Recruiter only) */}
            {can('edit_candidate') && (
              <button
                onClick={() => {
                  if (activeTab === 'resume') {
                    setIsEditingResume(true);
                  } else {
                    setActiveTab('profile');
                    setIsEditingProfile(true);
                  }
                }}
                title="Edit candidate profile or resume details"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Details</span>
              </button>
            )}

            {/* Quick Delete Candidate Button (Admin Only) */}
            {can('delete_candidate') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete candidate permanently (Admin Only)"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <Trash2 size={14} className="text-rose-600" />
                <span>Delete Candidate</span>
              </button>
            )}

            <button
              onClick={() => {
                shiftCandidateToCalling(cand);
                setSelectedCandidate(null);
              }}
              title="Shift candidate's profile directly to Calling Desk"
              className={clsx('flex', 'items-center', 'gap-1.5', 'px-3.5', 'py-2', 'rounded-xl', 'bg-emerald-600', 'hover:bg-emerald-700', 'text-white', 'font-bold', 'text-xs', 'shadow-md', 'transition', 'active:scale-95', 'cursor-pointer')}
            >
              <PhoneCall size={14} />
              <span>Shift to Calling Desk</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('calling');
                setCandidateModalTab('calling');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
                activeTab === 'calling'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <span>Screening Log</span>
            </button>

            <button
              onClick={() => setActiveTab('communications')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
                activeTab === 'communications'
                  ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Send candidate email with Google Meet & calendar invite, or WhatsApp status alert"
            >
              <Mail size={14} className="text-blue-600" />
              <span>Outreach (Email & WhatsApp)</span>
            </button>

            {candScheduledInterview ? (
              <button
                onClick={() => {
                  setSelectedCandidate(null);
                  setActiveView('scheduler');
                }}
                className={clsx('flex', 'items-center', 'gap-1.5', 'px-3.5', 'py-2', 'rounded-xl', 'bg-blue-50', 'hover:bg-blue-100', 'text-blue-700', 'font-bold', 'text-xs', 'border', 'border-blue-200', 'transition')}
              >
                <Calendar size={14} />
                <span>Open in Calendar</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedCandidate(null);
                  setActiveView('scheduler');
                }}
                className={clsx('flex', 'items-center', 'gap-1.5', 'px-3.5', 'py-2', 'rounded-xl', 'bg-slate-100', 'hover:bg-slate-200', 'text-slate-700', 'font-bold', 'text-xs', 'border', 'border-slate-200', 'transition')}
              >
                <Calendar size={14} />
                <span>Schedule Interview</span>
              </button>
            )}

            <button
              onClick={() => downloadResume(cand.id)}
              className={clsx('flex', 'items-center', 'gap-1.5', 'px-4', 'py-2', 'rounded-xl', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'font-bold', 'text-xs', 'shadow-md', 'transition', 'active:scale-95')}
            >
              <Download size={14} />
              Download Resume (PDF)
            </button>
          </div>
        </div>

        {/* Quick Controls Bar: Status, Recruiter, Rating */}
        <div className={clsx('px-6', 'py-3', 'bg-slate-100/70', 'border-b', 'border-slate-200', 'flex', 'flex-wrap', 'items-center', 'justify-between', 'gap-4', 'text-xs')}>
          <div className={clsx('flex', 'flex-wrap', 'items-center', 'gap-4')}>
            <div className={clsx('flex', 'items-center', 'gap-2')}>
              <span className={clsx('text-slate-600', 'font-semibold')}>Hiring Stage:</span>
              <select
                value={cand.status}
                onChange={(e) => updateCandidateStatus(cand.id, e.target.value as CandidateStatus)}
                className={clsx('px-3', 'py-1.5', 'rounded-lg', 'bg-white', 'border', 'border-slate-300', 'text-slate-800', 'font-bold', 'focus:outline-none', 'focus:border-blue-500', 'cursor-pointer', 'shadow-2xs')}
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

            <div className={clsx('flex', 'items-center', 'gap-2')}>
              <span className={clsx('text-slate-600', 'font-semibold')}>Assigned HR:</span>
              <select
                value={cand.recruiterAssigned || ''}
                onChange={(e) => assignRecruiter(cand.id, e.target.value)}
                className={clsx('px-3', 'py-1.5', 'rounded-lg', 'bg-white', 'border', 'border-slate-300', 'text-slate-800', 'font-medium', 'focus:outline-none', 'focus:border-blue-500')}
              >
                <option value="Dr Rekha Pareek">Dr Rekha Pareek</option>
                <option value="Dr Sharmila Yadav">Dr Sharmila Yadav</option>
                <option value="Satyaveer Singh">Satyaveer Singh</option>
              </select>
            </div>
          </div>

          <div className={clsx('flex', 'items-center', 'gap-2')}>
            <span className={clsx('text-slate-600', 'font-semibold')}>Rating:</span>
            <div className={clsx('flex', 'items-center', 'gap-1')}>
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
        <div className={clsx('px-6', 'border-b', 'border-slate-200', 'bg-white', 'flex', 'items-center', 'gap-2')}>
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
            onClick={() => {
              setActiveTab('calling');
              setCandidateModalTab('calling');
            }}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'calling'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall size={13} />
            Calling & Screening ({candidateTotalCalls})
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
            Activity History ({cand.activityHistory?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'communications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail size={13} />
            Outreach (Email & WhatsApp)
          </button>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className={clsx('flex-1', 'overflow-y-auto', 'p-6', 'space-y-6', 'bg-slate-50/50')}>
          
          {/* TAB 1: PROFILE DOSSIER */}
          {activeTab === 'profile' && (
            <div className="space-y-6">

              {/* Profile Top Bar: Action Buttons */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck size={16} className="text-blue-600" />
                    Candidate Profile & Compensation Dossier
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {isEditingProfile 
                      ? 'Modify candidate personal information, applied requisition, notice period and compensation' 
                      : 'Comprehensive candidate credentials, employment terms, and compensation data'}
                  </p>
                </div>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Edit3 size={14} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      <X size={13} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW MODE */}
              {!isEditingProfile && (
                <>
                  {/* Key Compensation & Notice Period Cards */}
                  <div className={clsx('grid', 'grid-cols-2', 'sm:grid-cols-4', 'gap-3')}>
                    <div className={clsx('p-3.5', 'rounded-xl', 'bg-white', 'border', 'border-slate-200', 'shadow-2xs')}>
                      <span className={clsx('text-[11px]', 'text-slate-500', 'font-semibold')}>Total Experience</span>
                      <p className={clsx('text-base', 'font-bold', 'text-slate-900', 'mt-1')}>{cand.experienceYears} Years</p>
                    </div>
                    <div className={clsx('p-3.5', 'rounded-xl', 'bg-white', 'border', 'border-slate-200', 'shadow-2xs')}>
                      <span className={clsx('text-[11px]', 'text-slate-500', 'font-semibold')}>Current Salary</span>
                      <p className={clsx('text-base', 'font-bold', 'text-slate-900', 'mt-1')}>{cand.currentSalary || 'N/A'}</p>
                    </div>
                    <div className={clsx('p-3.5', 'rounded-xl', 'bg-white', 'border', 'border-slate-200', 'shadow-2xs')}>
                      <span className={clsx('text-[11px]', 'text-slate-500', 'font-semibold')}>Expected Salary</span>
                      <p className={clsx('text-base', 'font-bold', 'text-blue-700', 'mt-1')}>{cand.expectedSalary}</p>
                    </div>
                    <div className={clsx('p-3.5', 'rounded-xl', 'bg-white', 'border', 'border-slate-200', 'shadow-2xs')}>
                      <span className={clsx('text-[11px]', 'text-slate-500', 'font-semibold')}>Notice Period</span>
                      <p className={clsx('text-base', 'font-bold', 'text-emerald-700', 'mt-1')}>{cand.noticePeriod}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  {cand.resumeData?.summary && (
                    <div className={clsx('p-5', 'rounded-2xl', 'bg-white', 'border', 'border-slate-200', 'space-y-2', 'shadow-2xs')}>
                      <h3 className={clsx('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider')}>Candidate Summary</h3>
                      <p className={clsx('text-xs', 'text-slate-600', 'leading-relaxed')}>{cand.resumeData.summary}</p>
                    </div>
                  )}

                  {/* Current Company & Designation Card */}
                  {(cand.currentCompany || cand.currentDesignation) && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-6 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Employer</span>
                        <span className="font-bold text-slate-800 text-sm mt-0.5 block">{cand.currentCompany || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Role</span>
                        <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{cand.currentDesignation || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {/* Skills Tags */}
                  <div className={clsx('p-5', 'rounded-2xl', 'bg-white', 'border', 'border-slate-200', 'space-y-2', 'shadow-2xs')}>
                    <h3 className={clsx('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider')}>Skills & Proficiencies</h3>
                    <div className={clsx('flex', 'flex-wrap', 'gap-1.5', 'pt-1')}>
                      {(cand.resumeData?.skills || cand.tags || []).map((skill, idx) => (
                        <span key={idx} className={clsx('px-2.5', 'py-1', 'rounded-md', 'bg-blue-50', 'text-blue-700', 'border', 'border-blue-200', 'text-xs', 'font-semibold')}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recruiter Notes Box */}
                  <div className={clsx('p-5', 'rounded-2xl', 'bg-white', 'border', 'border-slate-200', 'space-y-3', 'shadow-2xs')}>
                    <div className={clsx('flex', 'items-center', 'justify-between')}>
                      <h3 className={clsx('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider', 'flex', 'items-center', 'gap-1.5')}>
                        <MessageSquare size={14} className="text-blue-600" />
                        Internal HR Notes & Feedback
                      </h3>
                    </div>
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add screening feedback, interview notes, or remarks..."
                      className={clsx('w-full', 'p-3', 'rounded-xl', 'bg-slate-50', 'border', 'border-slate-200', 'text-xs', 'text-slate-900', 'placeholder-slate-400', 'focus:outline-none', 'focus:border-blue-500', 'focus:bg-white', 'transition')}
                    />
                    <button
                      onClick={handleSaveNotes}
                      className={clsx('px-4', 'py-2', 'rounded-xl', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'text-xs', 'font-bold', 'transition', 'shadow-2xs')}
                    >
                      Save Note
                    </button>
                  </div>

                  {/* Candidate Administration / Danger Zone */}
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <Trash2 size={14} className="text-rose-600" />
                        Danger Zone: Remove Candidate
                      </h4>
                      <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                        Permanently purge this candidate profile from MongoDB database and active pipeline tracker.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition active:scale-95 shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>Delete Candidate</span>
                    </button>
                  </div>
                </>
              )}

              {/* EDIT MODE: CANDIDATE PROFILE FORM */}
              {isEditingProfile && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Card 1: Personal & Contact Information */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <UserCheck size={14} className="text-blue-600" />
                      Personal & Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Candidate Full Name"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-slate-900 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="candidate@example.com"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98290 12345"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Location / City</label>
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                          placeholder="Jaipur, Rajasthan"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Role, Sourcing & Assignment */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Briefcase size={14} className="text-blue-600" />
                      Applied Role & HR Assignment
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Applied Job Role</label>
                        <input
                          type="text"
                          value={profileForm.jobAppliedFor}
                          onChange={(e) => setProfileForm((p) => ({ ...p, jobAppliedFor: e.target.value }))}
                          placeholder="e.g. Senior Project Manager"
                          list="job-roles-list"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-blue-700 outline-none transition"
                        />
                        <datalist id="job-roles-list">
                          {jobs.map((j) => (
                            <option key={j.id} value={j.title} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sourcing Channel</label>
                        <select
                          value={profileForm.source}
                          onChange={(e) => setProfileForm((p) => ({ ...p, source: e.target.value as CandidateSource }))}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-semibold text-slate-800 outline-none transition"
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
                          value={profileForm.recruiterAssigned}
                          onChange={(e) => setProfileForm((p) => ({ ...p, recruiterAssigned: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-semibold text-slate-800 outline-none transition"
                        >
                          <option value="Dr Sharmila Yadav">Dr Sharmila Yadav</option>
                          <option value="Dr Rekha Pareek">Dr Rekha Pareek</option>
                          <option value="Satyaveer Singh">Satyaveer Singh</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Experience & Compensation Terms */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Award size={14} className="text-blue-600" />
                      Experience, CTC & Notice Period
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Total Experience (Years)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={profileForm.experienceYears}
                          onChange={(e) => setProfileForm((p) => ({ ...p, experienceYears: parseFloat(e.target.value) || 0 }))}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-slate-900 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Current Salary / CTC</label>
                        <input
                          type="text"
                          value={profileForm.currentSalary}
                          onChange={(e) => setProfileForm((p) => ({ ...p, currentSalary: e.target.value }))}
                          placeholder="e.g. ₹8,50,000 P.A."
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-slate-900 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expected Salary / CTC</label>
                        <input
                          type="text"
                          value={profileForm.expectedSalary}
                          onChange={(e) => setProfileForm((p) => ({ ...p, expectedSalary: e.target.value }))}
                          placeholder="e.g. ₹18,00,000 - ₹25,00,000 P.A."
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-blue-700 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Notice Period</label>
                        <select
                          value={profileForm.noticePeriod}
                          onChange={(e) => setProfileForm((p) => ({ ...p, noticePeriod: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-bold text-emerald-700 outline-none transition"
                        >
                          <option value="Immediate Joiner">Immediate Joiner</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="45 Days">45 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Current Company</label>
                        <input
                          type="text"
                          value={profileForm.currentCompany}
                          onChange={(e) => setProfileForm((p) => ({ ...p, currentCompany: e.target.value }))}
                          placeholder="e.g. Apex Infrastructure Ltd"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-semibold text-slate-800 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Current Designation</label>
                        <input
                          type="text"
                          value={profileForm.currentDesignation}
                          onChange={(e) => setProfileForm((p) => ({ ...p, currentDesignation: e.target.value }))}
                          placeholder="e.g. Lead Project Coordinator"
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-semibold text-slate-800 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Candidate Executive Summary */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Candidate Professional Summary
                    </label>
                    <textarea
                      rows={4}
                      value={profileForm.summary}
                      onChange={(e) => setProfileForm((p) => ({ ...p, summary: e.target.value }))}
                      placeholder="Write or edit candidate's executive career summary and highlights..."
                      className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 outline-none transition leading-relaxed"
                    />
                  </div>

                  {/* Card 5: Skills Tag Editor */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Skills & Technical Competencies
                    </label>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profileForm.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProfileSkill(skill)}
                            className="text-blue-400 hover:text-rose-600 transition"
                            title="Remove skill"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddProfileSkill();
                          }
                        }}
                        placeholder="Type a skill and press Enter (e.g. Agile Project Management)..."
                        className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={handleAddProfileSkill}
                        className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} /> Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Card 6: Internal Notes */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-blue-600" />
                      Internal Recruiter Notes & Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.notes}
                      onChange={(e) => setProfileForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Add confidential notes, observations or salary remarks..."
                      className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 outline-none transition"
                    />
                  </div>

                  {/* Bottom Save Action Bar */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer border border-rose-200"
                    >
                      <Trash2 size={14} />
                      <span>Delete Candidate</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={14} />
                        Save Profile Changes
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB: CALLING & TELE-SCREENING DOSSIER */}
          {activeTab === 'calling' && (
            <CandidateCallTab candidate={cand} />
          )}

          {/* TAB 2: LIVE RESUME DETAILS */}
          {activeTab === 'resume' && (
            <div className="space-y-6">

              {/* Resume Header / Action Bar */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Candidate Resume & Career History
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {isEditingResume
                      ? 'Edit work history, job responsibilities, educational qualifications and resume summary'
                      : 'Live CV data, parsed work history, academic credentials, and core competencies'}
                  </p>
                </div>
                {!isEditingResume ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingResume(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Edit3 size={14} />
                      <span>Edit Resume</span>
                    </button>
                    <button
                      onClick={() => downloadResume(cand.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Download size={14} />
                      <span>PDF</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => setIsEditingResume(false)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      <X size={13} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveResume}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW MODE: RESUME */}
              {!isEditingResume && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className={clsx('text-lg', 'font-bold', 'text-slate-900')}>{cand.name}</h3>
                    <p className={clsx('text-xs', 'text-blue-700', 'font-bold')}>{cand.jobAppliedFor}</p>
                    <p className="text-xs text-slate-500 mt-1">{cand.location} • {cand.email} • {cand.phone}</p>
                  </div>

                  {/* Summary */}
                  {cand.resumeData?.summary && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                        Professional Summary
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{cand.resumeData.summary}</p>
                    </div>
                  )}

                  {/* Work History */}
                  {cand.resumeData?.experience?.length > 0 && (
                    <div>
                      <h4 className={clsx('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider', 'border-b', 'border-slate-200', 'pb-1', 'mb-3')}>
                        Work History & Experience
                      </h4>
                      <div className="space-y-4">
                        {cand.resumeData.experience.map((exp, idx) => (
                          <div key={idx} className="space-y-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                            <div className={clsx('flex', 'justify-between', 'text-xs', 'font-bold', 'text-slate-900')}>
                              <span>{exp.role}</span>
                              <span className={clsx('text-slate-500', 'font-normal')}>{exp.duration}</span>
                            </div>
                            <p className={clsx('text-xs', 'text-blue-700', 'font-semibold')}>{exp.company} — {exp.location}</p>
                            <ul className={clsx('text-xs', 'text-slate-600', 'list-disc', 'pl-4', 'space-y-1', 'pt-1.5')}>
                              {exp.highlights?.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {cand.resumeData?.education?.length > 0 && (
                    <div>
                      <h4 className={clsx('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider', 'border-b', 'border-slate-200', 'pb-1', 'mb-2')}>
                        Academic Qualifications
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cand.resumeData.education.map((edu, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 text-xs flex justify-between">
                            <div>
                              <span className={clsx('font-bold', 'text-slate-900', 'block')}>{edu.degree}</span>
                              <p className="text-slate-500 mt-0.5">{edu.institution}</p>
                              {edu.grade && <span className="text-[11px] text-blue-600 font-semibold">{edu.grade}</span>}
                            </div>
                            <span className="text-slate-400 font-medium">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {(cand.resumeData?.skills || cand.tags || []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                        Core Competencies
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(cand.resumeData?.skills || cand.tags || []).map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EDIT MODE: RESUME */}
              {isEditingResume && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Resume Summary */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Executive Summary / Bio
                    </label>
                    <textarea
                      rows={4}
                      value={resumeForm.summary}
                      onChange={(e) => setResumeForm((r) => ({ ...r, summary: e.target.value }))}
                      placeholder="Candidate resume summary..."
                      className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 outline-none transition leading-relaxed"
                    />
                  </div>

                  {/* Skills Tag Editor */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Resume Skills & Competencies
                    </label>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {resumeForm.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveResumeSkill(skill)}
                            className="text-blue-400 hover:text-rose-600 transition"
                            title="Remove skill"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newResumeSkillInput}
                        onChange={(e) => setNewResumeSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddResumeSkill();
                          }
                        }}
                        placeholder="Add skill to resume and press Enter..."
                        className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 font-medium text-slate-800 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={handleAddResumeSkill}
                        className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 shrink-0"
                      >
                        <Plus size={14} /> Add Skill
                      </button>
                    </div>
                  </div>

                  {/* Work Experience Editor */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={14} className="text-blue-600" />
                        Work Experience ({resumeForm.experience.length} Positions)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200"
                      >
                        <Plus size={13} /> Add Position
                      </button>
                    </div>

                    {resumeForm.experience.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3 text-center">
                        No work experience entries added. Click &quot;Add Position&quot; to add one.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {resumeForm.experience.map((exp, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative group">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                Position #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExperience(idx)}
                                className="text-rose-500 hover:text-rose-700 transition p-1 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1"
                                title="Remove this position"
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Role / Job Title</label>
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                                  placeholder="e.g. Senior Project Manager"
                                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Company / Organization</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                                  placeholder="e.g. UrbanGaon Projects"
                                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800 outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Duration</label>
                                <input
                                  type="text"
                                  value={exp.duration}
                                  onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                                  placeholder="e.g. 2021 - Present"
                                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-700 outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Location</label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                                  placeholder="e.g. Jaipur, Rajasthan"
                                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-700 outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                Key Responsibilities & Highlights (one per line)
                              </label>
                              <textarea
                                rows={3}
                                value={exp.highlights.join('\n')}
                                onChange={(e) =>
                                  handleExperienceChange(
                                    idx,
                                    'highlights',
                                    e.target.value.split('\n').filter((line) => line.trim())
                                  )
                                }
                                placeholder="Managed day-to-day operations&#10;Led a team of 15 members&#10;Delivered on-time milestone achievements"
                                className="w-full text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none focus:border-blue-500 font-normal leading-relaxed"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education Editor */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-blue-600" />
                        Academic Credentials ({resumeForm.education.length} Qualifications)
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200"
                      >
                        <Plus size={13} /> Add Education
                      </button>
                    </div>

                    {resumeForm.education.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3 text-center">
                        No education records added. Click &quot;Add Education&quot; to add one.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {resumeForm.education.map((edu, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-600 uppercase">Degree #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEducation(idx)}
                                className="text-rose-500 hover:text-rose-700 transition text-xs flex items-center gap-0.5"
                                title="Remove"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Degree / Qualification</label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                placeholder="e.g. B.Tech / MBA / B.Com"
                                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">University / College</label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                                  placeholder="e.g. University of Rajasthan"
                                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-700 outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Passing Year</label>
                                <input
                                  type="text"
                                  value={edu.year}
                                  onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                                  placeholder="e.g. 2016"
                                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-700 outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Save Action Bar */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer border border-rose-200"
                    >
                      <Trash2 size={14} />
                      <span>Delete Candidate</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingResume(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveResume}
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save size={14} />
                        Save Resume Changes
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 3: INTERVIEW EVALUATION FORM (2025/HRD/EF/Version-1) */}
          {activeTab === 'scorecard' && (
            <InterviewEvaluationForm
              candidate={cand}
              onSave={(scorecard) => updateCandidateScorecard(cand.id, scorecard)}
            />
          )}

          {/* TAB 4: ACTIVITY HISTORY */}
          {activeTab === 'timeline' && (
            <div className={clsx('p-6', 'rounded-2xl', 'bg-white', 'border', 'border-slate-200', 'shadow-sm', 'space-y-3')}>
              <h3 className={clsx('text-xs', 'font-bold', 'text-slate-700', 'uppercase', 'tracking-wider', 'mb-2')}>Activity Timeline</h3>
              <div className="space-y-3">
                {cand.activityHistory?.map((act) => (
                  <div key={act.id} className={clsx('p-3', 'rounded-xl', 'bg-slate-50', 'border', 'border-slate-200', 'text-xs', 'flex', 'items-start', 'justify-between', 'gap-2')}>
                    <div>
                      <p className={clsx('font-bold', 'text-slate-900')}>{act.action}</p>
                      <p className={clsx('text-slate-500', 'mt-0.5')}>{act.details}</p>
                      <span className={clsx('text-[10px]', 'text-blue-600', 'font-semibold', 'mt-1', 'block')}>By: {act.performedBy}</span>
                    </div>
                    <span className={clsx('text-[11px]', 'text-slate-400', 'shrink-0')}>
                      {new Date(act.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CANDIDATE OUTREACH & COMMUNICATIONS */}
          {activeTab === 'communications' && (
            <CandidateCommunicationsTab
              candidate={cand}
              scheduledInterviews={interviews.filter((i) => i.candidateId === cand.id || i.candidateName === cand.name)}
            />
          )}

        </div>

      </div>

      {/* Delete Candidate Confirmation Modal Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">Delete Candidate Record?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-slate-900">{cand.name}</span> ({cand.jobAppliedFor})?
              </p>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-700 text-left space-y-1">
                <p className="font-bold">⚠️ Warning:</p>
                <p className="text-rose-600">
                  This will permanently delete this candidate from MongoDB, candidate pipeline stages, interview tracker records, and calling logs. This action cannot be reversed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await deleteCandidate(cand.id);
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
