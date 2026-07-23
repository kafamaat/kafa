import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SignatureRecord, 
  UserProfile, 
  SystemSettings, 
  AppNotification 
} from './types';
import { db, subscribeRecords, saveRecords, clearAllRecords } from './utils/db';

// Component imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddSignature from './components/AddSignature';
import SignatureRecords from './components/SignatureRecords';
import Reports from './components/Reports';
import BackupRestore from './components/BackupRestore';
import Profile from './components/Profile';
import Settings from './components/Settings';

// Icons for Login
import { 
  Lock, 
  User, 
  Signature, 
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  LogOut,
  X
} from 'lucide-react';

export default function App() {
  // Authentication & Loading States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('kafa_sig_is_logged_in') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('kafa');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Core App State
  const [records, setRecords] = useState<SignatureRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ username: 'kafa', role: 'Administrator', avatar: '' });
  const [settings, setSettings] = useState<SystemSettings>({ darkMode: false, enableNotifications: true });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Navigation & UI States
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warning' | 'danger' }[]>([]);

  // 1. Initial Load: subscribe to Firestore real-time updates for records
  useEffect(() => {
    // Load local-only data immediately
    setProfile(db.getProfile());
    setSettings(db.getSettings());
    setNotifications(db.getNotifications());

    // Subscribe to Firestore records in real-time
    const unsubscribe = subscribeRecords((remoteRecords) => {
      setRecords(remoteRecords);
      // Once first snapshot arrives, dismiss loading screen
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Sync Theme State to Document Root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Toast adder helper
  const addToast = useCallback((text: string, type: 'success' | 'info' | 'warning' | 'danger' = 'info') => {
    if (!settings.enableNotifications) return;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, text, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, [settings.enableNotifications]);

  // 3. Login Authentication handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = loginUsername.trim().toLowerCase();
    const trimmedPw = loginPassword.trim();
    if ((trimmedUser === 'kafa' && trimmedPw === 'wasim') || (trimmedUser === 'admin' && trimmedPw === 'admin')) {
      localStorage.setItem('kafa_sig_is_logged_in', 'true');
      setIsLoggedIn(true);
      setShowWelcome(true);
      
      // Auto-close welcome splash screen after 2.5 seconds
      setTimeout(() => {
        setShowWelcome(false);
      }, 2500);

      // Create login notification
      const newNotif: AppNotification = {
        id: Math.random().toString(),
        text: `Administrator logged in successfully from container node.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'success'
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      db.saveNotifications(updatedNotifs);

    } else {
      setLoginError('Invalid Administrator credentials. Please try again.');
      addToast('Sign-in failed. Incorrect password.', 'danger');
    }
  };

  // 4. Logout Handler
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    localStorage.removeItem('kafa_sig_is_logged_in');
    setIsLoggedIn(false);
    setLoginPassword('');
    setShowLogoutConfirm(false);
    addToast('Logged out of Mr. Kafa Signature System session.', 'info');
  };

  // Intercept special navigation target like logout
  const handleNavigation = (page: string) => {
    if (page === 'logout') {
      handleLogout();
    } else {
      setActivePage(page);
    }
  };

  // 5. CRUD: Add Signature
  const handleAddSignature = (newRecord: Omit<SignatureRecord, 'id' | 'createdAt'>) => {
    const recordWithId: SignatureRecord = {
      ...newRecord,
      id: 'rec-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };

    const updated = [recordWithId, ...records];
    setRecords(updated);
    saveRecords(updated);

    // Create system notification
    const newNotif: AppNotification = {
      id: Math.random().toString(),
      text: `New signature recorded: "${newRecord.title}" handled by ${newRecord.person}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'success'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    db.saveNotifications(updatedNotifs);
  };

  // 6. CRUD: Update Signature
  const handleUpdateRecord = (updatedRecord: SignatureRecord) => {
    const updatedList = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    setRecords(updatedList);
    saveRecords(updatedList);

    const newNotif: AppNotification = {
      id: Math.random().toString(),
      text: `Modified signature log details: "${updatedRecord.title}".`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'info'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    db.saveNotifications(updatedNotifs);
  };

  // 7. CRUD: Delete Signature
  const handleDeleteRecord = (id: string) => {
    const target = records.find(r => r.id === id);
    const updatedList = records.filter(r => r.id !== id);
    setRecords(updatedList);
    saveRecords(updatedList);

    if (target) {
      const newNotif: AppNotification = {
        id: Math.random().toString(),
        text: `Removed document signature trace: "${target.title}".`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'danger'
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      db.saveNotifications(updatedNotifs);
    }
  };

  // 8. Restore records from backup
  const handleRestoreRecords = (importedRecords: SignatureRecord[]) => {
    setRecords(importedRecords);
    saveRecords(importedRecords);

    const newNotif: AppNotification = {
      id: Math.random().toString(),
      text: `Restored full database backup. Loaded ${importedRecords.length} records.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'success'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    db.saveNotifications(updatedNotifs);
  };

  // 9. Clear all database rows
  const handleClearAllData = () => {
    setRecords([]);
    clearAllRecords();

    const newNotif: AppNotification = {
      id: Math.random().toString(),
      text: `Entire signature log database was permanently wiped by administrator.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'danger'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    db.saveNotifications(updatedNotifs);
  };

  // 10. Update Profile details
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    db.saveProfile(updatedProfile);
  };

  // 11. Update settings config
  const handleUpdateSettings = (updatedSettings: SystemSettings) => {
    setSettings(updatedSettings);
    db.saveSettings(updatedSettings);
  };

  // 12. Clear Notifications dropdown list
  const handleClearNotifications = () => {
    setNotifications([]);
    db.saveNotifications([]);
    addToast('All notifications cleared.', 'info');
  };

  // Render correct active view
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard records={records} onNavigate={handleNavigation} />;
      case 'add-signature':
        return (
          <SignatureRecords 
            records={records} 
            onUpdateRecord={handleUpdateRecord} 
            onDeleteRecord={handleDeleteRecord} 
            onAddSignature={handleAddSignature}
            addToast={addToast}
            globalSearch={globalSearch}
            initialScrollToAdd={true}
          />
        );
      case 'records':
        return (
          <SignatureRecords 
            records={records} 
            onUpdateRecord={handleUpdateRecord} 
            onDeleteRecord={handleDeleteRecord} 
            onAddSignature={handleAddSignature}
            addToast={addToast}
            globalSearch={globalSearch}
            initialScrollToAdd={false}
          />
        );
      case 'reports':
        return <Reports records={records} addToast={addToast} />;
      case 'backup':
        return (
          <BackupRestore 
            records={records} 
            onRestoreRecords={handleRestoreRecords} 
            addToast={addToast} 
          />
        );
      case 'profile':
        return (
          <Profile 
            profile={profile} 
            onUpdateProfile={handleUpdateProfile} 
            addToast={addToast} 
          />
        );
      case 'settings':
        return (
          <Settings 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings} 
            onClearAllData={handleClearAllData} 
            addToast={addToast} 
          />
        );
      default:
        return <Dashboard records={records} onNavigate={handleNavigation} />;
    }
  };

  // Loader Overlay on first mount
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 text-white font-display">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/20 animate-spin">
            <Signature className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-lg tracking-wider text-slate-100">Mr. Kafa Signature System</h2>
            <p className="text-xs text-slate-400 animate-pulse">Initializing local database nodes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login Authentication View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100 relative overflow-hidden font-sans">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Logo / Title Banner */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/15">
              <Signature className="w-7 h-7 text-white dark:text-slate-950" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-slate-100">
                Mr. Kafa Signature System
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
                Secure Document Ledger
              </p>
            </div>
          </div>

          {/* Form Glass Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="text-center border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">ADMINISTRATIVE ACCESS</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Please sign-in to authorize cache write/read states.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password (hint: wasim)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 dark:text-red-400 leading-relaxed font-medium">
                  {loginError}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:text-slate-950 font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                Sign In to Mr. Kafa Signature System <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Footer Credentials */}
          <div className="text-center text-[10px] text-slate-500 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>Compiled and ready for Github Pages hosting.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Dynamic Welcome Splash Screen overlay on successful login */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 text-white text-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/20">
                <Signature className="w-10 h-10 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h1 className="font-display font-black text-2xl md:text-4xl tracking-tight text-white uppercase">
                  WELCOME MR. KAFA TO THE SYSTEM
                </h1>
                <div className="h-1.5 w-24 bg-blue-500 mx-auto rounded-full mt-2 animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Toast Alert Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none no-print">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border pointer-events-auto backdrop-blur-md ${
                toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' :
                toast.type === 'danger' ? 'bg-rose-500/90 text-white border-rose-400' :
                toast.type === 'warning' ? 'bg-amber-500/90 text-white border-amber-400' :
                'bg-slate-900/95 text-white border-slate-800'
              }`}
            >
              <span className="text-xs font-semibold leading-relaxed flex-1">
                {toast.text}
              </span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/60 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg bg-white/10 shrink-0 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2.5 Modal: Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
                <LogOut className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Confirm Sign Out</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Are you sure you want to log out of the system? Your active Mr. Kafa Signature System session will be terminated.
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Left Navigation Sidebar */}
      <div className="no-print">
        <Sidebar 
          activePage={activePage} 
          onNavigate={handleNavigation} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />
      </div>

      {/* 4. Main Body Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen lg:pl-68">
        
        {/* Top Header */}
        <div className="no-print">
          <Header 
            onMenuToggle={() => setSidebarOpen(true)}
            notifications={notifications}
            onClearNotifications={handleClearNotifications}
            onThemeToggle={() => handleUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
            darkMode={settings.darkMode}
            profile={profile}
            onNavigate={handleNavigation}
            globalSearch={globalSearch}
            onGlobalSearchChange={setGlobalSearch}
          />
        </div>

        {/* Dynamic Route View Stage */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
