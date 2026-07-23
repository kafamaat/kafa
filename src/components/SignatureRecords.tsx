import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X,
  AlertTriangle,
  FolderOpen,
  Calendar,
  User,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Plus,
  Save,
  RotateCcw,
  Mic,
  MicOff,
  PenTool
} from 'lucide-react';
import { SignatureRecord } from '../types';
import * as XLSX from 'xlsx';

interface SignatureRecordsProps {
  records: SignatureRecord[];
  onUpdateRecord: (updated: SignatureRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddSignature: (record: Omit<SignatureRecord, 'id' | 'createdAt'>) => void;
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
  globalSearch: string;
  initialScrollToAdd?: boolean;
}

export default function SignatureRecords({ 
  records, 
  onUpdateRecord, 
  onDeleteRecord, 
  onAddSignature,
  addToast,
  globalSearch,
  initialScrollToAdd = false
}: SignatureRecordsProps) {
  // Filters & State
  const [localSearch, setLocalSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(initialScrollToAdd);
  
  // Quick Add State
  const [addTitle, setAddTitle] = useState('');
  const [addDate, setAddDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [addDocType, setAddDocType] = useState('');
  const [addPerson, setAddPerson] = useState('');
  const [addResponsible, setAddResponsible] = useState('');

  // Voice recognition states for Quick Add
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState<'km-KH' | 'en-US'>('km-KH');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const addToastRef = useRef(addToast);
  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  const speechLangRef = useRef(speechLang);
  useEffect(() => {
    speechLangRef.current = speechLang;
    if (recognitionInstance) {
      try {
        recognitionInstance.lang = speechLang;
      } catch (e) {
        // ignore
      }
    }
  }, [speechLang, recognitionInstance]);

  // Handle optional auto-scroll on mount
  useEffect(() => {
    if (initialScrollToAdd) {
      setTimeout(() => {
        const el = document.getElementById('quick-add-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          const input = el.querySelector('input');
          if (input) input.focus();
        }
      }, 300);
    }
  }, [initialScrollToAdd]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = speechLangRef.current;

    rec.onstart = () => {
      setIsListening(true);
      const currentLang = speechLangRef.current === 'km-KH' ? 'Khmer 🇰🇭 (km-KH)' : 'English 🇺🇸';
      addToastRef.current(`Listening for ${currentLang} voice input...`, 'info');
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText) {
        setAddTitle(prev => {
          const spacing = prev ? ' ' : '';
          return prev + spacing + resultText;
        });
        addToastRef.current('Voice captured successfully!', 'success');
      }
    };

    rec.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      setIsListening(false);
      
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }

      if (event.error === 'not-allowed') {
        addToastRef.current('Microphone access denied. Please grant permissions.', 'danger');
      } else {
        addToastRef.current(`Voice error: ${event.error}`, 'warning');
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    setRecognitionInstance(rec);

    return () => {
      if (rec) {
        try {
          rec.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!speechSupported) {
      addToast('Speech Recognition is not supported in this browser.', 'warning');
      return;
    }

    if (!recognitionInstance) return;

    if (isListening) {
      recognitionInstance.stop();
    } else {
      try {
        recognitionInstance.lang = speechLang;
        recognitionInstance.start();
      } catch (e) {
        recognitionInstance.abort();
        setTimeout(() => {
          try {
            recognitionInstance.lang = speechLang;
            recognitionInstance.start();
          } catch (err) {
            addToast('Could not start microphone.', 'danger');
          }
        }, 200);
      }
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addTitle.trim()) {
      addToast('Please enter a signature title.', 'warning');
      return;
    }
    if (!addDate) {
      addToast('Please select a date.', 'warning');
      return;
    }
    if (!addDocType) {
      addToast('Please select a document type.', 'warning');
      return;
    }
    if (!addPerson) {
      addToast('Please select a person responsible.', 'warning');
      return;
    }
    if (!addResponsible) {
      addToast('Please select a responsible status on signification.', 'warning');
      return;
    }

    const now = new Date();
    const autoTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddSignature({
      title: addTitle.trim(),
      date: addDate,
      time: autoTime,
      docType: addDocType,
      person: addPerson,
      responsible: addResponsible
    });

    addToast('Signature record saved successfully!', 'success');
    
    // Clear fields
    setAddTitle('');
    setAddDate(new Date().toISOString().split('T')[0]);
    setAddDocType('');
    setAddPerson('');
    setAddResponsible('');

    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }

    // Auto-hide the form after saving
    setShowAddForm(false);
  };

  const handleQuickReset = () => {
    setAddTitle('');
    setAddDate(new Date().toISOString().split('T')[0]);
    setAddDocType('');
    setAddPerson('');
    setAddResponsible('');
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }
    addToast('Quick Add form has been reset.', 'info');
  };
  
  // Selected rows
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [viewingRecord, setViewingRecord] = useState<SignatureRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<SignatureRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Edit fields state
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDocType, setEditDocType] = useState('');
  const [editPerson, setEditPerson] = useState('');
  const [editResponsible, setEditResponsible] = useState('');

  // Combined Search & Filtering
  const filteredRecords = useMemo(() => {
    const filtered = records.filter(rec => {
      // Free-text matches (either from the global search in header OR the local records search)
      const query = (localSearch || globalSearch).toLowerCase().trim();
      const matchesQuery = query === '' || 
        rec.title.toLowerCase().includes(query) ||
        rec.person.toLowerCase().includes(query) ||
        rec.docType.toLowerCase().includes(query);

      const matchesDocType = docTypeFilter === '' || rec.docType === docTypeFilter;
      const matchesPerson = personFilter === '' || rec.person === personFilter;
      const matchesResponsible = responsibleFilter === '' || rec.responsible === responsibleFilter;

      return matchesQuery && matchesDocType && matchesPerson && matchesResponsible;
    });

    // Sort by Date and Time descending (latest first)
    return [...filtered].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || '00:00'}`;
      const dateTimeB = `${b.date}T${b.time || '00:00'}`;
      if (dateTimeA !== dateTimeB) {
        return dateTimeB.localeCompare(dateTimeA);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [records, localSearch, globalSearch, docTypeFilter, personFilter, responsibleFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Handle page limits on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, globalSearch, docTypeFilter, personFilter, responsibleFilter]);

  // Selection handlers
  const handleSelectRow = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const currentPageIds = currentItems.map(item => item.id);
      setSelectedIds(prev => {
        const union = new Set([...prev, ...currentPageIds]);
        return Array.from(union);
      });
    } else {
      const currentPageIds = currentItems.map(item => item.id);
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  const isRowSelected = (id: string) => selectedIds.includes(id);
  const isAllCurrentSelected = currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item.id));

  // Edit action trigger
  const handleOpenEdit = (rec: SignatureRecord) => {
    setEditingRecord(rec);
    setEditTitle(rec.title);
    setEditDate(rec.date);
    setEditTime(rec.time || '');
    setEditDocType(rec.docType);
    setEditPerson(rec.person);
    setEditResponsible(rec.responsible || '');
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    if (!editTitle.trim() || !editDate || !editDocType || !editPerson) {
      addToast('Please fill in all required fields.', 'warning');
      return;
    }

    onUpdateRecord({
      ...editingRecord,
      title: editTitle.trim(),
      date: editDate,
      time: editTime || undefined,
      docType: editDocType,
      person: editPerson,
      responsible: editResponsible
    });

    addToast('Record updated successfully!', 'success');
    setEditingRecord(null);
  };

  // Delete action trigger
  const handleOpenDelete = (id: string) => {
    setDeletingRecordId(id);
  };

  const handleConfirmDelete = () => {
    if (!deletingRecordId) return;
    onDeleteRecord(deletingRecordId);
    setSelectedIds(prev => prev.filter(id => id !== deletingRecordId));
    addToast('Record deleted.', 'success');
    setDeletingRecordId(null);
  };

  // Export selected rows to Excel
  const handleExportSelected = () => {
    if (selectedIds.length === 0) {
      addToast('Please select at least one record to export.', 'warning');
      return;
    }

    const recordsToExport = records.filter(rec => selectedIds.includes(rec.id));
    
    // Format records for clean excel columns
    const formattedData = recordsToExport.map((rec, idx) => ({
      'No.': idx + 1,
      'Document Title': rec.title,
      'Date of Signature': rec.date,
      'Document Type': rec.docType,
      'Person Responsible': rec.person,
      'Responsible on Signification': rec.responsible || '',
      'Created Timestamp': new Date(rec.createdAt).toLocaleString(),
      'Signature Log ID': rec.id
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Signature Logs');
    
    // Download sheet
    XLSX.writeFile(wb, `Mr_Kafa_Signature_System_Selected_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast(`Exported ${recordsToExport.length} records to Excel!`, 'success');
  };

  // Badge colors helper
  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'Local Recruitment':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      case 'International Recruitment':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400';
      case 'Training & Development':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Compliance':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Compensation & Benefits (C&B)':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400';
      case 'Payroll':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400';
      case 'Central HR Document':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
          Signature Records
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View, edit, search, and perform batch exports of all official logged signatures.
        </p>
      </div>

      {/* Embedded Add New Signature Form (Previous Setup styling) */}
      {showAddForm && (
        <div id="quick-add-section" className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Add New Signature Record
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Record a new official signature log. All inputs are saved securely in your ledger.
              </p>
            </div>
            <span className="text-[10px] bg-blue-100/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shrink-0">
              New Ledger Row
            </span>
          </div>

          <form onSubmit={handleQuickAddSubmit} className="space-y-5 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Signature Title */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Signature Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                  <div className="flex items-center pl-3.5 pointer-events-none text-slate-400 shrink-0">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter document/signature title..."
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    className="w-full pl-3 pr-28 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  
                  {/* Voice recognition mic button & Language Selector */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSpeechLang(prev => prev === 'km-KH' ? 'en-US' : 'km-KH')}
                      title={`Current Voice Language: ${speechLang === 'km-KH' ? 'Khmer' : 'English'}. Click to switch.`}
                      className="text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-600"
                    >
                      {speechLang === 'km-KH' ? '🇰🇭 ខ្មែរ' : '🇺🇸 EN'}
                    </button>

                    <button
                      type="button"
                      onClick={toggleVoice}
                      title={isListening ? 'Stop listening' : `Start voice recognition in ${speechLang === 'km-KH' ? 'Khmer' : 'English'}`}
                      className={`p-2 rounded-lg cursor-pointer ${
                        isListening 
                          ? 'bg-rose-500 text-white animate-pulse' 
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
                      } transition`}
                    >
                      {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 px-1 text-xs text-rose-500 animate-pulse font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 block"></span>
                    <span>
                      Listening in {speechLang === 'km-KH' ? 'Khmer 🇰🇭 (ភាសាខ្មែរ)' : 'English 🇺🇸'}... Speak clearly.
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Date of Signature */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Date of Signature <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                  <div className="flex items-center pl-3.5 pointer-events-none text-slate-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 3. Document Type Select */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Document Type <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                  <div className="flex items-center pl-3.5 pointer-events-none text-slate-400 shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={addDocType}
                    onChange={(e) => setAddDocType(e.target.value)}
                    className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800">Select document type</option>
                    <option value="Local Recruitment" className="bg-white dark:bg-slate-800">Local Recruitment</option>
                    <option value="International Recruitment" className="bg-white dark:bg-slate-800">International Recruitment</option>
                    <option value="Training & Development" className="bg-white dark:bg-slate-800">Training & Development</option>
                    <option value="Compliance" className="bg-white dark:bg-slate-800">Compliance</option>
                    <option value="Compensation & Benefits (C&B)" className="bg-white dark:bg-slate-800">Compensation & Benefits (C&B)</option>
                    <option value="Payroll" className="bg-white dark:bg-slate-800">Payroll</option>
                    <option value="Central HR Document" className="bg-white dark:bg-slate-800">Central HR Document</option>
                    <option value="Other" className="bg-white dark:bg-slate-800">Other</option>
                  </select>
                </div>
              </div>

              {/* 4. Person Handling Select */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Person Handling the Document <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                  <div className="flex items-center pl-3.5 pointer-events-none text-slate-400 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={addPerson}
                    onChange={(e) => setAddPerson(e.target.value)}
                    className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800">Select person</option>
                    <option value="Chantha" className="bg-white dark:bg-slate-800">Chantha</option>
                    <option value="Samnang" className="bg-white dark:bg-slate-800">Samnang</option>
                    <option value="Rima" className="bg-white dark:bg-slate-800">Rima</option>
                    <option value="Sreynhanh" className="bg-white dark:bg-slate-800">Sreynhanh</option>
                    <option value="Buntheng" className="bg-white dark:bg-slate-800">Buntheng</option>
                    <option value="Other" className="bg-white dark:bg-slate-800">Other</option>
                  </select>
                </div>
              </div>

              {/* 5. Responsible on Signification */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Responsible on Signification <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                  <div className="flex items-center pl-3.5 pointer-events-none text-slate-400 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={addResponsible}
                    onChange={(e) => setAddResponsible(e.target.value)}
                    className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-800">Select signification status</option>
                    <option value="Requested" className="bg-white dark:bg-slate-800">Requested</option>
                    <option value="Checked" className="bg-white dark:bg-slate-800">Checked</option>
                    <option value="Verified" className="bg-white dark:bg-slate-800">Verified</option>
                    <option value="Approved" className="bg-white dark:bg-slate-800">Approved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleQuickReset}
                className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" /> Reset Form
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition"
              >
                <Save className="w-4 h-4" /> Save Signature Record
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search records..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Doc Type Dropdown */}
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Document Types</option>
              <option value="Local Recruitment">Local Recruitment</option>
              <option value="International Recruitment">International Recruitment</option>
              <option value="Training & Development">Training & Development</option>
              <option value="Compliance">Compliance</option>
              <option value="Compensation & Benefits (C&B)">Compensation & Benefits (C&B)</option>
              <option value="Payroll">Payroll</option>
              <option value="Central HR Document">Central HR Document</option>
              <option value="Other">Other</option>
            </select>

            {/* Person Dropdown */}
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Responsible Persons</option>
              <option value="Chantha">Chantha</option>
              <option value="Samnang">Samnang</option>
              <option value="Rima">Rima</option>
              <option value="Sreynhanh">Sreynhanh</option>
              <option value="Buntheng">Buntheng</option>
              <option value="Other">Other</option>
            </select>

            {/* Responsible on Signification Dropdown */}
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Signification Status</option>
              <option value="Requested">Requested</option>
              <option value="Checked">Checked</option>
              <option value="Verified">Verified</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSelected}
              disabled={selectedIds.length === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition ${
                selectedIds.length > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Selected ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => {
                setShowAddForm(prev => {
                  const nextVal = !prev;
                  if (nextVal) {
                    setTimeout(() => {
                      const el = document.getElementById('quick-add-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                        const input = el.querySelector('input');
                        if (input) input.focus();
                      }
                    }, 150);
                  }
                  return nextVal;
                });
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white dark:text-slate-950 rounded-xl font-semibold text-sm cursor-pointer transition shadow-md shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Hide Add Form' : 'Add New Signature'}</span>
            </button>
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse align-middle">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-16">No.</th>
                <th className="py-3 px-2">Signature Title</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Document Type</th>
                <th className="py-3 px-2">Person Responsible</th>
                <th className="py-3 px-2">Signification Status</th>
                <th className="py-3 px-2">Created Time</th>
                <th className="py-3 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No signature records match your active query.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSelected = isRowSelected(item.id);
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isCrossed = item.date < todayStr;
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition ${
                        isSelected 
                          ? 'bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/20' 
                          : isCrossed 
                            ? 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/60 dark:hover:bg-rose-950/15' 
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 font-mono text-xs font-semibold text-slate-400">
                        {absoluteIndex}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-100 max-w-64 truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col">
                          <span>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          {item.time && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {item.time}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight inline-block ${getDocTypeColor(item.docType)}`}>
                          {item.docType}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-300">
                        {item.person}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight inline-block ${
                          item.responsible === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          item.responsible === 'Verified' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                          item.responsible === 'Checked' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {item.responsible || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-xs text-slate-400 dark:text-slate-500">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            onClick={() => setViewingRecord(item)}
                            title="View Details"
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Record"
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleOpenDelete(item.id)}
                            title="Delete Record"
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden space-y-3 mt-4">
          {currentItems.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">No records found</p>
          ) : (
            currentItems.map((item, idx) => {
              const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
              const isSelected = isRowSelected(item.id);
              const todayStr = new Date().toISOString().split('T')[0];
              const isCrossed = item.date < todayStr;
              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 shadow-sm' 
                      : isCrossed
                        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <span className="font-mono text-[11px] font-bold text-slate-400">#{absoluteIndex}</span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-44">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => setViewingRecord(item)}
                        className="p-1 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-50"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-500 rounded hover:bg-slate-100"
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item.id)}
                        className="p-1 text-rose-500 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      {item.time && (
                        <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-0.5 ml-1">
                          <Clock className="w-3 h-3" /> {item.time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{item.person}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.responsible === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        item.responsible === 'Verified' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                        item.responsible === 'Checked' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>{item.responsible || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Logged: {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="pt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getDocTypeColor(item.docType)}`}>
                        {item.docType}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Showing {filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 font-semibold text-xs rounded-xl flex items-center justify-center transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                      : 'border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Modal: View Details */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" /> Signature Log Details
              </h3>
              <button 
                onClick={() => setViewingRecord(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Document Title</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{viewingRecord.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Date of Signature</span>
                  <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{viewingRecord.date}</span>
                    </div>
                    {viewingRecord.time && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{viewingRecord.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Person Handing</span>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="capitalize">{viewingRecord.person}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Document Type</span>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight inline-block ${getDocTypeColor(viewingRecord.docType)}`}>
                    {viewingRecord.docType}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Responsible on Signification</span>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <span>{viewingRecord.responsible || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Timestamp Registered</span>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{new Date(viewingRecord.createdAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' })}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>This log was digitally compiled and stored in secure browser cache.</span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                onClick={() => setViewingRecord(null)}
                className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Signature */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Edit Signature Log
              </h3>
              <button 
                onClick={() => setEditingRecord(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Signature Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date of Signature</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Time</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Document Type</label>
                <select
                  required
                  value={editDocType}
                  onChange={(e) => setEditDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Local Recruitment">Local Recruitment</option>
                  <option value="International Recruitment">International Recruitment</option>
                  <option value="Training & Development">Training & Development</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Compensation & Benefits (C&B)">Compensation & Benefits (C&B)</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Central HR Document">Central HR Document</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Person Responsible</label>
                <select
                  required
                  value={editPerson}
                  onChange={(e) => setEditPerson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Chantha">Chantha</option>
                  <option value="Samnang">Samnang</option>
                  <option value="Rima">Rima</option>
                  <option value="Sreynhanh">Sreynhanh</option>
                  <option value="Buntheng">Buntheng</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Responsible on Signification</label>
                <select
                  required
                  value={editResponsible}
                  onChange={(e) => setEditResponsible(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Requested">Requested</option>
                  <option value="Checked">Checked</option>
                  <option value="Verified">Verified</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingRecordId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
                <Trash2 className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Confirm Deletion</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Are you sure you want to delete this signature record? This operation cannot be undone.
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRecordId(null)}
                className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
