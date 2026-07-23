import React from 'react';
import { 
  Menu, 
  Search, 
  Moon, 
  Sun
} from 'lucide-react';
import { AppNotification, UserProfile } from '../types';

interface HeaderProps {
  onMenuToggle: () => void;
  notifications?: AppNotification[];
  onClearNotifications?: () => void;
  onThemeToggle: () => void;
  darkMode: boolean;
  profile: UserProfile;
  onNavigate: (page: string) => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
}

export default function Header({
  onMenuToggle,
  onThemeToggle,
  darkMode,
  globalSearch,
  onGlobalSearchChange
}: HeaderProps) {
  return (
    <header className="sticky top-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button 
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center Welcome Banner */}
      <div className="flex-1 text-center max-w-[130px] min-[380px]:max-w-[200px] sm:max-w-md md:max-w-xl mx-auto px-1">
        <h4 className="font-display font-black text-[9px] min-[380px]:text-[11px] sm:text-sm md:text-base lg:text-lg xl:text-xl tracking-wide text-slate-800 dark:text-slate-100 uppercase truncate">
          WELCOME MR. KAFA TO THE SYSTEM
        </h4>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1 md:gap-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            className="w-16 min-[380px]:w-24 sm:w-40 md:w-60 focus:w-24 min-[380px]:focus:w-32 sm:focus:w-48 pl-8 pr-3 py-1.5 rounded-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-700 dark:text-slate-200 transition-all duration-300 animate-none"
          />
        </div>

        {/* Theme Toggler */}
        <button
          onClick={onThemeToggle}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  );
}
