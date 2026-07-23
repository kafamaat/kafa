import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PenTool, 
  FileText, 
  BarChart3, 
  Database, 
  User, 
  Settings, 
  LogOut,
  X,
  Signature
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, profile }: SidebarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'records', label: 'Signature Records', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar backdrop for mobile view */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 w-68 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform lg:transform-none transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Signature className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-white leading-tight">
                Mr. Kafa Signature System
              </span>
            </div>
            <button 
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Sidebar Clock with Profile Picture */}
          <div className="p-4 mx-4 mt-4 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3.5 shadow-sm">
            {/* Left side: Clickable Profile Avatar */}
            <button
              onClick={() => {
                onNavigate('profile');
                onClose();
              }}
              className="relative shrink-0 focus:outline-none group cursor-pointer"
              title="View Profile"
            >
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.username} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 dark:border-blue-400 group-hover:scale-105 transition-transform shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-base font-bold flex items-center justify-center border-2 border-blue-500 dark:border-blue-400 group-hover:scale-105 transition-transform shadow-sm">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-50 dark:border-slate-800 rounded-full animate-pulse" />
            </button>

            {/* Right side: Live Date & Time Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                {formatDay(time)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate leading-tight mt-0.5">
                {formatDate(time)}
              </div>
              <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight leading-none mt-1">
                {formatTime(time)}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => onNavigate('logout')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
