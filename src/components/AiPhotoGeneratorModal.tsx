import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Wand2, 
  X, 
  Check, 
  RefreshCw, 
  User, 
  GraduationCap, 
  Briefcase, 
  Palette, 
  Sliders, 
  BookOpen, 
  Atom, 
  Compass,
  Download,
  Eye
} from 'lucide-react';

export type AvatarStyle = 'academic' | 'executive' | 'cultural' | 'stem' | 'modern' | 'crest';
export type GenderPreference = 'all' | 'female' | 'male' | 'neutral';

interface AiPhotoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUrl: string) => void;
  facultyName: string;
  facultyTitle: string;
  facultyBio?: string;
  lang: 'en' | 'am';
}

interface GeneratedOption {
  id: string;
  title: string;
  category: string;
  url: string;
  source: 'gemini' | 'vector' | 'crest' | 'dicebear';
}

// Helper to generate a themed SVG avatar
export function generateProfessionalSvgAvatar(
  name: string,
  title: string,
  style: AvatarStyle,
  gender: GenderPreference,
  paletteIndex: number = 0
): string {
  const initials = (name || 'Faculty')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'AG';

  const palettes = [
    { bg1: '#1e3a8a', bg2: '#2563eb', accent: '#f59e0b', tie: '#d97706', skin: '#d4a373', hair: '#1e293b' }, // School Navy & Amber
    { bg1: '#064e3b', bg2: '#059669', accent: '#34d399', tie: '#10b981', skin: '#bb8554', hair: '#0f172a' }, // Emerald Academic
    { bg1: '#4c1d95', bg2: '#7c3aed', accent: '#fbbf24', tie: '#8b5cf6', skin: '#e2a775', hair: '#312e81' }, // Royal Purple
    { bg1: '#881337', bg2: '#e11d48', accent: '#fb7185', tie: '#be123c', skin: '#c68642', hair: '#18181b' }, // Maroon / Burgundy
    { bg1: '#0f172a', bg2: '#334155', accent: '#38bdf8', tie: '#0284c7', skin: '#ad784c', hair: '#020617' }, // Executive Slate
  ];

  const p = palettes[paletteIndex % palettes.length];

  // Specific subject/style badges
  let badgeIcon = '';
  if (style === 'stem' || title.toLowerCase().includes('science') || title.toLowerCase().includes('math')) {
    badgeIcon = `
      <g transform="translate(310, 60)">
        <circle cx="20" cy="20" r="24" fill="${p.accent}" opacity="0.95" />
        <ellipse cx="20" cy="20" rx="15" ry="6" fill="none" stroke="#ffffff" stroke-width="2" transform="rotate(30 20 20)" />
        <ellipse cx="20" cy="20" rx="15" ry="6" fill="none" stroke="#ffffff" stroke-width="2" transform="rotate(-30 20 20)" />
        <circle cx="20" cy="20" r="3" fill="#ffffff" />
      </g>
    `;
  } else if (style === 'executive' || title.toLowerCase().includes('director') || title.toLowerCase().includes('head')) {
    badgeIcon = `
      <g transform="translate(310, 60)">
        <circle cx="20" cy="20" r="24" fill="${p.accent}" opacity="0.95" />
        <polygon points="20,10 24,17 32,18 26,24 28,32 20,28 12,32 14,24 8,18 16,17" fill="#ffffff" />
      </g>
    `;
  } else {
    badgeIcon = `
      <g transform="translate(310, 60)">
        <circle cx="20" cy="20" r="24" fill="${p.accent}" opacity="0.95" />
        <!-- Graduation Cap -->
        <polygon points="20,11 32,17 20,23 8,17" fill="#ffffff" />
        <path d="M12 20 L12 26 C12 29 20 32 20 32 C20 32 28 29 28 26 L28 20" fill="#ffffff" />
        <line x1="30" y1="18" x2="30" y2="28" stroke="#ffffff" stroke-width="1.5" />
      </g>
    `;
  }

  // Hair style according to gender
  let hairSvg = '';
  if (gender === 'female') {
    hairSvg = `
      <!-- Long / styled hair -->
      <path d="M135 150 C135 100 160 85 200 85 C240 85 265 100 265 150 C265 190 270 230 270 260 C255 260 250 210 245 170 C240 140 230 110 200 110 C170 110 160 140 155 170 C150 210 145 260 130 260 C130 230 135 190 135 150 Z" fill="${p.hair}" />
    `;
  } else if (gender === 'male') {
    hairSvg = `
      <!-- Neatly groomed short academic hair -->
      <path d="M142 140 C140 95 165 85 200 85 C235 85 260 95 258 140 C245 110 230 102 200 102 C170 102 155 110 142 140 Z" fill="${p.hair}" />
    `;
  } else {
    hairSvg = `
      <!-- Modern stylish academic haircut -->
      <path d="M145 140 C145 92 168 85 200 85 C232 85 255 92 255 140 C240 105 225 98 200 98 C175 98 160 105 145 140 Z" fill="${p.hair}" />
    `;
  }

  // Ethiopian Cultural Netela Accents
  let attireSvg = '';
  if (style === 'cultural') {
    attireSvg = `
      <!-- Ethiopian Formal Gabi / Netela Shawl with Tibeb Border -->
      <path d="M100 340 C100 240, 140 220, 200 220 C260 220, 300 240, 300 340 Z" fill="#f8fafc" />
      <!-- Tibeb woven decorative ribbon border -->
      <path d="M105 320 Q200 250 295 320" fill="none" stroke="${p.accent}" stroke-width="8" />
      <path d="M110 326 Q200 256 290 326" fill="none" stroke="#2563eb" stroke-width="3" />
      <path d="M115 332 Q200 262 285 332" fill="none" stroke="#10b981" stroke-width="3" />
      <!-- Collar -->
      <polygon points="200,220 185,250 215,250" fill="${p.bg1}" />
    `;
  } else if (style === 'executive') {
    attireSvg = `
      <!-- Executive Blazer & Tie -->
      <path d="M90 340 C90 230, 140 215, 200 215 C260 215, 310 230, 310 340 Z" fill="#1e293b" />
      <!-- Inner shirt -->
      <polygon points="200,215 175,270 225,270" fill="#ffffff" />
      <!-- Tie -->
      <polygon points="196,235 204,235 208,310 200,320 192,310" fill="${p.tie}" />
      <!-- Lapels -->
      <path d="M175 220 L155 270 L180 270 Z" fill="#0f172a" />
      <path d="M225 220 L245 270 L220 270 Z" fill="#0f172a" />
    `;
  } else {
    attireSvg = `
      <!-- Academic Formal Blazer with Collar -->
      <path d="M95 340 C95 235, 145 218, 200 218 C255 218, 305 235, 305 340 Z" fill="${p.bg1}" />
      <!-- Shirt collar -->
      <polygon points="200,218 180,260 220,260" fill="#ffffff" />
      <polygon points="196,230 204,230 202,280 198,280" fill="${p.accent}" />
      <!-- Lapels -->
      <path d="M180 225 L160 270 L185 270 Z" fill="#172554" opacity="0.6" />
      <path d="M220 225 L240 270 L215 270 Z" fill="#172554" opacity="0.6" />
    `;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_${p.bg1.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="100%" stop-color="${p.bg2}" />
    </linearGradient>
    <radialGradient id="glow_${p.bg1.replace('#','')}" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.2" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg_${p.bg1.replace('#','')})" />
  <rect width="400" height="400" fill="url(#glow_${p.bg1.replace('#','')})" />

  <!-- School decorative framing pattern -->
  <circle cx="200" cy="200" r="185" fill="none" stroke="${p.accent}" stroke-width="2" stroke-opacity="0.3" />
  <circle cx="200" cy="200" r="172" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="6 4" />

  <!-- Decorative geometric background accents -->
  <circle cx="50" cy="70" r="28" fill="#ffffff" fill-opacity="0.05" />
  <circle cx="350" cy="320" r="45" fill="#ffffff" fill-opacity="0.05" />

  <!-- Attire / Shoulders -->
  <g filter="url(#shadow)">
    ${attireSvg}
  </g>

  <!-- Neck -->
  <rect x="184" y="190" width="32" height="40" rx="6" fill="${p.skin}" />

  <!-- Head / Face -->
  <g filter="url(#shadow)">
    <!-- Hair back -->
    ${hairSvg}
    <!-- Face shape -->
    <ellipse cx="200" cy="155" rx="46" ry="52" fill="${p.skin}" />
    
    <!-- Ears -->
    <circle cx="152" cy="158" r="10" fill="${p.skin}" />
    <circle cx="248" cy="158" r="10" fill="${p.skin}" />

    <!-- Eyebrows -->
    <path d="M172 136 Q184 132 192 136" fill="none" stroke="${p.hair}" stroke-width="3" stroke-linecap="round" />
    <path d="M208 136 Q216 132 228 136" fill="none" stroke="${p.hair}" stroke-width="3" stroke-linecap="round" />

    <!-- Eyes -->
    <ellipse cx="182" cy="147" rx="4" ry="5" fill="#0f172a" />
    <ellipse cx="218" cy="147" rx="4" ry="5" fill="#0f172a" />
    <circle cx="184" cy="145" r="1.5" fill="#ffffff" />
    <circle cx="220" cy="145" r="1.5" fill="#ffffff" />

    <!-- Academic Glasses -->
    <rect x="168" y="138" width="28" height="18" rx="6" fill="none" stroke="${p.accent}" stroke-width="2.5" />
    <rect x="204" y="138" width="28" height="18" rx="6" fill="none" stroke="${p.accent}" stroke-width="2.5" />
    <line x1="196" y1="147" x2="204" y2="147" stroke="${p.accent}" stroke-width="2.5" />

    <!-- Nose -->
    <path d="M200 152 L198 165 L204 165" fill="none" stroke="#9a6032" stroke-width="2.5" stroke-linecap="round" />

    <!-- Warm Smile -->
    <path d="M186 177 Q200 188 214 177" fill="none" stroke="#683411" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Name & Initials Badge on Bottom -->
  <g transform="translate(200, 362)">
    <rect x="-85" y="-18" width="170" height="30" rx="15" fill="#0f172a" fill-opacity="0.85" stroke="${p.accent}" stroke-width="1.5" />
    <text x="0" y="2" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${initials} • AGS FACULTY
    </text>
  </g>

  <!-- Badge Icon on Top Right -->
  ${badgeIcon}
</svg>`.trim();

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// Helper to generate official school seal emblem avatar
export function generateSchoolSealAvatar(name: string, title: string, index: number = 0): string {
  const initials = (name || 'AG')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'AG';

  const themes = [
    { primary: '#1e3a8a', secondary: '#2563eb', gold: '#d97706', light: '#fef3c7' },
    { primary: '#0f766e', secondary: '#0d9488', gold: '#f59e0b', light: '#ccfbf1' },
    { primary: '#431407', secondary: '#9a3412', gold: '#eab308', light: '#ffedd5' },
  ];
  const t = themes[index % themes.length];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="sealBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.primary}" />
      <stop offset="100%" stop-color="${t.secondary}" />
    </linearGradient>
  </defs>

  <rect width="400" height="400" fill="url(#sealBg)" />

  <!-- Outer ring with gear teeth / sunburst -->
  <circle cx="200" cy="200" r="180" fill="none" stroke="${t.gold}" stroke-width="3" />
  <circle cx="200" cy="200" r="165" fill="none" stroke="${t.gold}" stroke-width="6" stroke-dasharray="14 8" />
  <circle cx="200" cy="200" r="148" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.8" />

  <!-- Center medallion -->
  <circle cx="200" cy="200" r="130" fill="${t.primary}" stroke="${t.gold}" stroke-width="4" />

  <!-- Open Book Symbol of Knowledge -->
  <g transform="translate(200, 145) scale(0.9)">
    <path d="M0 -5 C-25 -25 -65 -25 -90 -10 L-90 40 C-65 25 -25 25 0 45 C25 25 65 25 90 40 L90 -10 C65 -25 25 -25 0 -5 Z" fill="#ffffff" fill-opacity="0.9" />
    <path d="M0 -5 L0 45" stroke="${t.primary}" stroke-width="3" />
    <line x1="-80" y1="5" x2="-15" y2="18" stroke="${t.secondary}" stroke-width="2.5" />
    <line x1="-80" y1="20" x2="-15" y2="33" stroke="${t.secondary}" stroke-width="2.5" />
    <line x1="80" y1="5" x2="15" y2="18" stroke="${t.secondary}" stroke-width="2.5" />
    <line x1="80" y1="20" x2="15" y2="33" stroke="${t.secondary}" stroke-width="2.5" />
  </g>

  <!-- Large Initials Monogram -->
  <text x="200" y="240" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="${t.gold}" text-anchor="middle" letter-spacing="4">
    ${initials}
  </text>

  <!-- Title / Department -->
  <text x="200" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#ffffff" text-anchor="middle" letter-spacing="2">
    ${title ? title.toUpperCase().slice(0, 24) : 'ABUNE GORGORIOS'}
  </text>

  <!-- School motto / banner -->
  <text x="200" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="${t.gold}" text-anchor="middle" letter-spacing="3">
    FACULTY EXCELLENCE
  </text>
</svg>`.trim();

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const AiPhotoGeneratorModal: React.FC<AiPhotoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  facultyName,
  facultyTitle,
  facultyBio = '',
  lang,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>('academic');
  const [selectedGender, setSelectedGender] = useState<GenderPreference>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<GeneratedOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  // Generate initial palette of options whenever faculty details change or modal opens
  const generateBatch = async (forceGemini: boolean = false) => {
    setIsGenerating(true);
    const newOptions: GeneratedOption[] = [];

    // 1. Try Gemini API if requested or on initial open
    if (forceGemini || customPrompt.trim()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7500);
        const res = await fetch('/api/generate-faculty-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: facultyName || 'Faculty Member',
            title: facultyTitle || 'Educator',
            bio: facultyBio,
            style: selectedStyle,
            gender: selectedGender,
            prompt: customPrompt,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data.photoUrl) {
            newOptions.push({
              id: `gemini-${Date.now()}`,
              title: lang === 'en' ? 'AI Custom Portrait' : 'AI ብጁ ምስል',
              category: lang === 'en' ? 'Gemini AI' : 'ጀሚኒ AI',
              url: data.photoUrl,
              source: 'gemini',
            });
          }
        }
      } catch (err) {
        console.warn('Backend generation endpoint unavailable or timed out, using vector styles:', err);
      }
    }

    // 2. High-quality vector styles
    const stylesToBuild: { style: AvatarStyle; label: string; cat: string; palette: number; gender: GenderPreference }[] = [
      { style: 'academic', label: lang === 'en' ? 'Classic Academic' : 'ክላሲክ አካዳሚክ', cat: 'Academic', palette: 0, gender: selectedGender === 'all' ? 'neutral' : selectedGender },
      { style: 'executive', label: lang === 'en' ? 'School Leadership' : 'የትምህርት ቤት አመራር', cat: 'Leadership', palette: 4, gender: selectedGender === 'all' ? 'neutral' : selectedGender },
      { style: 'cultural', label: lang === 'en' ? 'Ethiopian Formal' : 'የኢትዮጵያ ባህላዊ አልባሳት', cat: 'Heritage', palette: 1, gender: selectedGender === 'all' ? 'female' : selectedGender },
      { style: 'stem', label: lang === 'en' ? 'STEM Specialist' : 'የሳይንስ እና ሂሳብ ስፔሻሊስት', cat: 'STEM', palette: 2, gender: selectedGender === 'all' ? 'male' : selectedGender },
      { style: 'modern', label: lang === 'en' ? 'Modern Educator' : 'ዘመናዊ መምህር', cat: 'Modern', palette: 3, gender: selectedGender === 'all' ? 'neutral' : selectedGender },
    ];

    stylesToBuild.forEach((item, index) => {
      const url = generateProfessionalSvgAvatar(
        facultyName,
        facultyTitle,
        item.style,
        item.gender,
        item.palette
      );
      newOptions.push({
        id: `vector-${item.style}-${index}-${Date.now()}`,
        title: item.label,
        category: item.cat,
        url,
        source: 'vector',
      });
    });

    // 3. School Seal Crest Emblem
    const crestUrl = generateSchoolSealAvatar(facultyName, facultyTitle, 0);
    newOptions.push({
      id: `crest-${Date.now()}`,
      title: lang === 'en' ? 'Official Crest Seal' : 'ይፋዊ የትምህርት ቤት ማኅተም',
      category: lang === 'en' ? 'Emblem' : 'ማኅተም',
      url: crestUrl,
      source: 'crest',
    });

    // 4. DiceBear Academic Avataaar (seeded with teacher name)
    const dicebearSeed = encodeURIComponent(facultyName || 'faculty-educator');
    const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${dicebearSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    newOptions.push({
      id: `dicebear-${Date.now()}`,
      title: lang === 'en' ? 'Illustrated Scholar' : 'ስዕላዊ ምሁር',
      category: lang === 'en' ? 'Illustrated' : 'ስዕላዊ',
      url: dicebearUrl,
      source: 'dicebear',
    });

    setOptions(newOptions);
    if (newOptions.length > 0 && !selectedOptionId) {
      setSelectedOptionId(newOptions[0].id);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateBatch();
    }
  }, [isOpen, facultyName, facultyTitle, selectedStyle, selectedGender]);

  if (!isOpen) return null;

  const selectedOption = options.find(o => o.id === selectedOptionId) || options[0];

  const handleApply = () => {
    if (selectedOption) {
      onSelectPhoto(selectedOption.url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] z-10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={lang === 'en' ? 'Close' : 'ዝጋ'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-400 text-blue-950 rounded-2xl shadow-lg shadow-amber-400/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-amber-300">
                {lang === 'en' ? 'AI Faculty Portrait Studio' : 'የAI መምህራን ፎቶ ስቱዲዮ'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {lang === 'en' ? 'Generate Faculty Photo' : 'የመምህር ፎቶ በAI ይፍጠሩ'}
              </h2>
            </div>
          </div>

          <p className="text-blue-100/80 text-sm max-w-xl">
            {lang === 'en'
              ? `Creating a professional portrait for ${facultyName || 'Faculty Member'}${facultyTitle ? ` (${facultyTitle})` : ''}. Perfect when uploading a personal file isn't preferred.`
              : `ለ${facultyName || 'መምህር'}${facultyTitle ? ` (${facultyTitle})` : ''} ሙያዊ ፎቶ መፍጠር። ፎቶ መስቀል በማይመረጥበት ጊዜ ፍቱን አማራጭ ነው።`}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls Bar: Style, Gender, and Prompt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {/* Style Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                {lang === 'en' ? 'Academic Style' : 'የአልባሳት ዘይቤ'}
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as AvatarStyle)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-600"
              >
                <option value="academic">{lang === 'en' ? 'Classic Academic' : 'ክላሲክ አካዳሚክ'}</option>
                <option value="executive">{lang === 'en' ? 'School Leadership / Director' : 'የትምህርት ቤት አመራር / ዳይሬክተር'}</option>
                <option value="cultural">{lang === 'en' ? 'Ethiopian Formal Heritage' : 'የኢትዮጵያ ባህላዊ ክብር'}</option>
                <option value="stem">{lang === 'en' ? 'STEM / Science Specialist' : 'የሳይንስ እና ሂሳብ ስፔሻሊስት'}</option>
                <option value="modern">{lang === 'en' ? 'Modern Educator' : 'ዘመናዊ መምህር'}</option>
              </select>
            </div>

            {/* Gender / Tone Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                {lang === 'en' ? 'Presentation' : 'ገጽታ'}
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as GenderPreference)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-600"
              >
                <option value="all">{lang === 'en' ? 'Diverse / All Styles' : 'የተለያዩ አማራጮች'}</option>
                <option value="female">{lang === 'en' ? 'Female Educator' : 'ሴት መምህርት'}</option>
                <option value="male">{lang === 'en' ? 'Male Educator' : 'ወንድ መምህር'}</option>
                <option value="neutral">{lang === 'en' ? 'Formal Neutral' : 'መደበኛ ገለልተኛ'}</option>
              </select>
            </div>

            {/* Custom Prompt & Trigger */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-purple-600" />
                {lang === 'en' ? 'Custom AI Prompt' : 'ብጁ የAI ጥያቄ'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'e.g. With glasses, smiling...' : 'ለምሳሌ መነጽር ያደረጉ...'}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => generateBatch(true)}
                  disabled={isGenerating}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-200 disabled:opacity-50"
                  title={lang === 'en' ? 'Generate with AI' : 'በAI ፍጠር'}
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{lang === 'en' ? 'Generate' : 'ፍጠር'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Display: Active Preview + Grid of generated options */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Preview Panel (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                {lang === 'en' ? 'Selected Photo Preview' : 'የተመረጠው ፎቶ ቅድመ-ዕይታ'}
              </span>

              {selectedOption ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  {/* Large Square Frame */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 group">
                    <img
                      src={selectedOption.url}
                      alt={selectedOption.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewZoomUrl(selectedOption.url)}
                        className="p-2.5 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-lg transition-transform hover:scale-110"
                        title={lang === 'en' ? 'Zoom In' : 'አጉላ'}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Circular & Badge Preview to simulate directory view */}
                  <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span className="text-xs font-medium text-slate-500">
                      {lang === 'en' ? 'Directory Avatar:' : 'በድረ-ገጽ ላይ:'}
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm">
                      <img
                        src={selectedOption.url}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {facultyName || (lang === 'en' ? 'Faculty Member' : 'መምህር')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{selectedOption.title}</h4>
                    <p className="text-xs text-slate-500">{selectedOption.category} • {lang === 'en' ? 'Optimized for Abune Gorgorios School' : 'ለአቡነ ጎርጎርዮስ ትምህርት ቤት የተዘጋጀ'}</p>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Right: Grid of Generated Styles (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {lang === 'en' ? 'Select an Avatar Style' : 'የአቫታር አይነት ይምረጡ'}
                </span>
                <button
                  type="button"
                  onClick={() => generateBatch(false)}
                  disabled={isGenerating}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  {lang === 'en' ? 'Refresh All Styles' : 'ሁሉንም ያድሱ'}
                </button>
              </div>

              {isGenerating ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse flex flex-col items-center justify-center p-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 mb-2" />
                      <div className="w-20 h-3 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    return (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOptionId(option.id)}
                        className={`cursor-pointer rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center text-center relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100 ring-2 ring-blue-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-100 shadow-sm mb-2 bg-slate-900">
                          <img
                            src={option.url}
                            alt={option.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <span className="text-xs font-bold text-slate-800 line-clamp-1 w-full">
                          {option.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {option.category}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {lang === 'en'
              ? 'Clicking Apply sets this AI photo on the faculty profile. You can always change or replace it later.'
              : 'ተግብር የሚለውን ሲጫኑ ይህ የAI ፎቶ ለመምህሩ ፕሮፋይል ይቀመጣል። በኋላ ላይ መቀየር ይችላሉ።'}
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-all text-sm"
            >
              {lang === 'en' ? 'Cancel' : 'ይቅር'}
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!selectedOption}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'en' ? 'Apply Photo to Profile' : 'ፎቶውን ለፕሮፋይሉ ተግብር'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox / Zoom modal */}
      <AnimatePresence>
        {previewZoomUrl && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center">
              <button
                onClick={() => setPreviewZoomUrl(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
              <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-inner border border-slate-100 mb-4 bg-slate-900">
                <img src={previewZoomUrl} alt="Zoom" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectPhoto(previewZoomUrl);
                  setPreviewZoomUrl(null);
                  onClose();
                }}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"
              >
                {lang === 'en' ? 'Use This Photo' : 'ይህን ፎቶ ተጠቀም'}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
