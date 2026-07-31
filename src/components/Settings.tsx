import React, { useState } from 'react';
import { 
  Palette, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert,
  X,
  Check
} from 'lucide-react';
import { SystemSettings } from '../types';
import { ACCENT_COLORS } from '../utils/db';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (updated: SystemSettings) => void;
  onClearAllData: () => void;
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export default function Settings({ settings, onUpdateSettings, onClearAllData, addToast }: SettingsProps) {
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');
  const [wipeError, setWipeError] = useState('');
  
  const handleToggleDarkMode = (checked: boolean) => {
    onUpdateSettings({
      ...settings,
      darkMode: checked
    });
    addToast(checked ? 'Dark theme activated!' : 'Light theme activated!', 'info');
  };

  const handleAccentChange = (accent: string) => {
    onUpdateSettings({ ...settings, accentColor: accent });
    addToast(`Accent color changed to ${ACCENT_COLORS.find(a => a.value === accent)?.label || accent}!`, 'success');
  };

  const handleToggleNotifications = (checked: boolean) => {
    onUpdateSettings({
      ...settings,
      enableNotifications: checked
    });
    addToast(checked ? 'Notifications system enabled.' : 'Notifications muted.', 'info');
  };

  const handleWipeDatabase = () => {
    setShowWipeModal(true);
    setVerificationInput('');
    setWipeError('');
  };

  const handleConfirmWipe = () => {
    if (verificationInput !== 'DELETE ALL RECORDS') {
      setWipeError('Verification failed. Please type "DELETE ALL RECORDS" exactly.');
      return;
    }

    onClearAllData();
    addToast('All signature records have been permanently cleared!', 'danger');
    setShowWipeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure visual aesthetics, toggle telemetry, and perform database maintenance tasks.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Appearance Settings */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
          <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Palette className="w-4.5 h-4.5 text-blue-600" /> System Appearance
          </h4>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dark Mode Contrast</h5>
              <p className="text-xs text-slate-400 dark:text-slate-500">Toggle between the bright editorial canvas and the midnight theme.</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleToggleDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Accent Color */}
          <div className="py-3 border-t border-slate-100 dark:border-slate-800">
            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Accent Color</h5>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Choose your preferred accent color for buttons and highlights.</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map(accent => (
                <button
                  key={accent.value}
                  onClick={() => handleAccentChange(accent.value)}
                  className="relative w-9 h-9 rounded-xl cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: accent.hex }}
                  title={accent.label}
                >
                  {settings.accentColor === accent.value && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Administrative Data Governance */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-100 dark:border-rose-950/20 shadow-lg bg-rose-50/5 dark:bg-rose-950/5">
          <h4 className="font-display font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-600" /> Danger Maintenance Zone
          </h4>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="space-y-0.5">
              <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Wipe Document Signature Database</h5>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md">
                Permanently purge all signature entries, file categories, and responsible tracking records. This action cannot be undone.
              </p>
            </div>
            
            <button
              onClick={handleWipeDatabase}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/15 transition self-start sm:self-center"
            >
              <Trash2 className="w-4 h-4" /> Reset All Data
            </button>
          </div>

          <div className="mt-4 p-3 bg-rose-100/30 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex gap-2">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>
              <strong>Wipe Policy:</strong> Deleting records from local cache will result in absolute data loss. Make sure to download a JSON Backup archive from the <strong>Backup & Restore</strong> page before initializing a data reset.
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Wipe Confirmation */}
      {showWipeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-900 dark:text-white">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Critical Data Reset
              </h3>
              <button 
                onClick={() => setShowWipeModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl text-xs text-rose-600 dark:text-rose-400 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4.5 h-4.5" /> CRITICAL WARNING
                </div>
                <p>
                  You are about to wipe the entire Mr. Kafa Signature System database! This will permanently delete all records. This action cannot be undone.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  To verify deletion, type <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-rose-600 dark:text-rose-400 font-bold">DELETE ALL RECORDS</span> below:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type verification text"
                  value={verificationInput}
                  onChange={(e) => {
                    setVerificationInput(e.target.value);
                    if (wipeError) setWipeError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500"
                />
                {wipeError && (
                  <p className="text-xs font-medium text-rose-500 mt-1">{wipeError}</p>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWipe}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Permanently Wipe Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
