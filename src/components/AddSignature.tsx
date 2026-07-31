import React, { useState } from 'react';
import { 
  PenTool, 
  Calendar, 
  FolderOpen, 
  User, 
  Save, 
  RotateCcw, 
  X,
  CheckCircle,
  FileText
} from 'lucide-react';
import { SignatureRecord } from '../types';
import { SIGNATURE_TITLES } from '../utils/db';

interface AddSignatureProps {
  onAddSignature: (record: Omit<SignatureRecord, 'id' | 'createdAt'>) => void;
  onNavigate: (page: string) => void;
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export default function AddSignature({ onAddSignature, onNavigate, addToast }: AddSignatureProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [docType, setDocType] = useState('');
  const [person, setPerson] = useState('');
  const [responsible, setResponsible] = useState('');

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setDocType('');
    setPerson('');
    setResponsible('');
    addToast('Form has been reset.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      addToast('Please select a signature title.', 'warning');
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
      title,
      description: description.trim(),
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
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <div className="flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <select
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-3 pr-3.5 py-3 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none appearance-none"
                >
                  <option value="" className="bg-white dark:bg-slate-800">Select signature title</option>
                  {SIGNATURE_TITLES.map(t => (
                    <option key={t} value={t} className="bg-white dark:bg-slate-800">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" /> Description
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 overflow-hidden shadow-sm">
                <textarea
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                />
              </div>
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
