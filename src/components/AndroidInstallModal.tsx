import React from 'react';
import { Smartphone, Download, CheckCircle, ShieldCheck, WifiOff, X, Layers, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'am';
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose, lang }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Header Badge */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-900 p-0.5 shadow-lg shadow-blue-900/40 shrink-0 flex items-center justify-center overflow-hidden border border-blue-400/30">
            <img src="/pwa-192x192.png" alt="AG School Icon" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Smartphone className="w-3 h-3" />
              {isAndroid ? 'Android Ready' : 'Mobile Application'}
            </div>
            <h3 className="text-xl font-bold text-white">Abune Gorgorios School</h3>
            <p className="text-xs text-slate-400">Package: com.abunegorgorios.school • v2.4.0</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {lang === 'en' ? 'Direct Android Installation' : 'ቀጥታ የአንድሮይድ ጭነት'}
              </p>
              <p className="text-slate-400 mt-0.5">
                {lang === 'en'
                  ? 'Runs fullscreen like a native Android APK with zero app-store download limits.'
                  : 'ያለ ምንም የመተግበሪያ ማውረጃ ገደብ ልክ እንደ መደበኛ አንድሮይድ አፕ ሙሉ ገጽ ይሰራል'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {lang === 'en' ? 'Offline Access & Cache' : 'ያለ ኢንተርኔት መስራት የሚችል'}
              </p>
              <p className="text-slate-400 mt-0.5">
                {lang === 'en'
                  ? 'Access school schedules, grades, and stored receipts even with spotty connectivity.'
                  : 'የተማሪዎችን ውጤት፣ መርሐግብር እና ደረሰኞችን ያለ ኢንተርኔት ማየት ይችላሉ'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">
                {lang === 'en' ? 'Google Maps Navigation Grounding' : 'የGoogle ካርታ የቀጥታ አቅጣጫዎች'}
              </p>
              <p className="text-slate-400 mt-0.5">
                {lang === 'en'
                  ? 'Integrated Gemini 3.8 Flash Maps Grounding for live Addis Ababa campus directions.'
                  : 'በጀሚኒ 3.8 ፍላሽ የተደገፈ የአዲስ አበባ ካርታና የመንገድ መረጃ'}
              </p>
            </div>
          </div>
        </div>

        {/* Installation Actions */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center">
            <ShieldCheck className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">
              {lang === 'en' ? 'Application Already Installed!' : 'መተግበሪያው ቀድሞ ተጭኗል!'}
            </p>
            <p className="text-xs text-emerald-300/80 mt-1">
              {lang === 'en'
                ? 'You are currently running the official standalone Android application.'
                : 'አሁን ኦፊሴላዊውን የአንድሮይድ መተግበሪያ እየተጠቀሙ ነው።'}
            </p>
          </div>
        ) : isInstallable ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition active:scale-[0.98]"
          >
            <Download className="w-5 h-5" />
            {lang === 'en' ? 'Install Android App on Device' : 'የአንድሮይድ መተግበሪያን በስልክዎ ይጫኑ'}
          </button>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <p className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              {lang === 'en' ? 'Add to Home Screen on iOS' : 'በiPhone / iPad ላይ ለመጫን'}
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>{lang === 'en' ? 'Tap the Share button in Safari toolbar' : 'በSafari አሳሽ ላይ የShare ምልክቱን ይንኩ'}</li>
              <li>{lang === 'en' ? 'Scroll down and tap "Add to Home Screen"' : 'ወደ ታች ዝቅ ብለው "Add to Home Screen" ይምረጡ'}</li>
            </ol>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <p className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              {lang === 'en' ? 'How to Install on Android Chrome' : 'በአንድሮይድ ስልክ ላይ ለመጫን'}
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>{lang === 'en' ? 'Tap the ⋮ (three dots) menu in Chrome' : 'በChrome አሳሽ ላይ ባለ ሦስት ነጥቡን (⋮) ምናሌ ይንኩ'}</li>
              <li>{lang === 'en' ? 'Tap "Install App" or "Add to Home Screen"' : '"Install App" ወይም "Add to Home Screen" የሚለውን ይምረጡ'}</li>
            </ol>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {lang === 'en' ? 'Continue in browser' : 'በአሳሹ ቀጥል'}
          </button>
        </div>
      </div>
    </div>
  );
};
