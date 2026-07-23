import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  FolderOpen, 
  User, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  AlertCircle,
  X,
  Download,
  Eye
} from 'lucide-react';
import { SignatureRecord } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsProps {
  records: SignatureRecord[];
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export default function Reports({ records, addToast }: ReportsProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [docType, setDocType] = useState('');
  const [person, setPerson] = useState('');
  const [responsible, setResponsible] = useState('');
  
  // Results shown after clicking "Generate"
  const [reportResults, setReportResults] = useState<SignatureRecord[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // PDF Preview State
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Generate handler
  const handleGenerateReport = () => {
    const filtered = records.filter(rec => {
      // Date constraints
      if (dateFrom && rec.date < dateFrom) return false;
      if (dateTo && rec.date > dateTo) return false;
      
      // Category constraints
      if (docType && rec.docType !== docType) return false;
      if (person && rec.person !== person) return false;
      if (responsible && rec.responsible !== responsible) return false;

      return true;
    });

    // Sort by date and time descending (latest first)
    filtered.sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || '00:00'}`;
      const dateTimeB = `${b.date}T${b.time || '00:00'}`;
      if (dateTimeA !== dateTimeB) {
        return dateTimeB.localeCompare(dateTimeA);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setReportResults(filtered);
    setHasGenerated(true);
    addToast(`Generated report with ${filtered.length} matching logs.`, 'success');
  };

  // Export PDF using jsPDF + AutoTable
  const handleExportPDF = () => {
    if (reportResults.length === 0) {
      addToast('No records to export. Please generate a report first.', 'warning');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // PDF Headers & Styling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Blue-600
      doc.text('MR. KAFA SIGNATURE SYSTEM', 14, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105); // Slate-600
      doc.text('Official Document Signature Report', 14, 27);
      
      // Report Metadata Box
      doc.setFillColor(248, 250, 252); // Slate-50 background
      doc.rect(14, 33, 182, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59); // Slate-800
      
      const dateRangeStr = `Date Range: ${dateFrom || 'All Time'} to ${dateTo || 'All Time'}`;
      const docTypeStr = `Doc Type: ${docType || 'All Types'}`;
      const personStr = `Responsible: ${person || 'All Persons'}`;
      const sigStr = `Signification: ${responsible || 'All Status'}`;
      const countStr = `Total Records: ${reportResults.length}`;

      doc.text(dateRangeStr, 18, 40);
      doc.text(docTypeStr, 18, 45);
      doc.text(personStr, 18, 50);
      doc.text(sigStr, 110, 40);
      doc.text(countStr, 110, 45);

      // Current Date Stamp
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 57);

      // Table mapping
      const tableHeaders = [['No.', 'Signature Title', 'Signature Date', 'Document Type', 'Responsible Person', 'Signification Status']];
      const tableRows = reportResults.map((rec, index) => [
        index + 1,
        rec.title,
        rec.date,
        rec.docType,
        rec.person,
        rec.responsible || 'N/A'
      ]);

      // Draw table
      autoTable(doc, {
        startY: 58,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 60 },
          2: { cellWidth: 22 },
          3: { cellWidth: 38 },
          4: { cellWidth: 28 },
          5: { cellWidth: 24 }
        },
        margin: { left: 14, right: 14 }
      });

      // Generate PDF Blob URL for Preview
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setPdfFileName(`Mr_Kafa_Signature_System_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      setPdfDoc(doc);
      setShowPreviewModal(true);
      addToast('PDF report generated! Please review the preview before downloading.', 'info');
    } catch (error) {
      console.error(error);
      addToast('Failed to generate PDF. Please try again.', 'danger');
    }
  };

  // Export Excel using XLSX
  const handleExportExcel = () => {
    if (reportResults.length === 0) {
      addToast('No records to export. Please generate a report first.', 'warning');
      return;
    }

    const formatted = reportResults.map((rec, idx) => ({
      'No.': idx + 1,
      'Signature Title': rec.title,
      'Date of Signature': rec.date,
      'Document Type': rec.docType,
      'Responsible Person': rec.person,
      'Signification Status': rec.responsible || 'N/A',
      'Timestamp Logged': new Date(rec.createdAt).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report Results');
    XLSX.writeFile(wb, `Mr_Kafa_Signature_System_Report_Excel_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast('Excel report downloaded successfully!', 'success');
  };

  // Print Window Trigger
  const handlePrint = () => {
    if (reportResults.length === 0) {
      addToast('No records to print. Please generate a report first.', 'warning');
      return;
    }
    window.print();
  };

  // Document Type badges styling helper
  const getDocTypeBadge = (type: string) => {
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
      <div className="no-print">
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
          Generate Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Apply dynamic date ranges and category parameters to compile official printable logs.
        </p>
      </div>

      {/* Filter Options Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Document Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" /> Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
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
          </div>

          {/* Responsible Person */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Responsible Person
            </label>
            <select
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
            >
              <option value="">All Persons</option>
              <option value="Chantha">Chantha</option>
              <option value="Samnang">Samnang</option>
              <option value="Rima">Rima</option>
              <option value="Sreynhanh">Sreynhanh</option>
              <option value="Buntheng">Buntheng</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Responsible on Signification */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Signification Status
            </label>
            <select
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Requested">Requested</option>
              <option value="Checked">Checked</option>
              <option value="Verified">Verified</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/15 transition"
          >
            <Filter className="w-4 h-4" /> Generate Report
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={reportResults.length === 0}
            className={`font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition ${
              reportResults.length > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/10'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            disabled={reportResults.length === 0}
            className={`font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition ${
              reportResults.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10'
                : 'bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>

          <button
            onClick={handlePrint}
            disabled={reportResults.length === 0}
            className={`border font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition ${
              reportResults.length > 0
                ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300'
                : 'border-transparent bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" /> Print Results
          </button>
        </div>
      </div>

      {/* Printable Report Header Structure */}
      <div className="hidden print-only py-8 border-b border-slate-300">
        <h1 className="text-3xl font-bold text-center text-slate-900 tracking-tight">MR. KAFA SIGNATURE SYSTEM REPORT</h1>
        <p className="text-center text-slate-500 text-sm mt-1">Official Compiled Signature Operations Ledger</p>
        
        <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <p><strong>Date Range:</strong> {dateFrom || 'All'} to {dateTo || 'All'}</p>
            <p><strong>Category filter:</strong> {docType || 'All Types'}</p>
          </div>
          <div className="text-right">
            <p><strong>Responsible Officer:</strong> {person || 'All Officers'}</p>
            <p><strong>Signification Status:</strong> {responsible || 'All Status'}</p>
            <p><strong>Total Logs:</strong> {reportResults.length} records</p>
            <p className="text-slate-400 mt-1">Staged on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Generated Results Area */}
      <div className="glass-panel rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
          <h5 className="font-display font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
            Report Compilation Results
          </h5>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            {reportResults.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse align-middle">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3.5 px-5 w-16">No.</th>
                <th className="py-3.5 px-2">Signature Title</th>
                <th className="py-3.5 px-2">Signature Date</th>
                <th className="py-3.5 px-2">Document Type</th>
                <th className="py-3.5 px-2">Person Responsible</th>
                <th className="py-3.5 px-5 text-right w-44">Signification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
              {!hasGenerated ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2 no-print">
                      <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="font-medium text-xs">Set parameters above and click "Generate Report".</p>
                    </div>
                    {/* For print only, show placeholder if empty */}
                    <div className="hidden print-only text-xs">No filters were applied before printing.</div>
                  </td>
                </tr>
              ) : reportResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                    <div className="max-w-xs mx-auto space-y-1.5">
                      <AlertCircle className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-xs">No records matched your specific parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reportResults.map((item, idx) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isCrossed = item.date < todayStr;
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition ${
                        isCrossed 
                          ? 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/60 dark:hover:bg-rose-950/15' 
                          : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/10'
                      }`}
                    >
                      <td className="py-3 px-5 font-mono text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                        {item.date}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight inline-block ${getDocTypeBadge(item.docType)}`}>
                          {item.docType}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {item.person}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight inline-block ${
                          item.responsible === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          item.responsible === 'Verified' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                          item.responsible === 'Checked' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                          'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {item.responsible || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Export Preview Modal */}
      {showPreviewModal && pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950/40">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Export PDF Report Preview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review your compiled report details before downloading the PDF file.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowPreviewModal(false);
                  setPdfPreviewUrl(null);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col min-h-0">
              {/* Metadata Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300 shadow-sm shrink-0">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px] block mb-0.5">File Name</span>
                  <span className="text-slate-800 dark:text-white font-medium break-all">{pdfFileName}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px] block mb-0.5">Date Range</span>
                  <span className="text-slate-800 dark:text-white font-medium">{dateFrom || 'All Time'} to {dateTo || 'All Time'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px] block mb-0.5">Category Filter</span>
                  <span className="text-slate-800 dark:text-white font-medium">{docType || 'All Types'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide text-[10px] block mb-0.5">Total Logs</span>
                  <span className="text-slate-800 dark:text-white font-medium">{reportResults.length} records</span>
                </div>
              </div>

              {/* PDF Live View Frame */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex-1 flex flex-col relative min-h-0">
                <iframe 
                  src={`${pdfPreviewUrl}#toolbar=1&navpanes=0&statusbar=0`} 
                  className="w-full h-full border-none flex-1 min-h-[300px]"
                  title="PDF Report Preview"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPdfPreviewUrl(null);
                }}
                className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm px-5 py-2.5 rounded-xl cursor-pointer transition text-center"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (pdfDoc) {
                    pdfDoc.save(pdfFileName);
                    addToast('PDF report downloaded successfully!', 'success');
                  }
                  setShowPreviewModal(false);
                  setPdfPreviewUrl(null);
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition"
              >
                <Download className="w-4 h-4" /> Download PDF File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
