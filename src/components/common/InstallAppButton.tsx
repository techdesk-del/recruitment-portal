import React, { useState, useEffect } from 'react';
import { MonitorDown, CheckCircle2, X, Laptop, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppButton: React.FC<{ variant?: 'header' | 'sidebar' }> = ({ variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleInstallClick}
          title="Install UrbanGaon ATS on your Desktop"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium shadow-xs hover:shadow transition active:scale-95 shrink-0"
        >
          <MonitorDown size={14} className="animate-bounce" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border border-blue-200/70 text-xs font-medium transition active:scale-98"
        >
          <div className="flex items-center gap-2">
            <MonitorDown size={15} className="text-blue-600 shrink-0" />
            <span>Install on Desktop</span>
          </div>
          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-semibold">1-Click</span>
        </button>
      )}

      {/* Guide Modal if browser doesn't trigger prompt automatically */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <Laptop size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Install UrbanGaon ATS</h3>
                <p className="text-xs text-slate-500">Apne Desktop / PC par direct app banayein</p>
              </div>
            </div>

            <div className="space-y-3.5 my-4 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Browser URL Bar se:</p>
                  <p className="mt-0.5 text-slate-600">
                    Chrome ya Edge ke upar URL bar ke right side me <strong>"Install" (🖥️ / ⬇️)</strong> icon par click karein.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Browser Menu (⋮) se:</p>
                  <p className="mt-0.5 text-slate-600">
                    Top-Right 3 dots <strong>⋮</strong> ➔ <strong>Save and share</strong> (ya More tools) ➔ <strong>"Install UrbanGaon ATS"</strong> ya <strong>"Create Shortcut"</strong> (tick Open as window).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Sabhi PCs & Mac ke liye supported</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Samajh Gaya (Got it)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
