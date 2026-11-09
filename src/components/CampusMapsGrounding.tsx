import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, RefreshCw, Send, Sparkles, Bus, Building2, BookOpen, AlertCircle } from 'lucide-react';

interface MapLink {
  uri: string;
  title: string;
}

interface CampusMapsGroundingProps {
  lang: 'en' | 'am';
}

export const CampusMapsGrounding: React.FC<CampusMapsGroundingProps> = ({ lang }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mapLinks, setMapLinks] = useState<MapLink[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      id: 'transit',
      icon: Bus,
      titleEn: 'Transit & Directions',
      titleAm: 'የትራንስፖርትና አቅጣጫ መረጃ',
      prompt: 'How do I reach Abune Gorgorios School campus from major transit hubs in Addis Ababa (Meskel Square, Bole, Megenagna, Piassa)? List minibus routes, bus numbers, and travel tips.'
    },
    {
      id: 'branches',
      icon: Building2,
      titleEn: 'Campus & Facilities',
      titleAm: 'የግቢው አቀማመጥና ቅርንጫፎች',
      prompt: 'Provide details on Abune Gorgorios School campus grounds in Addis Ababa, including main academic buildings, sports fields, library, and visitor parking locations.'
    },
    {
      id: 'facilities',
      icon: BookOpen,
      titleEn: 'Nearby Sports & Libraries',
      titleAm: 'አቅራቢያ ያሉ የስፖርት ሜዳዎችና ቤተ-መጻሕፍት',
      prompt: 'What sports complexes, youth centers, public libraries, and educational facilities are located near Abune Gorgorios School in Addis Ababa?'
    },
    {
      id: 'landmarks',
      icon: Compass,
      titleEn: 'Neighborhood Landmarks',
      titleAm: 'የአካባቢው ምልክቶችና ዋና መንገዶች',
      prompt: 'What prominent landmarks, medical clinics, and main avenues are adjacent to Abune Gorgorios School in Addis Ababa?'
    }
  ];

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(lang === 'en' ? 'Geolocation not supported by browser' : 'የአካባቢ መፈለጊያ በአሳሽዎ አይደገፍም');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        // Fallback default coordinates for central Addis Ababa
        setUserLocation({ latitude: 9.005401, longitude: 38.763611 });
      },
      { timeout: 8000 }
    );
  };

  const handleQuery = async (customPrompt?: string) => {
    const promptToSend = customPrompt || query.trim();
    if (!promptToSend) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          userLocation
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.reply);
        setMapLinks(data.mapLinks || []);
      } else {
        setErrorMsg(data.error || 'Failed to fetch Google Maps data');
      }
    } catch (err: any) {
      console.error('Maps Grounding client request error:', err);
      setErrorMsg(lang === 'en' ? 'Network error querying maps' : 'የካርታ መረጃ በማምጣት ላይ ስህተት ተፈጥሯል');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden text-slate-100">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Google Maps AI Grounding badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Google Maps Grounding • Gemini 3.8 Flash' : 'የGoogle ካርታ መረጃ • ጀሚኒ 3.8 ፍላሽ'}
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Navigation className="w-7 h-7 text-amber-400" />
            {lang === 'en' ? 'Campus Navigation & Location Intelligence' : 'የግቢ አቅጣጫና የቀጥታ ካርታ መረጃ'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {lang === 'en'
              ? 'Find official campus directions, public transit lines in Addis Ababa, and explore surrounding educational and athletic facilities.'
              : 'የአቡነ ጎርጎሪዮስ ት/ቤት ግቢ አቅጣጫዎችን፣ የአዲስ አበባ የትራንስፖርት መስመሮችን እና አቅራቢያ ያሉ የስፖርትና ትምህርታዊ ማዕከሎችን ይፈልጉ።'}
          </p>
        </div>

        {/* Location detect button */}
        <button
          onClick={handleGetLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
        >
          <Compass className={`w-4 h-4 text-emerald-400 ${locating ? 'animate-spin' : ''}`} />
          {userLocation
            ? (lang === 'en' ? 'GPS Pinpoint Active' : 'የእርስዎ ጂፒኤስ ተገኝቷል')
            : (lang === 'en' ? 'Use My Location' : 'የእኔን አካባቢ ተጠቀም')}
        </button>
      </div>

      {/* Preset Queries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setActivePreset(preset.id);
                setQuery(preset.prompt);
                handleQuery(preset.prompt);
              }}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {lang === 'en' ? preset.titleEn : preset.titleAm}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {lang === 'en' ? 'Tap to query live maps' : 'የቀጥታ ካርታ ለማየት ይንኩ'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleQuery();
        }}
        className="flex gap-2 mb-6"
      >
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Ask for routes, bus lines, nearby sports venues, or Addis Ababa landmarks...'
                : 'ስለ አውቶቡስ መስመሮች፣ አቅራቢያ የስፖርት ሜዳዎች ወይም የመንገድ አቅጣጫ ይጠይቁ...'
            }
            className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-2xl flex items-center gap-2 transition shadow-lg shadow-blue-900/30 shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {lang === 'en' ? 'Explore' : 'ፈልግ'}
          </span>
        </button>
      </form>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800 text-center my-4">
          <div className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-400 mb-3 animate-pulse">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-white">
            {lang === 'en' ? 'Retrieving Google Maps Grounding & Transit Data...' : 'የGoogle ካርታ መረጃና የትራንስፖርት አቅጣጫዎች በመጫን ላይ...'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en' ? 'Grounding geographical insights with Gemini 3.8 Flash' : 'በጀሚኒ 3.8 ፍላሽ እና በGoogle ካርታ የቀረበ'}
          </p>
        </div>
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
            {result}
          </div>

          {/* Extracted Google Maps Links (Mandatory per Google Maps Grounding guidelines) */}
          {mapLinks.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-blue-500/30">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {lang === 'en' ? 'Google Maps Places & Direct Navigation Links' : 'የGoogle ካርታ የቀጥታ አቅጣጫ መዳረሻዎች'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {mapLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-blue-950/50 border border-slate-700/80 hover:border-blue-500 text-xs text-blue-300 font-medium transition group"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0 group-hover:scale-110 transition" />
                      <span className="truncate">{link.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-400 font-semibold uppercase tracking-wider shrink-0 ml-2">
                      Open Map
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial default state if no search performed yet */}
      {!result && !loading && (
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
            <Compass className="w-8 h-8" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h4 className="text-sm font-bold text-white">
              {lang === 'en' ? 'School Address & Campus Access' : 'የት/ቤቱ አድራሻ እና የግቢ መዳረሻ'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en'
                ? 'Main Campus: Addis Ababa, Ethiopia • Gate Hours: Mon–Fri 7:30 AM – 5:30 PM, Sat 8:00 AM – 1:00 PM.'
                : 'ዋና ግቢ፡ አዲስ አበባ፣ ኢትዮጵያ • የበራፍ ሰዓት፡ ከሰኞ-አርብ ከጥዋቱ 1፡30 እስከ ቀኑ 11፡30፣ ቅዳሜ ከጥዋቱ 2፡00 እስከ ቀኑ 7፡00።'}
            </p>
          </div>
          <button
            onClick={() => {
              const defaultPrompt = 'What is the location, surrounding neighborhood, and directions to Abune Gorgorios School in Addis Ababa, Ethiopia? Provide public transit and landmarks.';
              setQuery(defaultPrompt);
              handleQuery(defaultPrompt);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 border border-amber-500/30 transition shrink-0"
          >
            {lang === 'en' ? 'View Campus Directions' : 'የግቢ አቅጣጫ ይመልከቱ'}
          </button>
        </div>
      )}
    </div>
  );
};
