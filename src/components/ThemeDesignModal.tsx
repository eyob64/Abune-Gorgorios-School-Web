import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Check, 
  Star, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  Layout,
  Layers,
  Award
} from 'lucide-react';

export interface ThemeOption {
  id: 'royal-navy' | 'emerald' | 'modern-indigo' | 'crimson';
  nameEn: string;
  nameAm: string;
  tagEn: string;
  tagAm: string;
  descriptionEn: string;
  descriptionAm: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    light: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'royal-navy',
    nameEn: 'Royal Navy & Imperial Gold',
    nameAm: 'ሮያል ኔቪ እና ኢምፔሪያል ወርቅ',
    tagEn: 'Heritage Excellence (Official)',
    tagAm: 'ይፋዊ የትምህርት ቤት መለያ',
    descriptionEn: 'The distinguished flagship identity of Abune Gorgorios School with deep navy authority and Ethiopian gold heraldic accents.',
    descriptionAm: 'የአቡነ ጎርጎርዮስ ትምህርት ቤት ታሪካዊና ይፋዊ መለያ ጥልቅ ሰማያዊና የወርቅ ቅንብር።',
    colors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#f59e0b',
      light: '#eff6ff'
    }
  },
  {
    id: 'emerald',
    nameEn: 'Highland Emerald & Sun Ochre',
    nameAm: 'ሀይላንድ ኤመራልድ እና ፀሐያማ ኦከር',
    tagEn: 'Vibrant Growth & Wisdom',
    tagAm: 'እድገት፣ ጥበብና ማህበረሰብ',
    descriptionEn: 'Lush Ethiopian highland evergreen symbolizing academic vitality, youth growth, and warm golden community sun.',
    descriptionAm: 'የተማሪዎችን እድገት፣ ጥበብና እውቀት የሚያንጸባርቅ ለምለም አረንጓዴና ሞቃት ቢጫ ቅንብር።',
    colors: {
      primary: '#064e3b',
      secondary: '#059669',
      accent: '#d97706',
      light: '#ecfdf5'
    }
  },
  {
    id: 'modern-indigo',
    nameEn: 'Modern Tech Indigo & Electric Cyan',
    nameAm: 'ዘመናዊ ኢንዲጎ እና ኤሌክትሪክ ሳያን',
    tagEn: 'STEM & Future Leaders',
    tagAm: 'ቴክኖሎጂ፣ STEM እና የወደፊት መሪዎች',
    descriptionEn: 'Futuristic digital academy aesthetic with deep indigo foundations and glowing cyan technology accents.',
    descriptionAm: 'ለዘመናዊ የሳይንስና ቴክኖሎጂ ትምህርት ምቹ የሆነ ውብና ዘመናዊ ዲዛይን።',
    colors: {
      primary: '#312e81',
      secondary: '#4f46e5',
      accent: '#06b6d4',
      light: '#eef2ff'
    }
  },
  {
    id: 'crimson',
    nameEn: 'Imperial Crimson & Sandstone',
    nameAm: 'ኢምፔሪያል ክሪምሰን እና ሳንድስቶን',
    tagEn: 'Classical Prestige & Honor',
    tagAm: 'ክብር፣ ልቀትና ታሪክ',
    descriptionEn: 'Regal collegiate burgundy with sandstone ivory warmth, celebrating scholarship, character, and discipline.',
    descriptionAm: 'ጥንታዊ የትምህርት ቤቶች ክብርና ዲሲፕሊን የሚያጎላ የከበረ ቀይና ሞቃት ቀለም።',
    colors: {
      primary: '#881337',
      secondary: '#be123c',
      accent: '#d97706',
      light: '#fff1f2'
    }
  }
];

interface ThemeDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  bestDesignVote: string;
  onSelectTheme: (themeId: 'royal-navy' | 'emerald' | 'modern-indigo' | 'crimson') => void;
  onVoteBestDesign: (themeId: 'royal-navy' | 'emerald' | 'modern-indigo' | 'crimson') => void;
  lang: 'en' | 'am';
}

export const ThemeDesignModal: React.FC<ThemeDesignModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  bestDesignVote,
  onSelectTheme,
  onVoteBestDesign,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg font-bold">
              <Palette className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                {lang === 'en' ? 'Website Visual Architecture' : 'የትምህርት ቤቱ ድረ-ገጽ ዲዛይን ምርጫ'}
              </span>
              <h2 className="text-2xl font-black">
                {lang === 'en' ? 'Choose The Best Website Design' : 'ምርጡን የድረ-ገጽ ዲዛይን ይምረጡ'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'en'
              ? 'Compare the 4 custom color & visual architectures designed for Abune Gorgorios School. Click to preview live across the entire site, and cast your vote for the best design!'
              : 'ለአቡነ ጎርጎርዮስ ትምህርት ቤት የተዘጋጁትን 4 የተለያዩ የቀለምና የዲዛይን አማራጮች ያወዳድሩ። የሚወዱትን ዲዛይን ይምረጡ እና ምርጥ ብለው ይምረጡ!'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* Active Choice Summary Banner */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {lang === 'en' ? 'Current Active Website Design' : 'በአሁኑ ሰዓት የሚሰራው ዲዛይን'}
                </span>
                <p className="text-sm font-black text-slate-900">
                  {THEME_OPTIONS.find(t => t.id === currentTheme)?.[lang === 'en' ? 'nameEn' : 'nameAm']}
                </p>
              </div>
            </div>

            {bestDesignVote && (
              <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5 self-start sm:self-auto">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>
                  {lang === 'en' ? 'Your Voted Best Design:' : 'የመረጡት ምርጥ ዲዛይን:'}{' '}
                  <strong>{THEME_OPTIONS.find(t => t.id === bestDesignVote)?.[lang === 'en' ? 'nameEn' : 'nameAm']}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 4 Design Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEME_OPTIONS.map((theme) => {
              const isActive = currentTheme === theme.id;
              const isVotedBest = bestDesignVote === theme.id;

              return (
                <div 
                  key={theme.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between bg-white ${
                    isActive 
                      ? 'border-blue-600 shadow-lg shadow-blue-100 ring-2 ring-blue-100' 
                      : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Tags & Swatches */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {lang === 'en' ? theme.tagEn : theme.tagAm}
                      </span>

                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200">
                        <span 
                          className="w-4 h-4 rounded-full shadow-xs" 
                          style={{ backgroundColor: theme.colors.primary }}
                          title="Primary Brand Color"
                        />
                        <span 
                          className="w-4 h-4 rounded-full shadow-xs" 
                          style={{ backgroundColor: theme.colors.secondary }}
                          title="Secondary Brand Color"
                        />
                        <span 
                          className="w-4 h-4 rounded-full shadow-xs" 
                          style={{ backgroundColor: theme.colors.accent }}
                          title="Accent Gold/Amber"
                        />
                        <span 
                          className="w-4 h-4 rounded-full border border-slate-300" 
                          style={{ backgroundColor: theme.colors.light }}
                          title="Background Accent"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        {lang === 'en' ? theme.nameEn : theme.nameAm}
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-blue-100 text-blue-700">
                            Active
                          </span>
                        )}
                        {isVotedBest && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-600" /> Best ⭐
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {lang === 'en' ? theme.descriptionEn : theme.descriptionAm}
                      </p>
                    </div>

                    {/* Live Preview Sample Pill */}
                    <div 
                      className="p-3 rounded-2xl text-xs flex items-center justify-between"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                        color: '#ffffff'
                      }}
                    >
                      <span className="font-bold">Abune Gorgorios School</span>
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ backgroundColor: theme.colors.accent, color: '#0f172a' }}
                      >
                        Sample Badge
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectTheme(theme.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          {lang === 'en' ? 'Currently Applied' : 'አሁን የሚሰራው ዲዛይን'}
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5" />
                          {lang === 'en' ? 'Apply This Design' : 'ይህን ዲዛይን ተግብር'}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onVoteBestDesign(theme.id);
                        onSelectTheme(theme.id);
                      }}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isVotedBest
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                      title="Vote this as the best design"
                    >
                      <Star className={`w-3.5 h-3.5 ${isVotedBest ? 'fill-white' : 'fill-amber-400 text-amber-500'}`} />
                      {isVotedBest 
                        ? (lang === 'en' ? 'Best Design ⭐' : 'ምርጡ ዲዛይን ⭐')
                        : (lang === 'en' ? 'Pick as Best' : 'ምርጥ ብለው ይምረጡ')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {lang === 'en' 
              ? 'Your design selection is saved automatically and applies across all pages.' 
              : 'የመረጡት ዲዛይን በሁሉም ገጾች ላይ በራስ-ሰር ይተገበራል።'}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            {lang === 'en' ? 'Done & Save Selection' : 'ጨርስና አስቀምጥ'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
