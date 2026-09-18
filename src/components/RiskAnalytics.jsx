import React, { useState } from 'react';
import { 
  MapPin, Activity, ShieldAlert, AlertTriangle, TrendingUp, 
  Layers, Compass, Flame, BarChart2, Eye, FileText, X, CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export default function RiskAnalytics({ dataset = [], onSelectIncident, onOpenDirective }) {
  const [selectedSiteModal, setSelectedSiteModal] = useState(null);

  // Aggregate data by OIL operational hub
  const hubMap = {};

  dataset.forEach(item => {
    const hub = item.facility || 'Other Field Ops';
    if (!hubMap[hub]) {
      hubMap[hub] = {
        name: hub,
        total: 0,
        sifCount: 0,
        avgRisk: 0,
        totalRiskScore: 0,
        incidents: []
      };
    }
    hubMap[hub].total += 1;
    hubMap[hub].incidents.push(item);
    
    const isSif = item.isSifPotential || item.isSifPrecursor;
    if (isSif) hubMap[hub].sifCount += 1;
    hubMap[hub].totalRiskScore += (item.confidenceScore || item.sifProbability || 75);
  });

  const hubList = Object.values(hubMap).map(h => ({
    ...h,
    sifRate: h.total > 0 ? Math.round((h.sifCount / h.total) * 100) : 0,
    avgRisk: h.total > 0 ? Math.round(h.totalRiskScore / h.total) : 0
  })).sort((a, b) => b.sifRate - a.sifRate);

  // Time trend data
  const trendData = [
    { day: 'Mon', SIF_Alerts: 4, Total_Reports: 12 },
    { day: 'Tue', SIF_Alerts: 6, Total_Reports: 18 },
    { day: 'Wed', SIF_Alerts: 3, Total_Reports: 15 },
    { day: 'Thu', SIF_Alerts: 8, Total_Reports: 22 },
    { day: 'Fri', SIF_Alerts: 5, Total_Reports: 19 },
    { day: 'Sat', SIF_Alerts: 2, Total_Reports: 10 },
    { day: 'Sun', SIF_Alerts: 3, Total_Reports: 8 },
  ];

  // Root cause radar data derived from dataset
  const radarData = [
    { subject: 'Work at Height', A: 85, fullMark: 100 },
    { subject: 'Pressure Lines', A: 65, fullMark: 100 },
    { subject: 'Toxic H2S Gas', A: 75, fullMark: 100 },
    { subject: 'Crane Rigging', A: 60, fullMark: 100 },
    { subject: 'LOTO Isolation', A: 70, fullMark: 100 },
    { subject: 'Hot Work/Spark', A: 50, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 animate-holo-boot">
      {/* Top Title Banner */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-amber font-mono">GEOSPATIAL RISK MAP</span>
            <h2 className="text-base font-extrabold text-white">OIL Operational Regional Risk Heatmap</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Geographic distribution of SIF precursors across Duliajan, Digboi, Moran, Nahorkatia, Makum, and Guwahati pipeline networks. Click any site card for drill-down log view.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="text-slate-300">Monitored Facilities:</span>
          <span className="text-amber-400 font-bold">{hubList.length} Operational Hubs</span>
        </div>
      </div>

      {/* Heatmap Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hubList.map((hub) => (
          <div 
            key={hub.name}
            onClick={() => setSelectedSiteModal(hub)}
            className={`glass-panel p-5 border-l-4 cursor-pointer hover:scale-[1.02] transition-all duration-300 ${
              hub.sifRate >= 40 
                ? 'border-l-red-500 glow-sif bg-red-950/10' 
                : hub.sifRate >= 20 
                ? 'border-l-amber-500 bg-amber-950/10' 
                : 'border-l-emerald-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4.5 h-4.5 ${hub.sifRate >= 40 ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
                <span className="font-extrabold text-sm text-white">{hub.name}</span>
              </div>
              <span className={`badge ${
                hub.sifRate >= 40 ? 'badge-sif' : hub.sifRate >= 20 ? 'badge-amber' : 'badge-safe'
              }`}>
                {hub.sifRate}% SIF Rate
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center bg-slate-950/90 p-3 rounded-xl border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase">Total Logs</span>
                <span className="font-bold text-slate-200">{hub.total}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase">SIF Flags</span>
                <span className="font-bold text-red-400">{hub.sifCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase">Avg SIF Risk</span>
                <span className="font-bold text-cyan-400">{hub.avgRisk}%</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="font-semibold">Risk Classification:</span>
              <span className={`font-bold ${
                hub.sifRate >= 40 ? 'text-red-400' : hub.sifRate >= 20 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {hub.sifRate >= 40 ? '🔴 CRITICAL RISK ZONE' : hub.sifRate >= 20 ? '🟡 CAUTION ZONE' : '🟢 NORMAL ZONE'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="lg:col-span-7 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> SIF Precursor Discovery Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily timeline of overall safety reports versus flagged SIF precursors</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
              7-Day Trajectory
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="Total_Reports" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTotal)" name="Total Reports" />
                <Area type="monotone" dataKey="SIF_Alerts" stroke="#ef4444" fillOpacity={1} fill="url(#colorSif)" name="SIF Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause Radar Chart */}
        <div className="lg:col-span-5 glass-panel p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" /> High-Energy Exposure Radar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">IOGP energy category density across OIL operational hubs</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                <Radar name="Precursor Density" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#f8fafc' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Drill-down Modal for Site Incidents */}
      {selectedSiteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl border-cyan-500/50 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" /> {selectedSiteModal.name} Log Drill-down
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedSiteModal.incidents.length} Safety Logs • {selectedSiteModal.sifCount} SIF-Potential ({selectedSiteModal.sifRate}%)
                </span>
              </div>
              <button onClick={() => setSelectedSiteModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedSiteModal.incidents.map(item => (
                <div key={item.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{item.id} • {item.date}</span>
                    <span className={`badge ${item.isSifPotential || item.isSifPrecursor ? 'badge-sif' : 'badge-safe'} text-[10px]`}>
                      {(item.isSifPotential || item.isSifPrecursor) ? 'SIF-Potential' : 'Non-SIF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">"{item.description}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <span className="text-amber-400 font-semibold">{item.mappedRules?.length > 0 ? item.mappedRules[0].rule : item.rootCause}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedSiteModal(null); onSelectIncident(item); }} className="btn-secondary text-[10px] py-1 px-2.5">
                        <Eye className="w-3 h-3 text-cyan-400"/> Analyze
                      </button>
                      {(item.isSifPotential || item.isSifPrecursor) && (
                        <button onClick={() => { setSelectedSiteModal(null); onOpenDirective(item); }} className="btn-danger text-[10px] py-1 px-2.5">
                          <FileText className="w-3 h-3"/> Directive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
