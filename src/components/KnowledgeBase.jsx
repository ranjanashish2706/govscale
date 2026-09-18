import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Flame, Gauge, Skull, Cog, Zap, AlertTriangle, ArrowRight, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { IOGP_LIFE_SAVING_RULES } from '../services/nlpEngine';
import FlowDiagram from './FlowDiagram';

export default function KnowledgeBase({ dataset = [], onSelectIncident, setActiveTab }) {
  const [selectedRule, setSelectedRule] = useState(null);

  const ruleMatches = selectedRule 
    ? dataset.filter(d => (d.mappedRules || []).some(r => r.rule === selectedRule.id) || (d.description || '').toLowerCase().includes(selectedRule.id.toLowerCase()))
    : [];

  return (
    <div className="space-y-8 animate-holo-boot">
      {/* Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="badge badge-cyan">HSE SAFETY SCIENCE & AI GOVERNANCE</span>
            <h2 className="text-lg font-extrabold text-white">IOGP Life-Saving Rules & Procurement Standards Guide</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-4xl">
            Serious Injury & Fatality (SIF) precursor detection relies on identifying High-Energy Exposure and Life-Saving Rule violations across oil & gas operations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">IOGP Report 459:</span>
          <span className="text-amber-400 font-bold">10 Core Rules</span>
        </div>
      </div>

      {/* Interactive System Flowchart Diagram */}
      <FlowDiagram />

      {/* Energy Wheel & Rules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> The 10 IOGP Life-Saving Rules
          </h3>
          <span className="text-xs text-slate-400">Click any rule card to view matching real-time incidents</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {IOGP_LIFE_SAVING_RULES.map((rule, idx) => {
            const count = dataset.filter(d => (d.mappedRules || []).some(r => r.rule === rule.id)).length;
            const isSelected = selectedRule?.id === rule.id;

            return (
              <div 
                key={rule.id} 
                onClick={() => setSelectedRule(isSelected ? null : rule)}
                className={`glass-panel p-5 border-t-4 shadow-xl cursor-pointer hover:-translate-y-1 transition-all ${
                  isSelected ? 'border-t-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-500/50' : 'border-t-cyan-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm text-white">{rule.id}</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 text-cyan-300 px-2.5 py-1 rounded-full border border-slate-800 font-bold">
                    {count} Incidents
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">NLP Trigger Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.keywords.slice(0, 8).map((kw, i) => (
                      <span key={i} className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded font-mono border border-slate-800">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rule Matches Drawer */}
      {selectedRule && (
        <div className="glass-panel p-6 border-cyan-500/50 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Incidents Mapped to "{selectedRule.id}"
              </h4>
              <span className="text-xs text-slate-400">{ruleMatches.length} matching logs in central dataset</span>
            </div>
            <button onClick={() => setSelectedRule(null)} className="text-xs text-slate-400 hover:text-white">
              Close Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ruleMatches.length > 0 ? (
              ruleMatches.map(item => (
                <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{item.id} • {item.facility}</span>
                    <span className="badge badge-sif text-[10px]">SIF-Potential</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">"{item.description}"</p>
                  <button 
                    onClick={() => onSelectIncident(item)}
                    className="btn-secondary text-[10px] py-1 px-2.5 mt-2"
                  >
                    Analyze in Live Engine <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No direct incident reports found for this specific rule in current dataset.</p>
            )}
          </div>
        </div>
      )}

      {/* SIH 2026 Problem Statement Alignment */}
      <div className="glass-panel p-6 border-amber-500/30 bg-gradient-to-br from-slate-950 to-amber-950/20 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400" /> SIH 2026 Innovation Procurement Platform Standards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">1. Multilingual Natural Language Processing</span>
            <p className="text-slate-300">Extracts unstructured field logs in English, Hindi, and Assamese from rig roughnecks and plant technicians.</p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">2. High-Energy Exposure Quantification</span>
            <p className="text-slate-300">Calculates quantitative SIF Risk Score (0-100%) based on IOGP Report 459 life-saving rule matrix.</p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">3. Automated Work-Stop PDF Directives</span>
            <p className="text-slate-300">Generates instant downloadable PDF safety directives for immediate field supervisor sign-off and audit control.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
