import React, { useState, useEffect } from 'react';
import { 
  Cpu, Mic, MicOff, AlertTriangle, ShieldCheck, 
  Flame, CheckCircle, FileText, Sparkles, RefreshCw, XCircle, Edit3, MessageSquare, PlusCircle, CheckCircle2, Bookmark, Sliders, X
} from 'lucide-react';
import { analyzeSafetyReport } from '../services/nlpEngine';
import { SAMPLE_INCIDENT_PRESETS } from '../services/mockData';

export default function LiveAnalyzer({ initialIncident, userRole = 'Executive HSE Director', onSaveToDataset, onUpdateIncident, onOpenDirective }) {
  const [inputText, setInputText] = useState(
    initialIncident ? initialIncident.description : SAMPLE_INCIDENT_PRESETS[0].text
  );
  const [facility, setFacility] = useState(
    initialIncident ? initialIncident.facility : 'Duliajan Drilling Rig #4'
  );
  const [reportType, setReportType] = useState(
    initialIncident ? initialIncident.reportType : 'Unsafe Act'
  );

  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [nlpOutput, setNlpOutput] = useState(null);
  
  // HSE Review State
  const [hseComment, setHseComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit fields state
  const [editFacility, setEditFacility] = useState(facility);
  const [editSifPotential, setEditSifPotential] = useState(true);
  const [editLsrRule, setEditLsrRule] = useState('Working at Height');

  // Re-run NLP engine whenever text changes
  useEffect(() => {
    const result = analyzeSafetyReport(inputText);
    setNlpOutput(result);
    if (result) {
      setEditSifPotential(result.isSifPotential);
      setEditLsrRule(result.mappedRules.length > 0 ? result.mappedRules[0].rule : 'Working at Height');
    }
  }, [inputText]);

  useEffect(() => {
    if (initialIncident) {
      setInputText(initialIncident.description);
      setFacility(initialIncident.facility);
      setReportType(initialIncident.reportType);
    }
  }, [initialIncident]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectPreset = (preset) => {
    setInputText(preset.text);
    setFacility(preset.location);
    setReportType(preset.category);
    showToast(`Loaded Preset: ${preset.title}`);
  };

  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (!isRecording) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = selectedLanguage === 'Hindi' ? 'hi-IN' : selectedLanguage === 'Assamese' ? 'as-IN' : 'en-US';

          recognition.onstart = () => setIsRecording(true);
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
            setIsRecording(false);
            showToast('Voice dictation processed successfully!');
          };
          recognition.onerror = () => simulateVoiceInput();
          recognition.onend = () => setIsRecording(false);
          recognition.start();
        } catch (e) { simulateVoiceInput(); }
      } else { setIsRecording(false); }
    } else { simulateVoiceInput(); }
  };

  const simulateVoiceInput = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setInputText('Duliajan Rig #4 derrickmanLatch operation at height ~25m without safety harness. High wind hazard.');
        setIsRecording(false);
        showToast('Simulated Real-Time Voice Input Received!');
      }, 2000);
    } else { setIsRecording(false); }
  };

  const handleHSEReview = (status) => {
    if (!nlpOutput) return;
    const updatedRecord = {
      ...(initialIncident || {}),
      id: initialIncident ? initialIncident.id : `LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      facility,
      reportType,
      description: inputText,
      reviewStatus: status,
      hseComment,
      ...nlpOutput
    };

    if (initialIncident && onUpdateIncident) {
      onUpdateIncident(updatedRecord);
    } else if (onSaveToDataset) {
      onSaveToDataset(updatedRecord);
    }
    showToast(`Report marked as ${status} and saved to central database!`);
    setShowReviewModal(false);
    setHseComment('');
  };

  const handleSaveEditedFields = () => {
    if (!nlpOutput) return;
    const updatedNlp = {
      ...nlpOutput,
      facility: editFacility,
      isSifPotential: editSifPotential,
      isSifPrecursor: editSifPotential,
      mappedRules: [{ rule: editLsrRule, confidence: 95, evidence: ['Manual Officer Override'] }],
      reviewStatus: 'EDITED'
    };
    setNlpOutput(updatedNlp);

    const updatedRecord = {
      ...(initialIncident || {}),
      id: initialIncident ? initialIncident.id : `EDITED-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      facility: editFacility,
      reportType,
      description: inputText,
      ...updatedNlp
    };

    if (onUpdateIncident) onUpdateIncident(updatedRecord);
    setShowEditModal(false);
    showToast('Manual field overrides saved successfully!');
  };

  const handleSaveNewReport = () => {
    if (!nlpOutput) return;
    const newRecord = {
      id: `OIL-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      facility,
      reportType,
      description: inputText,
      ...nlpOutput
    };
    if (onSaveToDataset) {
      onSaveToDataset(newRecord);
      showToast(`Saved new report (${newRecord.id}) to dataset!`);
    }
  };

  return (
    <div className="space-y-8 animate-holo-boot relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-cyan-950 border border-cyan-400 text-cyan-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce font-extrabold text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="badge badge-cyan font-mono">IOGP-NLP v2.4 ENGINE</span>
            <h2 className="text-lg font-extrabold text-white">Live Incident SIF Intelligence Analyzer</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Real-time SIF classification, IOGP Life-Saving Rule mapping, and explainable AI risk scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSaveNewReport} className="btn-primary text-xs py-2 px-3.5">
            <PlusCircle className="w-4 h-4" /> Save to Central Dataset
          </button>
          {nlpOutput && nlpOutput.isSifPotential && (
            <button onClick={() => onOpenDirective(initialIncident || { description: inputText, facility, reportType, ...nlpOutput })} className="btn-danger text-xs py-2 px-3.5">
              <FileText className="w-4 h-4" /> Directive PDF
            </button>
          )}
        </div>
      </div>

      {/* Preset Selector Strip */}
      <div className="glass-panel p-4 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Quick Load Real OIL Incident Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_INCIDENT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/80 font-medium transition-all"
            >
              ⚡ {preset.title.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form & AI Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel p-6 space-y-5">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Safety Incident Log Entry
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-300 block font-bold uppercase tracking-wider mb-1">Facility / Rig</label>
                <select value={facility} onChange={(e) => setFacility(e.target.value)} className="w-full text-xs font-bold bg-[#0b1329] text-white border border-white/20 rounded-xl p-2.5">
                  <option value="Duliajan Drilling Rig #4">Duliajan Drilling Rig #4</option>
                  <option value="Digboi Refinery Unit 3">Digboi Refinery Unit 3</option>
                  <option value="Moran Gas Field">Moran Gas Field</option>
                  <option value="Nahorkatia Tank Farm">Nahorkatia Tank Farm</option>
                  <option value="Guwahati Pipeline Station 5">Guwahati Pipeline Station 5</option>
                  <option value="Jorhat Oil Field">Jorhat Oil Field</option>
                  <option value="Makum Production Hub">Makum Production Hub</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block font-bold uppercase tracking-wider mb-1">Category</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full text-xs font-bold bg-[#0b1329] text-white border border-white/20 rounded-xl p-2.5">
                  <option value="Unsafe Act">Unsafe Act (UA)</option>
                  <option value="Unsafe Condition">Unsafe Condition (UC)</option>
                  <option value="Near-Miss">Near-Miss (NM)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-300 block font-bold uppercase tracking-wider">Unstructured Log Text</label>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-[10px] text-cyan-300 font-bold border-none p-0 cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Assamese">Assamese</option>
                </select>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={7}
                placeholder="Type or paste unstructured safety report text in English, Hindi, or Assamese..."
                className="w-full font-mono text-xs text-white bg-[#0b1329] placeholder-slate-400 border border-white/20 rounded-xl p-3.5 focus:border-cyan-400"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleVoiceRecording} 
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isRecording ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/40' : 'bg-slate-900 text-cyan-400 border border-slate-700 hover:border-cyan-400'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? 'Recording Speech...' : `Voice Dictation (${selectedLanguage})`}
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Output Display */}
        <div className="lg:col-span-7 space-y-5">
          {nlpOutput ? (
            <div className="glass-panel p-6 space-y-6">
              
              {/* SIF Assessment Banner */}
              <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${nlpOutput.isSifPotential ? 'bg-red-950/40 border-red-500/60 glow-sif' : 'bg-emerald-950/40 border-emerald-500/50'}`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SIF Assessment Result</span>
                  <div className="text-2xl font-extrabold flex items-center gap-3 mt-1">
                    {nlpOutput.isSifPotential ? (
                      <><AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" /><span className="text-red-400">SIF-Potential</span></>
                    ) : (
                      <><ShieldCheck className="w-8 h-8 text-emerald-400" /><span className="text-emerald-400">Non-SIF-Potential</span></>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">AI Confidence Score</div>
                  <div className="text-3xl font-mono font-bold text-white">{nlpOutput.confidenceScore}%</div>
                </div>
              </div>

              {/* Life-Saving Rule & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Life-Saving Rule Mapping</h4>
                  {nlpOutput.mappedRules && nlpOutput.mappedRules.length > 0 ? (
                    <div>
                      <div className="text-sm font-bold text-amber-400 mb-1">{nlpOutput.mappedRules[0].rule}</div>
                      <div className="text-[10px] text-slate-300">Confidence: {nlpOutput.mappedRules[0].confidence}%</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">Matched: {nlpOutput.mappedRules[0].evidence.join(', ')}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">General Operational Safety</div>
                  )}
                </div>
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action Priority Index</h4>
                  <div className="text-3xl font-extrabold text-cyan-400 font-mono">{nlpOutput.priorityScore}</div>
                  <span className="text-[10px] text-slate-400">Out of 100</span>
                </div>
              </div>

              {/* Structured Precursor Extraction */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Extracted Precursors & Entities</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(nlpOutput.extractedPrecursors).map(([k, v]) => (
                    <div key={k} className="flex bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="w-1/3 text-slate-400 font-bold capitalize text-[10px]">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="w-2/3 font-semibold text-slate-100">{Array.isArray(v) ? v.join(', ') : v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable AI */}
              <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5"/> Explainable AI Reasoning (Why Flagged?)
                </h4>
                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {nlpOutput.explanation}
                </div>
              </div>

              {/* HSE Review Workflow Controls */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HSE Officer Review & Human-in-the-Loop</h4>
                  <span className="text-[10px] font-mono text-cyan-300">Status: {nlpOutput.reviewStatus || 'PENDING_REVIEW'}</span>
                </div>

                {showReviewModal ? (
                  <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <textarea 
                      value={hseComment} 
                      onChange={(e) => setHseComment(e.target.value)}
                      placeholder="Add official HSE Lead comments or rationale..." 
                      className="w-full bg-[#0b1329] text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:border-cyan-400"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleHSEReview('ACCEPTED')} className="btn-secondary !py-1.5 !px-3 !text-[11px] !bg-emerald-900/40 !border-emerald-500/50 text-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/> Accept & Sign Off
                      </button>
                      <button onClick={() => handleHSEReview('REJECTED')} className="btn-secondary !py-1.5 !px-3 !text-[11px] !bg-red-900/40 !border-red-500/50 text-red-300">
                        <XCircle className="w-3.5 h-3.5 text-red-400"/> Reject Output
                      </button>
                      <button onClick={() => setShowReviewModal(false)} className="ml-auto text-[10px] text-slate-400 hover:text-white">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShowReviewModal(true)} className="btn-secondary !py-2 !px-4 !text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/> Validate / Approve AI Output
                    </button>
                    <button onClick={() => setShowEditModal(true)} className="btn-secondary !py-2 !px-4 !text-[11px]">
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400"/> Edit Extracted Fields
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">Loading AI Engine...</div>
          )}
        </div>
      </div>

      {/* Edit Fields Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 space-y-4 border-cyan-500/50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Manual Field Overrides
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Facility Name</label>
                <input 
                  type="text" 
                  value={editFacility} 
                  onChange={(e) => setEditFacility(e.target.value)} 
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">SIF Potential Status</label>
                <select 
                  value={editSifPotential ? 'YES' : 'NO'} 
                  onChange={(e) => setEditSifPotential(e.target.value === 'YES')}
                  className="w-full text-xs"
                >
                  <option value="YES">SIF-Potential (High Risk)</option>
                  <option value="NO">Non-SIF (Standard Observation)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Primary Life-Saving Rule</label>
                <select 
                  value={editLsrRule} 
                  onChange={(e) => setEditLsrRule(e.target.value)}
                  className="w-full text-xs"
                >
                  <option value="Working at Height">Working at Height</option>
                  <option value="Energy Isolation">Energy Isolation (LOTO)</option>
                  <option value="Confined Space">Confined Space Entry</option>
                  <option value="Hot Work">Hot Work / Spark</option>
                  <option value="Lifting Operations">Lifting Operations</option>
                  <option value="Line of Fire">Line of Fire</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
              <button onClick={handleSaveEditedFields} className="btn-primary text-xs py-1.5 px-3">Save Overrides</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
