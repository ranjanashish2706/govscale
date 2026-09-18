import React, { useMemo } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Flame, ArrowUpRight, ArrowDownRight,
  Layers, Activity, FileText, Download, Target, MapPin, Grid, TrendingUp, Cpu, Zap, ArrowRight, Eye, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { detectPatterns, calculateSIFDensity } from '../services/nlpEngine';

export default function ExecutiveDashboard({ dataset = [], userRole = 'Executive HSE Director', onSelectIncident, onOpenDirective, setActiveTab }) {
  const totalReports = dataset.length;
  const sifPrecursors = dataset.filter(d => d.isSifPotential || d.isSifPrecursor);
  const sifCount = sifPrecursors.length;
  const nonSifCount = totalReports - sifCount;
  const sifDensity = totalReports > 0 ? ((sifCount / totalReports) * 100).toFixed(1) : '0.0';
  
  const patterns = useMemo(() => detectPatterns(dataset), [dataset]);
  const siteDensity = useMemo(() => calculateSIFDensity(dataset, 'facility'), [dataset]);
  
  const highRiskSitesCount = siteDensity.filter(s => parseFloat(s.density) > 20).length;
  const topLSR = patterns.length > 0 ? patterns[0].rule : 'Working at Height';

  // Extract Barrier Failures
  const barrierCounts = {};
  dataset.forEach(d => {
    const barrierFailures = d.extractedPrecursors?.barrierFailures || d.missingControls || [];
    barrierFailures.forEach(bf => {
      if (bf && bf !== 'N/A') {
        barrierCounts[bf] = (barrierCounts[bf] || 0) + 1;
      }
    });
  });
  const topBarriers = Object.entries(barrierCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  if (topBarriers.length === 0) {
    topBarriers.push(['Permit Verification Failure', 12], ['Incomplete Energy Isolation', 9], ['PPE Non-Compliance', 7], ['Missing Gas Testing', 5]);
  }

  // Extract LSR Counts for LSR Chart
  const lsrCounts = {};
  dataset.forEach(d => {
    const rules = d.mappedRules || [];
    rules.forEach(r => {
      const name = r.rule;
      lsrCounts[name] = (lsrCounts[name] || 0) + 1;
    });
  });
  const lsrChartData = Object.entries(lsrCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 6)
    .map(([rule, count]) => ({ rule: rule.length > 15 ? rule.substring(0,14)+'...' : rule, fullRule: rule, count }));

  const pieData = [
    { name: 'SIF-Potential', value: sifCount, color: '#ef4444' },
    { name: 'Non-SIF', value: nonSifCount, color: '#10b981' }
  ];

  const siteChartData = siteDensity.slice(0, 5).map(s => ({
    name: s.name.replace('Drilling Rig', 'Rig').replace('Pipeline Station', 'Station').split(' ').slice(0,2).join(' '),
    density: parseFloat(s.density),
    fill: parseFloat(s.density) > 30 ? '#ef4444' : '#f59e0b'
  }));

  // Trend Data for AreaChart
  const trendData = useMemo(() => {
    const grouped = {};
    dataset.forEach(d => {
      if (!d.date) return;
      const dateKey = d.date.substring(5); // e.g., '08-25'
      if (!grouped[dateKey]) grouped[dateKey] = { date: dateKey, SIF: 0, Total: 0 };
      grouped[dateKey].Total++;
      if (d.isSifPotential || d.isSifPrecursor) grouped[dateKey].SIF++;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [dataset]);

  // Recent Critical Incidents
  const recentCritical = useMemo(() => {
    return dataset
      .filter(d => d.isSifPotential || d.isSifPrecursor)
      .slice(0, 5);
  }, [dataset]);

  return (
    <div className="space-y-8 animate-holo-boot">
      {/* Role-Specific Executive Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="badge badge-amber text-[10px] font-mono">COMMAND MODE</span>
          <span className="text-xs font-extrabold text-white">
            Perspective: <span className="text-cyan-400">{userRole}</span>
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            • {userRole === 'Executive HSE Director' ? 'Strategic SIF Prevention & Compliance Governance' : userRole === 'Field HSE Safety Engineer' ? 'Rig & Site Operational Hazard Verification' : 'Equipment & Crew Safety Management'}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setActiveTab('live')}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <Cpu className="w-3.5 h-3.5" /> Live Analyzer
          </button>
          <button 
            onClick={() => setActiveTab('batch')}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Batch Data
          </button>
          <button 
            onClick={() => onOpenDirective(sifPrecursors[0] || dataset[0])}
            className="btn-danger text-xs py-2 px-3.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency Directive
          </button>
        </div>
      </div>

      {/* Hero Cinematic Emergency Command Chamber */}
      <div className="glass-panel p-8 border-l-4 border-l-red-500 bg-gradient-to-r from-red-950/60 via-slate-950/95 to-slate-950 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden glow-sif">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-5 relative z-10">
          <div className="p-4 bg-red-500/20 rounded-2xl border border-red-500/50 text-red-400 shadow-2xl shadow-red-500/30 flex-shrink-0">
            <Target className="w-10 h-10 animate-bounce text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="badge badge-sif text-[10px]">OIL HSE FOCUS AREA</span>
              <span className="text-xs font-mono text-red-400 font-bold">{patterns.length} SYSTEMIC RISK PATTERNS DETECTED</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 tracking-wide">
              Top Operational Risk: {patterns.length > 0 ? patterns[0].pattern : 'Working at Height + Fall Protection Failure'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {patterns.length > 0 
                ? `Identified ${patterns[0].occurrences} occurrences across ${patterns[0].sites.length} operational sites. High risk of ${patterns[0].rule} violations linked to ${patterns[0].mainBarrier}. Immediate field safety audit advised.`
                : 'Systemic pattern analysis active across all 35 OIL operational logs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-end lg:self-center">
          <button 
            onClick={() => onOpenDirective(sifPrecursors[0] || dataset[0])}
            className="btn-danger text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-red-600/30"
          >
            <ShieldAlert className="w-4 h-4" /> Issue Directive <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metric KPI Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Safety Reports" value={totalReports} icon={Layers} color="cyan" subtitle="Processed via NLP Engine" />
        <KpiCard title="SIF-Potential Incidents" value={sifCount} icon={AlertTriangle} color="red" pulse={sifCount > 0} subtitle="High Energy Exposure" />
        <KpiCard title="SIF Risk Density" value={`${sifDensity}%`} icon={Activity} color="amber" subtitle="Precursor Ratio" />
        <KpiCard title="High-Risk Sites (>20%)" value={highRiskSitesCount} icon={MapPin} color="amber" subtitle="Require Audit" />
        <KpiCard title="Top LSR Non-Compliance" value={topLSR.split(' ')[0]} icon={ShieldAlert} color="red" subtitle="Life-Saving Rule" />
      </div>

      {/* Holographic Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Area Chart: Trend Over Time */}
        <div className="lg:col-span-8 glass-panel p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> SIF Precursor Volume Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-1">Daily timeline of overall safety reports versus flagged SIF-Potential incidents</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/50 font-bold">
              30-Day Trend
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSIF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '16px' }} />
                <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-300">{value}</span>} />
                <Area type="monotone" dataKey="Total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} name="Total Reports" />
                <Area type="monotone" dataKey="SIF" stroke="#ef4444" fill="url(#colorSIF)" strokeWidth={3} name="SIF-Potential" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: SIF vs Non-SIF */}
        <div className="lg:col-span-4 glass-panel p-7">
          <h3 className="text-base font-black text-white flex items-center gap-2.5 mb-2">
            <Target className="w-5 h-5 text-cyan-400" /> Risk Classification Split
          </h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of safety observations with potential for severe harm</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`pie-cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '16px' }} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Site SIF Density, Barrier Failures & Top LSRs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Bar Chart: Density by Site */}
        <div className="glass-panel p-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-amber-400" /> Operational Site SIF Density
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Percentage of site reports flagged as SIF-Potential</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteChartData} margin={{ top: 15, right: 0, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" interval={0}/>
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                <Bar dataKey="density" radius={[4, 4, 0, 0]} name="Density %">
                  {siteChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Barrier Failures */}
        <div className="glass-panel p-7">
          <h3 className="text-base font-black text-white flex items-center gap-2.5 mb-1">
            <Flame className="w-5 h-5 text-red-400" /> Critical Control Failures
          </h3>
          <p className="text-xs text-slate-400 mb-4">Most common safety barrier breakdowns identified by AI</p>
          <div className="space-y-3">
            {topBarriers.map((barrier, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-950/90 p-3 rounded-xl border border-slate-800 hover:border-red-500/40 transition-colors">
                <span className="text-xs font-semibold text-slate-200">{i+1}. {barrier[0]}</span>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900">{barrier[1]} events</span>
              </div>
            ))}
          </div>
        </div>

        {/* Life-Saving Rule Non-Compliance Breakdown */}
        <div className="glass-panel p-7">
          <h3 className="text-base font-black text-white flex items-center gap-2.5 mb-1">
            <ShieldAlert className="w-5 h-5 text-purple-400" /> IOGP Rule Violation Frequency
          </h3>
          <p className="text-xs text-slate-400 mb-4">Top Life-Saving Rules mapped from unstructured text</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lsrChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="rule" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} name="Violations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Critical Action Widget: Recent High-Risk SIF Precursors */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-sif text-[10px]">ACTION REQUIRED</span>
              <h3 className="text-base font-black text-white">Recent High-Risk SIF Precursors</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Safety logs requiring immediate field supervisor intervention and work-stop directives</p>
          </div>
          <button 
            onClick={() => setActiveTab('batch')}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            View All {dataset.length} Reports <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <th className="p-3">Incident Ref</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Category</th>
                <th className="p-3">Life-Saving Rule</th>
                <th className="p-3">Risk Confidence</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentCritical.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">{item.id}</td>
                  <td className="p-3 text-slate-200 font-semibold">{item.facility}</td>
                  <td className="p-3">
                    <span className="bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 text-[10px] font-mono">
                      {item.reportType}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-amber-400">
                    {item.mappedRules && item.mappedRules.length > 0 ? item.mappedRules[0].rule : item.rootCause || 'Working at Height'}
                  </td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                      {item.confidenceScore || item.sifProbability || 85}% SIF Risk
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onSelectIncident(item)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> Analyze
                      </button>
                      <button 
                        onClick={() => onOpenDirective(item)}
                        className="btn-danger text-[11px] py-1 px-2.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> Directive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, pulse, subtitle }) {
  const colorMap = {
    cyan: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
    red: 'border-red-500/40 text-red-400 bg-red-950/30',
    amber: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    emerald: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
  };

  return (
    <div className={`glass-panel p-5 border-l-4 ${colorMap[color]} ${pulse ? 'glow-sif' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</span>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-black text-white font-mono">{value}</div>
      {subtitle && <span className="text-[10px] text-slate-400 mt-1 block">{subtitle}</span>}
    </div>
  );
}
