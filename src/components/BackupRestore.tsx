import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  History,
  HardDrive
} from 'lucide-react';
import { SignatureRecord } from '../types';

interface BackupRestoreProps {
  records: SignatureRecord[];
  onRestoreRecords: (imported: SignatureRecord[]) => void;
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export default function BackupRestore({ records, onRestoreRecords, addToast }: BackupRestoreProps) {
  const [lastBackupTime, setLastBackupTime] = useState<string>('Never');
  const [storageSize, setStorageSize] = useState<string>('0 KB');

  useEffect(() => {
    // Load last backup timestamp
    const savedTime = localStorage.getItem('kafa_sig_last_backup_time');
    if (savedTime) {
      setLastBackupTime(new Date(savedTime).toLocaleString());
    }

    // Calculate localStorage used size
    let totalBytes = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        totalBytes += ((localStorage[x].length + x.length) * 2);
      }
    }
    const kb = (totalBytes / 1024).toFixed(2);
    setStorageSize(`${kb} KB`);
  }, [records]);

  // Export records array to standard JSON
  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify(records, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mr_Kafa_Signature_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save backup timestamp
      const now = new Date().toISOString();
      localStorage.setItem('kafa_sig_last_backup_time', now);
      setLastBackupTime(new Date(now).toLocaleString());

      addToast('Backup JSON file downloaded successfully!', 'success');
    } catch (e) {
      addToast('Backup generation failed. Please try again.', 'danger');
    }
  };

  // Import / Upload backup
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        
        // Basic schema verification: must be an array of records
        if (!Array.isArray(jsonContent)) {
          addToast('Invalid backup file. The backup must contain an array of records.', 'danger');
          return;
        }

        // Validate each object in the array has required keys
        const isValid = jsonContent.every(item => {
          return (
            typeof item === 'object' &&
            item !== null &&
            'title' in item &&
            'date' in item &&
            'docType' in item &&
            'person' in item &&
            'id' in item
          );
        });

        if (!isValid) {
          addToast('Backup file format is invalid. Required fields are missing.', 'danger');
          return;
        }

        // Apply backup
        if (window.confirm(`Are you sure you want to restore? This will overwrite your current ${records.length} records with ${jsonContent.length} records from the backup file.`)) {
          onRestoreRecords(jsonContent);
          addToast(`Backup restored successfully! Loaded ${jsonContent.length} records.`, 'success');
        }
      } catch (err) {
        addToast('Failed to parse backup JSON. File is corrupted or invalid.', 'danger');
      }
    };
    reader.readAsText(file);
    // Clear input so it can be re-triggered
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
          Backup & Restore
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your signature data safely. Save archives offline and restore from backup files anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg flex flex-col justify-between text-center space-y-6">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Download className="w-6.5 h-6.5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">Export Backup JSON</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Download all your signature records as a secure `.json` file. Keep this file safe to preserve your history.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full sm:w-auto self-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/15 transition"
          >
            <Download className="w-4 h-4" /> Download Backup File
          </button>
        </div>

        {/* Import Card */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg flex flex-col justify-between text-center space-y-6">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Upload className="w-6.5 h-6.5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">Import Backup JSON</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Upload an existing `Mr. Kafa Signature System` backup file. This will restore all document records into your system.
            </p>
          </div>
          <div className="relative inline-block self-center w-full sm:w-auto">
            <input
              type="file"
              id="import-backup-input"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('import-backup-input')?.click()}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
            >
              <Upload className="w-4 h-4" /> Upload & Restore Backup
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics / Information Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
        <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <Database className="w-4.5 h-4.5 text-blue-600" /> Database & Storage Diagnostics
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Diagnostic 1 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Database Rows</span>
              <span className="font-display font-bold text-slate-800 dark:text-slate-100">{records.length} records</span>
            </div>
          </div>

          {/* Diagnostic 2 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3.5">
            <div className="p-2 bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Last Export Action</span>
              <span className="font-semibold text-xs text-slate-700 dark:text-slate-200">{lastBackupTime}</span>
            </div>
          </div>

          {/* Diagnostic 3 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Cache Space Utilized</span>
              <span className="font-display font-bold text-slate-800 dark:text-slate-100">{storageSize}</span>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="mt-5 p-3.5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/40 rounded-xl text-xs text-blue-600 dark:text-blue-400 leading-relaxed flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Important Safety Notice:</strong> Since this application is completely client-side to facilitate free serverless hosting on <strong>GitHub Pages</strong>, all signature logs are preserved strictly in your browser's sandboxed local cache. Clearing your cookies or cache may delete the data, so we strongly recommend performing a <strong>Download Backup</strong> regularly to avoid losing your logs.
          </div>
        </div>
      </div>
    </div>
  );
}
