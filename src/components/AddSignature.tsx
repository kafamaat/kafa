import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, 
  Calendar, 
  FolderOpen, 
  User, 
  Mic, 
  MicOff, 
  Save, 
  RotateCcw, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SignatureRecord } from '../types';

interface AddSignatureProps {
  onAddSignature: (record: Omit<SignatureRecord, 'id' | 'createdAt'>) => void;
  onNavigate: (page: string) => void;
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export default function AddSignature({ onAddSignature, onNavigate, addToast }: AddSignatureProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    // Default to today
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [docType, setDocType] = useState('');
  const [person, setPerson] = useState('');
  const [responsible, setResponsible] = useState('');
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState<'km-KH' | 'en-US'>('km-KH');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Store addToast in a ref to prevent recreating recognitionInstance on renders
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

  useEffect(() => {
    // Check speech recognition support
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
        setTitle(prev => {
          const spacing = prev ? ' ' : '';
          return prev + spacing + resultText;
        });
        addToastRef.current('Voice captured successfully!', 'success');
      }
    };

    rec.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      setIsListening(false);
      
      // Ignore normal lifecycle speech recognition halts
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
        // Handle active or pending instances
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

  const handleReset = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setDocType('');
    setPerson('');
    setResponsible('');
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
    }
    addToast('Form has been reset.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('Please enter a signature title.', 'warning');
      return;
    }
    if (!date) {
      addToast('Please select a date.', 'warning');
      return;
    }
    if (!docType) {
      addToast('Please select a document type.', 'warning');
      return;
    }
    if (!person) {
      addToast('Please select a person responsible.', 'warning');
      return;
    }
    if (!responsible) {
      addToast('Please select a responsible status on signification.', 'warning');
      return;
    }

    onAddSignature({
      title: title.trim(),
      date,
      docType,
      person,
      responsible
    });

    addToast('Signature record saved successfully!', 'success');
    onNavigate('records');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
          Add New Signature
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record a new official signature log. All inputs are local and fully secure.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Signature Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Signature Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <div className="flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter document/signature title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-3 pr-28 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                
                {/* Voice button & Language Selector */}
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
              {!speechSupported && (
                <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Speech-to-text not supported in iframe/browser container.</span>
                </div>
              )}
            </div>

            {/* Date of Signature */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Date of Signature <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <div className="flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Document Type <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <div className="flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <select
                  required
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none"
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

            {/* Person Handling Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Person Handling the Document <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <div className="flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  required
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none"
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

            {/* Responsible on Signification */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Responsible on Signification <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <div className="flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <select
                  required
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none"
                >
                  <option value="" className="bg-white dark:bg-slate-800">Select signification status</option>
                  <option value="Requested" className="bg-white dark:bg-slate-800">Requested</option>
                  <option value="Checked" className="bg-white dark:bg-slate-800">Checked</option>
                  <option value="Verified" className="bg-white dark:bg-slate-800">Verified</option>
                  <option value="Approved" className="bg-white dark:bg-slate-800">Approved</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition"
              >
                <Save className="w-4 h-4" /> Save Signature Record
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" /> Reset Form
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto border border-rose-200 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-400 font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
