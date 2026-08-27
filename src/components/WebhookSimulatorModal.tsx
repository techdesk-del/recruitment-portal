import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Play, RefreshCw, Layers } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { CandidateSource } from '../types';

export const WebhookSimulatorModal: React.FC = () => {
  const { isWebhookModalOpen, setIsWebhookModalOpen, simulateIncomingApplication } = useRecruitment();
  const [selectedSource, setSelectedSource] = useState<CandidateSource>('naukri');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isWebhookModalOpen) return null;

  const platforms: { id: CandidateSource; name: string; desc: string; payloadSnippet: string; icon: string }[] = [
    {
      id: 'naukri',
      name: 'Naukri.com Corporate API',
      desc: 'Simulates candidate webhook dispatched from Naukri Recruiter API on apply event.',
      icon: '🔵',
      payloadSnippet: `{
  "statusCode": 200,
  "source": "naukri-fastforward",
  "candidate": {
    "name": "Arjun Nambiar",
    "email": "arjun.nambiar@techhub.in",
    "sourceId": "NAUK-991204",
    "role": "Senior Frontend Engineer",
    "exp": 4.0,
    "skills": ["React 18", "TypeScript", "Next.js"]
  }
}`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn EasyApply Email Parser',
      desc: 'Simulates receiving and extracting application data from LinkedIn recruitment notifications.',
      icon: '💼',
      payloadSnippet: `{
  "messageId": "msg_li_894819",
  "sender": "jobs-noreply@linkedin.com",
  "parsedCandidate": {
    "name": "Devika Singhania",
    "email": "devika.singh@cloudmatrix.io",
    "role": "Lead Backend Developer",
    "profileUrl": "https://linkedin.com/in/devika-be",
    "exp": 6.2
  }
}`
    },
    {
      id: 'indeed',
      name: 'Indeed Employer Webhook',
      desc: 'Simulates instant HTTP POST webhook from Indeed Employer dashboard when candidate applies.',
      icon: '🔷',
      payloadSnippet: `{
  "event": "application.created",
  "platform": "indeed",
  "applicant": {
    "fullName": "Siddharth Nair",
    "resumeUrl": "https://indeed.com/r/siddharth.pdf",
    "appliedRole": "Lead QA Automation Engineer"
  }
}`
    },
    {
      id: 'urbangaon',
      name: 'UrbanGaon Careers Portal Form',
      desc: 'Simulates direct submission on careers.urbangaon.com careers page with direct resume upload.',
      icon: '🌿',
      payloadSnippet: `{
  "form": "careers_apply",
  "origin": "careers.urbangaon.com",
  "candidate": {
    "name": "Pooja Bhattacharya",
    "role": "UI/UX Product Designer",
    "expectedCTC": "₹18 - 20 LPA",
    "noticePeriod": "30 Days"
  }
}`
    }
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      simulateIncomingApplication(selectedSource);
      setIsSimulating(false);
      setIsWebhookModalOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Ingestion & Resume Generation Simulator</h2>
              <p className="text-xs text-slate-400">Test real-time candidate synchronization & PDF resume generation</p>
            </div>
          </div>
          <button
            onClick={() => setIsWebhookModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Ingestion Source Channel:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platforms.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedSource(p.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedSource === p.id
                      ? 'border-emerald-500/60 bg-emerald-950/30 shadow-lg shadow-emerald-950/40'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm">{p.icon}</span>
                    {selectedSource === p.id && (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payload Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sample Normalized Ingestion Payload:
            </label>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
              {platforms.find((p) => p.id === selectedSource)?.payloadSnippet}
            </pre>
          </div>

        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Will generate ATS record + instantaneous downloadable PDF
          </span>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95"
          >
            {isSimulating ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Ingesting & Generating PDF...
              </>
            ) : (
              <>
                <Play size={14} className="fill-white" /> Trigger Webhook Ingestion
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
