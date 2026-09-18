import React, { useState } from 'react';
import { 
  Layers, Download, Upload, Search, Filter, AlertTriangle, 
  CheckCircle2, FileSpreadsheet, ChevronRight, FileText, CheckCircle, Clock, XCircle, RotateCcw
} from 'lucide-react';
import { analyzeSafetyReport } from '../services/nlpEngine';

export default function BatchAnalyzer({ dataset = [], setDataset, userRole = 'Executive HSE Director', onUpdateIncident, onSelectIncident, onOpenDirective }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const facilities = Array.from(new Set(dataset.map(d => d.facility)));

  const filteredDataset = dataset.filter(item => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.facility.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'SIF_ONLY' ? (item.isSifPotential || item.isSifPrecursor) :
      !(item.isSifPotential || item.isSifPrecursor);

    const matchesFacility = 
      facilityFilter === 'ALL' ? true : item.facility === facilityFilter;

    const matchesReview = 
      reviewFilter === 'ALL' ? true : item.reviewStatus === reviewFilter;

    const matchesDate = (() => {
      if (dateFilter === 'ALL') return true;
      const d = new Date(item.date);
      const now = new Date();
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (dateFilter === 'LAST_7_DAYS') return diffDays <= 7;
      if (dateFilter === 'LAST_30_DAYS') return diffDays <= 30;
      if (dateFilter === 'THIS_YEAR') return d.getFullYear() === now.getFullYear();
      return true;
    })();

    return matchesSearch && matchesStatus && matchesFacility && matchesReview && matchesDate;
  });

  const handleInlineReview = (item, status) => {
    const updated = { ...item, reviewStatus: status };
    if (onUpdateIncident) {
      onUpdateIncident(updated);
    } else {
      setDataset(prev => prev.map(d => d.id === item.id ? updated : d));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) return;

      const newItems = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 2) {
          const desc = columns.slice(3).join(',').replace(/^"|"$/g, '') || columns[0];
          const nlpRes = analyzeSafetyReport(desc);
          newItems.push({
            id: `CSV-${1000 + i}`,
            date: new Date().toISOString().split('T')[0],
            facility: columns[1] ? columns[1].trim() : 'Uploaded Site',
            reporterRole: 'Bulk Upload User',
            reportType: columns[2] ? columns[2].trim() : 'Unsafe Act',
            description: desc,
            ...nlpRes
          });
        }
      }

      setDataset(prev => [...newItems, ...prev]);
      alert(`Successfully processed & appended ${newItems.length} safety reports from CSV!`);
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Facility', 'Activity', 'SIF_Status', 'Confidence', 'Life_Saving_Rule', 'Barrier_Failure', 'Priority', 'Review_Status'];
    const rows = filteredDataset.map(item => [
      item.id,
      item.date,
      `"${item.facility}"`,
      item.reportType,
      (item.isSifPotential || item.isSifPrecursor) ? 'SIF-Potential' : 'Non-SIF',
      `${item.confidenceScore || item.sifProbability || 85}%`,
      `"${item.mappedRules?.length > 0 ? item.mappedRules[0].rule : item.rootCause || 'N/A'}"`,
      `"${item.extractedPrecursors?.barrierFailures?.join(', ') || 'N/A'}"`,
      item.priorityScore || 80,
      item.reviewStatus || 'PENDING_REVIEW'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OIL_SIF_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setFacilityFilter('ALL');
    setReviewFilter('ALL');
    setDateFilter('ALL');
  };

  return (
    <div className="space-y-6 animate-holo-boot">
      {/* Top Action Bar */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-cyan font-mono">SIF INGESTION PIPELINE</span>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> HSE Safety Data Table & Ingestion Hub
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Structured SIF-Potential dataset with IOGP rule tagging, inline review status, and CSV bulk import.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="btn-secondary text-xs cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" /> Upload CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={exportToCSV} className="btn-primary text-xs">
            <Download className="w-4 h-4" /> Export CSV ({filteredDataset.length})
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search ID, site, text..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 text-xs" 
            />
          </div>
          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full text-xs">
              <option value="ALL">All Risk Statuses</option>
              <option value="SIF_ONLY">SIF-Potential Only</option>
              <option value="NON_SIF">Non-SIF Only</option>
            </select>
          </div>
          <div>
            <select value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)} className="w-full text-xs">
              <option value="ALL">All Operational Sites</option>
              {facilities.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <select value={reviewFilter} onChange={(e) => setReviewFilter(e.target.value)} className="w-full text-xs">
              <option value="ALL">All Review Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="ACCEPTED">Approved / Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="EDITED">Manually Edited</option>
            </select>
          </div>
          <div>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full text-xs">
              <option value="ALL">All Time</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_YEAR">This Year</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Chips:</span>
          <button onClick={() => setStatusFilter('SIF_ONLY')} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter==='SIF_ONLY' ? 'bg-red-500 text-white' : 'bg-slate-900 text-red-300 border border-slate-700'}`}>
            🔴 SIF-Potential ({dataset.filter(d => d.isSifPotential || d.isSifPrecursor).length})
          </button>
          <button onClick={() => setReviewFilter('PENDING_REVIEW')} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${reviewFilter==='PENDING_REVIEW' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-amber-300 border border-slate-700'}`}>
            ⏳ Pending Review
          </button>
          <button onClick={() => setFacilityFilter('Duliajan Drilling Rig #4')} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${facilityFilter==='Duliajan Drilling Rig #4' ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-cyan-300 border border-slate-700'}`}>
            📍 Duliajan Rig #4
          </button>
          <button onClick={resetFilters} className="ml-auto text-[10px] text-slate-400 hover:text-white flex items-center gap-1">
            <RotateCcw className="w-3 h-3"/> Reset Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <th className="p-3.5">ID & Date</th>
                <th className="p-3.5">Site / Facility</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">SIF Assessment</th>
                <th className="p-3.5">Life-Saving Rule</th>
                <th className="p-3.5">Barrier Failures</th>
                <th className="p-3.5 text-center">Score</th>
                <th className="p-3.5">Review Sign-Off</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDataset.length > 0 ? (
                filteredDataset.map((item) => {
                  const isSif = item.isSifPotential || item.isSifPrecursor;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-800/40 transition-all ${isSif ? 'bg-red-950/10' : ''}`}>
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-white">{item.id}</div>
                        <div className="text-[10px] text-slate-400">{item.date}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200">{item.facility}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
                          {item.reportType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {isSif ? (
                          <div className="flex items-center gap-1.5 font-bold text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> SIF-Potential ({item.confidenceScore || item.sifProbability || 85}%)
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Non-SIF
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">
                        {item.mappedRules?.length > 0 ? item.mappedRules[0].rule : item.rootCause || '-'}
                      </td>
                      <td className="p-3.5 text-slate-300 text-[11px]">
                        {item.extractedPrecursors?.barrierFailures?.join(', ') || item.missingControls?.join(', ') || '-'}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-cyan-400">
                        {item.priorityScore || 80}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {item.reviewStatus === 'ACCEPTED' ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold"><CheckCircle className="w-3.5 h-3.5"/> Approved</span>
                          ) : item.reviewStatus === 'REJECTED' ? (
                            <span className="text-red-400 flex items-center gap-1 text-[11px] font-bold"><XCircle className="w-3.5 h-3.5"/> Rejected</span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1 text-[11px] font-bold"><Clock className="w-3.5 h-3.5"/> Pending</span>
                          )}

                          {/* Quick Inline Review Buttons */}
                          <button 
                            onClick={() => handleInlineReview(item, 'ACCEPTED')} 
                            title="Approve Report"
                            className="p-1 hover:bg-emerald-900/50 rounded text-slate-400 hover:text-emerald-400"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleInlineReview(item, 'REJECTED')} 
                            title="Reject Report"
                            className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => onSelectIncident(item)} className="btn-secondary text-[10px] py-1 px-2.5">
                            Analyze
                          </button>
                          {isSif && (
                            <button onClick={() => onOpenDirective(item)} className="btn-danger text-[10px] py-1 px-2.5">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 space-y-2">
                    <p className="font-bold text-slate-300">No safety records matched the specified filters.</p>
                    <button onClick={resetFilters} className="btn-secondary text-xs py-1 px-3">Clear Filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Displaying {filteredDataset.length} of {dataset.length} total entries</span>
          <span className="font-mono text-cyan-400">{dataset.filter(d => d.isSifPotential || d.isSifPrecursor).length} SIF-Potential Total</span>
        </div>
      </div>
    </div>
  );
}
