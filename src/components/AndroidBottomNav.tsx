import React from 'react';
import { Home, MapPin, GraduationCap, FileText, UserCheck } from 'lucide-react';

interface AndroidBottomNavProps {
  activePage: string;
  setActivePage: (page: any) => void;
  lang: 'en' | 'am';
  isLoggedIn: boolean;
  userRole: string | null;
  onOpenInstall: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activePage,
  setActivePage,
  lang,
  isLoggedIn,
  userRole,
}) => {
  const navItems = [
    {
      id: 'Home',
      icon: Home,
      labelEn: 'Home',
      labelAm: 'ዋና',
    },
    {
      id: 'CampusMaps',
      icon: MapPin,
      labelEn: 'Maps',
      labelAm: 'ካርታ',
    },
    {
      id: 'Portal',
      icon: GraduationCap,
      labelEn: 'Portal',
      labelAm: 'ፖርታል',
    },
    {
      id: 'Admissions',
      icon: FileText,
      labelEn: 'Apply',
      labelAm: 'ማመልከቻ',
    },
    {
      id: isLoggedIn && userRole === 'Director' ? 'Director' : 'Contact',
      icon: UserCheck,
      labelEn: isLoggedIn && userRole === 'Director' ? 'Director' : 'Contact',
      labelAm: isLoggedIn && userRole === 'Director' ? 'ዳይሬክተር' : 'አድራሻ',
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active pill background */}
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-all ${
                  isActive ? 'bg-amber-400/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-amber-400' : ''}`}>
                {lang === 'en' ? item.labelEn : item.labelAm}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
