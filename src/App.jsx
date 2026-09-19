import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Filter, Cpu, ShieldCheck, CheckCircle2, 
  FileText, Activity, Layers, ArrowRight, TrendingUp, AlertTriangle, 
  ChevronRight, Lock, Sparkles, RefreshCw, UserCheck, Zap, BarChart2,
  CheckCircle, PlusCircle, Check, X, Award, ExternalLink, Globe, Database, Shield
} from 'lucide-react';

// ==========================================
// 1. DEMO ROLES & MOCK DATASETS (SIH26136)
// ==========================================

const DEMO_ROLES = [
  {
    role: "Government Officer",
    name: "Dr. Rajeshwar Deshmukh",
    title: "Director of Digital Health & Hospital Administration",
    org: "Public Health Dept, Govt of Maharashtra",
    email: "officer@health.maharashtra.gov.in",
    avatar: "RD",
    color: "bg-blue-600"
  },
  {
    role: "Expert/Evaluator",
    name: "Dr. Ananya Kulkarni",
    title: "Principal Innovation Evaluator (GovTech Panel)",
    org: "IIT Bombay Healthcare AI Research Cell",
    email: "ananya.kulkarni@iitb.ac.in",
    avatar: "AK",
    color: "bg-purple-600"
  },
  {
    role: "Startup",
    name: "Vikram Malhotra",
    title: "Founder & CEO",
    org: "HealthAI Technologies Pvt Ltd",
    email: "vikram@healthai.tech",
    avatar: "VM",
    color: "bg-emerald-600"
  },
  {
    role: "Admin",
    name: "Sanjay Patil, IAS",
    title: "State Procurement Governance Administrator",
    org: "Maharashtra State Innovation Society (MSInS)",
    email: "admin@govscale.maharashtra.gov.in",
    avatar: "SP",
    color: "bg-amber-600"
  }
];

const INITIAL_CHALLENGES = [
  {
    id: "chg_mh_health_01",
    title: "AI-Powered Diagnostic Triage for District Hospitals",
    department: "Public Health Department",
    state: "Maharashtra",
    budget: "₹2.5 Cr - ₹5.0 Cr",
    stage: "Pilot Running",
    deadline: "2026-10-15",
    description: "Automated AI radiological and clinical triage system to assist overburdened doctors in rural district hospitals of Maharashtra.",
    tags: ["Healthcare", "AI/ML", "Diagnostics", "DPIIT Verified"],
    applicantsCount: 14,
    shortlistedCount: 3,
    activePilot: "plt_pune_hospital_01"
  },
  {
    id: "chg_mh_transport_02",
    title: "Real-Time Pothole & Road Quality Telemetry System",
    department: "Public Works Department",
    state: "Maharashtra",
    budget: "₹1.5 Cr - ₹3.0 Cr",
    stage: "Startup Matching",
    deadline: "2026-11-01",
    description: "IoT and mobile camera computer-vision system for real-time monitoring of road degradation across state highways.",
    tags: ["Smart Infra", "Computer Vision", "IoT"],
    applicantsCount: 9,
    shortlistedCount: 2
  },
  {
    id: "chg_mh_water_03",
    title: "Smart Water Metering & Leakage Detection Network",
    department: "Water Resources Department",
    state: "Maharashtra",
    budget: "₹3.0 Cr - ₹6.0 Cr",
    stage: "RFP Issued",
    deadline: "2026-11-20",
    description: "Acoustic and pressure telemetry system for early detection of municipal water distribution pipeline leaks.",
    tags: ["Water Tech", "Acoustic Sensors", "Telemetry"],
    applicantsCount: 6,
    shortlistedCount: 1
  }
];

const INITIAL_STARTUPS = [
  {
    id: "stp_healthai_01",
    name: "HealthAI Technologies Pvt Ltd",
    dpiitId: "DPIIT-89241",
    founded: "2022",
    city: "Pune, Maharashtra",
    category: "Healthcare AI",
    teamSize: 28,
    funding: "₹4.2 Cr Seed",
    description: "ISO 13485 certified AI diagnostic software for rapid triage of chest X-rays and CT scans with 96.4% clinical accuracy.",
    verified: true,
    score: 94
  },
  {
    id: "stp_infraeye_02",
    name: "InfraEye Vision Labs",
    dpiitId: "DPIIT-77312",
    founded: "2023",
    city: "Mumbai, Maharashtra",
    category: "Computer Vision",
    teamSize: 16,
    funding: "₹1.8 Cr Angel",
    description: "Edge-AI camera systems for real-time road inspection and structural health monitoring.",
    verified: true,
    score: 88
  }
];

const INITIAL_PILOTS = [
  {
    id: "plt_pune_hospital_01",
    challengeId: "chg_mh_health_01",
    startupId: "stp_healthai_01",
    name: "Pune District Hospital AI Triage Sandbox",
    location: "Aundh District Hospital, Pune",
    duration: "90 Days (Day 48 Active)",
    status: "ON_TRACK",
    progress: 62,
    patientsScreened: 14280,
    accuracyRate: "96.4%",
    triageTimeSaved: "42 Mins / Patient",
    telemetryStatus: "VERIFIED_ON_CHAIN",
    riskLevel: "LOW",
    kpis: [
      { name: "Radiological Triage Accuracy", target: ">92%", current: "96.4%", met: true },
      { name: "Report Processing Time", target: "<15 mins", current: "8 mins", met: true },
      { name: "Doctor Adoption Rate", target: ">80%", current: "88%", met: true }
    ]
  }
];

const AUDIT_TRAIL = [
  {
    id: "aud_001",
    timestamp: "2026-09-18 14:22:04 IST",
    action: "PILOT_TELEMETRY_BATCH_COMMITTED",
    actor: "Pune Hospital Sandbox Telemetry Node",
    details: "14,280 patient diagnostic records cryptographically hashed and verified.",
    hash: "0x8f2a4b1c9d3e7f...e4b2"
  },
  {
    id: "aud_002",
    timestamp: "2026-09-18 11:15:30 IST",
    action: "EVALUATION_SCORE_SIGNED",
    actor: "Dr. Ananya Kulkarni (IIT Bombay)",
    details: "Signed 6-dimensional evaluation matrix for HealthAI Technologies.",
    hash: "0x3c9e1f4a7b2d8e...a91f"
  },
  {
    id: "aud_003",
    timestamp: "2026-09-17 16:40:12 IST",
    action: "DPC_PROCUREMENT_DOSSIER_GENERATE",
    actor: "Dr. Rajeshwar Deshmukh",
    details: "Generated evidence-backed procurement synthesis bundle.",
    hash: "0x7a2b9c4d1e8f3e...b5c6"
  }
];

// ==========================================
// 2. MAIN APPLICATION COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState(DEMO_ROLES[0].role);
  const [user, setUser] = useState(DEMO_ROLES[0]);
  const [notification, setNotification] = useState(null);

  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [startups, setStartups] = useState(INITIAL_STARTUPS);
  const [pilots, setPilots] = useState(INITIAL_PILOTS);
  const [audits, setAudits] = useState(AUDIT_TRAIL);

  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState('chg_mh_health_01');

  const showNotify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSwitchRole = (roleName) => {
    setCurrentRole(roleName);
    const found = DEMO_ROLES.find(r => r.role === roleName) || DEMO_ROLES[0];
    setUser(found);
    showNotify(`Switched role to: ${roleName} (${found.name})`);
  };

  const handleResetDemo = () => {
    setChallenges(INITIAL_CHALLENGES);
    setStartups(INITIAL_STARTUPS);
    setPilots(INITIAL_PILOTS);
    showNotify("Demo data reset back to default SIH26136 state.", "success");
  };

  const activeChallenge = useMemo(() => {
    return challenges.find(c => c.id === selectedChallengeId) || challenges[0];
  }, [challenges, selectedChallengeId]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Official Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-amber-400 font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse" />
            GOVERNMENT OF MAHARASHTRA
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">Smart India Hackathon 2026 (SIH26136)</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400 font-mono">Theme: Blockchain & Cybersecurity</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            <Shield className="w-3 h-3 mr-1 text-emerald-400" />
            Blockchain Verified
          </span>
          <button 
            onClick={handleResetDemo}
            className="hover:text-white flex items-center transition-colors text-slate-400 text-xs font-semibold"
          >
            <RefreshCw className="w-3 h-3 mr-1 text-amber-400" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Main Branding & Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md font-black text-lg">
                G
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">GovScale</span>
                  <span className="badge-gov badge-blue text-[10px]">SIH26136</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block">State Innovation Procurement System</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavButton id="dashboard" label="Overview" icon={BarChart2} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavButton id="challenges" label="Challenges" icon={Building2} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavButton id="match" label="AI Matchmaker" icon={Cpu} activeTab={activeTab} setActiveTab={setActiveTab} badge="AI" />
              <NavButton id="evaluations" label="Evaluations" icon={FileText} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavButton id="pilots" label="Pilots & Telemetry" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavButton id="procurement" label="Procurement Evidence" icon={ShieldCheck} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavButton id="scale" label="Scale Readiness" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavButton id="audit" label="Audit Trail" icon={Database} activeTab={activeTab} setActiveTab={setActiveTab} badge="Chain" />
            </nav>

            {/* Role Switcher Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-3">
                <div className={`w-7 h-7 rounded-lg ${user.color} text-white flex items-center justify-center font-bold text-xs`}>
                  {user.avatar}
                </div>
                <div className="text-left">
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Active Role</span>
                  <select
                    value={currentRole}
                    onChange={(e) => handleSwitchRole(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold border-none p-0 text-xs focus:ring-0 cursor-pointer"
                  >
                    {DEMO_ROLES.map(r => (
                      <option key={r.role} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            user={user}
            challenges={challenges}
            pilots={pilots}
            audits={audits}
            setActiveTab={setActiveTab}
            setShowCreateModal={() => setShowCreateChallengeModal(true)}
            setSelectedChallengeId={setSelectedChallengeId}
          />
        )}

        {/* VIEW 2: CHALLENGES */}
        {activeTab === 'challenges' && (
          <ChallengesView 
            challenges={challenges}
            setActiveTab={setActiveTab}
            setSelectedChallengeId={setSelectedChallengeId}
            setShowCreateModal={() => setShowCreateChallengeModal(true)}
          />
        )}

        {/* VIEW 3: AI MATCHMAKER */}
        {activeTab === 'match' && (
          <AIMatchmakerView 
            challenge={activeChallenge}
            startups={startups}
            setActiveTab={setActiveTab}
            showNotify={showNotify}
          />
        )}

        {/* VIEW 4: EVALUATIONS */}
        {activeTab === 'evaluations' && (
          <EvaluationsView 
            setActiveTab={setActiveTab}
            showNotify={showNotify}
          />
        )}

        {/* VIEW 5: PILOTS & TELEMETRY */}
        {activeTab === 'pilots' && (
          <PilotsView 
            pilot={pilots[0]}
            setActiveTab={setActiveTab}
            showNotify={showNotify}
          />
        )}

        {/* VIEW 6: PROCUREMENT EVIDENCE */}
        {activeTab === 'procurement' && (
          <ProcurementView 
            setActiveTab={setActiveTab}
            showNotify={showNotify}
          />
        )}

        {/* VIEW 7: SCALE READINESS */}
        {activeTab === 'scale' && (
          <ScaleView 
            setActiveTab={setActiveTab}
          />
        )}

        {/* VIEW 8: BLOCKCHAIN AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <AuditView 
            audits={audits}
          />
        )}
      </main>

      {/* Create Challenge Modal */}
      {showCreateChallengeModal && (
        <CreateChallengeModal 
          onClose={() => setShowCreateChallengeModal(false)}
          onCreate={(newChg) => {
            setChallenges(prev => [newChg, ...prev]);
            setShowCreateChallengeModal(false);
            showNotify(`Challenge "${newChg.title}" created successfully!`, "success");
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-white text-sm">GovScale</span>
            <span className="text-slate-500 ml-2">Smart India Hackathon 2026 (SIH26136)</span>
            <p className="text-slate-500 text-[11px] mt-1">State Innovation Procurement & Pilot Evidence Engine for Maharashtra</p>
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <a href="#security" onClick={() => setActiveTab('audit')} className="hover:text-white">Audit Ledger</a>
            <a href="#dpiit" onClick={() => setActiveTab('challenges')} className="hover:text-white">DPIIT Integration</a>
            <a href="#msins" onClick={() => setActiveTab('scale')} className="hover:text-white">MSInS Governance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// NavButton Component
function NavButton({ id, label, icon: Icon, activeTab, setActiveTab, badge }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
      <span>{label}</span>
      {badge && (
        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
          badge === 'AI' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ==========================================
// 3. DASHBOARD OVERVIEW VIEW
// ==========================================

function DashboardView({ user, challenges, pilots, audits, setActiveTab, setShowCreateModal, setSelectedChallengeId }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card-gov p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-none shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="badge-gov badge-amber text-[10px]">GOVSCALE COMMAND CENTER</span>
            <span className="text-xs font-mono text-blue-300 font-bold">ROLE: {user.role.toUpperCase()}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome, {user.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {user.title} — {user.org}. Managing statewide innovation procurement, sandbox trials, and evidence-backed scaling.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={setShowCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Challenge</span>
          </button>
          <button 
            onClick={() => setActiveTab('match')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 flex items-center space-x-2 transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span>AI Matchmaker</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Active Challenges" val={challenges.length} sub="Departmental RFPs" icon={Building2} color="text-blue-600 bg-blue-50" onClick={() => setActiveTab('challenges')} />
        <KpiCard label="Applications" val={14} sub="Verified Proposals" icon={FileText} color="text-indigo-600 bg-indigo-50" onClick={() => setActiveTab('evaluations')} />
        <KpiCard label="Pilots Running" val={pilots.length} sub="Active Sandboxes" icon={Activity} color="text-amber-600 bg-amber-50" onClick={() => setActiveTab('pilots')} />
        <KpiCard label="Procurement Ready" val={1} sub="DPC Evidence Bundles" icon={ShieldCheck} color="text-emerald-600 bg-emerald-50" onClick={() => setActiveTab('procurement')} />
        <KpiCard label="Scale Ready" val={1} sub="Statewide Rollouts" icon={TrendingUp} color="text-purple-600 bg-purple-50" onClick={() => setActiveTab('scale')} />
      </div>

      {/* 5-Stage Governance Pathway */}
      <div className="card-gov p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">End-to-End Governance Pathway</span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">The 5-Stage Innovation Procurement Pipeline</h3>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            DPIIT & MSInS Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <StageCard step="01" name="Identify" desc="Government Challenge Identification" status="Active" color="border-blue-300 bg-blue-50/50 text-blue-700" onClick={() => setActiveTab('challenges')} />
          <StageCard step="02" name="Evaluate" desc="AI Discovery & Expert Matrix" status="Active" color="border-purple-300 bg-purple-50/50 text-purple-700" onClick={() => setActiveTab('evaluations')} />
          <StageCard step="03" name="Pilot" desc="60-90 Day Live Sandbox Trial" status="Active" color="border-amber-300 bg-amber-50/50 text-amber-700" onClick={() => setActiveTab('pilots')} />
          <StageCard step="04" name="Procure" desc="Evidence-Backed DPC Synthesis" status="Active" color="border-emerald-300 bg-emerald-50/50 text-emerald-700" onClick={() => setActiveTab('procurement')} />
          <StageCard step="05" name="Scale" desc="Statewide 36-District Deployment" status="Active" color="border-indigo-300 bg-indigo-50/50 text-indigo-700" onClick={() => setActiveTab('scale')} />
        </div>
      </div>

      {/* Active Challenges Table */}
      <div className="card-gov p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Active Challenges by State Department</span>
          </h3>
          <button onClick={() => setActiveTab('challenges')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
            View All Challenges <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Challenge Ref</th>
                <th className="p-3">Department</th>
                <th className="p-3">Budget Range</th>
                <th className="p-3">Current Stage</th>
                <th className="p-3 text-center">Applicants</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {challenges.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">
                    <div>{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.id}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-600">{item.department}</td>
                  <td className="p-3 font-mono font-bold text-blue-600">{item.budget}</td>
                  <td className="p-3">
                    <span className="badge-gov badge-amber text-[10px]">{item.stage}</span>
                  </td>
                  <td className="p-3 text-center font-bold">{item.applicantsCount} Startups</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => { setSelectedChallengeId(item.id); setActiveTab('match'); }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[11px] border border-amber-200 flex items-center space-x-1"
                      >
                        <Cpu className="w-3 h-3 text-amber-600" />
                        <span>AI Match</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab('evaluations')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] border border-blue-200"
                      >
                        Details
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

function KpiCard({ label, val, sub, icon: Icon, color, onClick }) {
  return (
    <div onClick={onClick} className="card-gov card-gov-interactive p-4 cursor-pointer space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 font-mono">{val}</div>
      <span className="text-[10px] text-slate-500 font-medium block">{sub}</span>
    </div>
  );
}

function StageCard({ step, name, desc, status, color, onClick }) {
  return (
    <div onClick={onClick} className={`p-3.5 rounded-xl border ${color} cursor-pointer hover:scale-[1.02] transition-transform space-y-1`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold opacity-75">STAGE {step}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded">{status}</span>
      </div>
      <div className="font-extrabold text-sm">{name}</div>
      <p className="text-[11px] leading-tight opacity-90">{desc}</p>
    </div>
  );
}

// ==========================================
// 4. CHALLENGES VIEW
// ==========================================

function ChallengesView({ challenges, setActiveTab, setSelectedChallengeId, setShowCreateModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const filtered = challenges.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'ALL' || c.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="badge-gov badge-amber text-[10px]">CHALLENGE MARKETPLACE</span>
          <h2 className="text-xl font-black text-white mt-1">Government Challenges & Departmental RFPs</h2>
          <p className="text-xs text-slate-300 mt-1">Browse active municipal & state problem statements open for DPIIT-verified startup trials.</p>
        </div>
        <button onClick={setShowCreateModal} className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg flex items-center space-x-2">
          <PlusCircle className="w-4 h-4" />
          <span>Post New Challenge</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-gov p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search challenges by title, keyword, or tech tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl p-2 bg-white">
          <option value="ALL">All Departments</option>
          <option value="Public Health Department">Public Health Department</option>
          <option value="Public Works Department">Public Works Department</option>
          <option value="Water Resources Department">Water Resources Department</option>
        </select>
      </div>

      {/* Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div key={item.id} className="card-gov card-gov-interactive p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-gov badge-blue text-[10px]">{item.department}</span>
                <span className="badge-gov badge-amber text-[10px]">{item.stage}</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3">{item.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">Budget:</span>
                <span className="font-bold text-blue-700">{item.budget}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">#{t}</span>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button 
                  onClick={() => { setSelectedChallengeId(item.id); setActiveTab('match'); }}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Launch AI Match</span>
                </button>
                <button 
                  onClick={() => setActiveTab('evaluations')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. AI MATCHMAKER VIEW
// ==========================================

function AIMatchmakerView({ challenge, startups, setActiveTab, showNotify }) {
  const topMatch = startups[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-gov badge-purple text-[10px]">AI SEMANTIC MATCHMAKER</span>
            <span className="text-xs font-mono text-purple-300">Model: GovTech-LLM v3</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">AI Discovery for: {challenge.title}</h2>
          <p className="text-xs text-slate-300 mt-1">Automatic vector similarity matching DPIIT-verified startups against departmental challenge specs.</p>
        </div>
        <div className="bg-purple-950/80 px-4 py-2 rounded-xl border border-purple-700/60 text-center">
          <div className="text-2xl font-black text-amber-400 font-mono">94%</div>
          <span className="text-[10px] text-slate-300 uppercase font-bold">Top Match Score</span>
        </div>
      </div>

      {/* Top Match Recommendation Banner */}
      <div className="card-gov p-6 border-l-4 border-l-emerald-500 bg-emerald-50/30 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="badge-gov badge-emerald text-[10px]">#1 RECOMMENDED STARTUP</span>
              <span className="text-xs font-mono text-slate-500">{topMatch.dpiitId}</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{topMatch.name}</h3>
            <p className="text-xs text-slate-600 max-w-3xl">{topMatch.description}</p>
          </div>

          <button 
            onClick={() => {
              showNotify(`Shortlisted ${topMatch.name} for 6-Dimensional Evaluation Matrix!`, "success");
              setActiveTab('evaluations');
            }}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Shortlist for Evaluation</span>
          </button>
        </div>

        {/* AI Criteria Radar Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-200/60 text-xs">
          <div className="bg-white p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Technical Alignment</span>
            <span className="font-mono font-black text-emerald-700 text-base">98%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Clinical / Domain Accuracy</span>
            <span className="font-mono font-black text-emerald-700 text-base">96.4%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">DPDP Compliance</span>
            <span className="font-mono font-black text-blue-700 text-base">Verified</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Team Capacity</span>
            <span className="font-mono font-black text-purple-700 text-base">28 Engineers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. EVALUATIONS VIEW
// ==========================================

function EvaluationsView({ setActiveTab, showNotify }) {
  const [comments, setComments] = useState("System exhibits outstanding technical alignment with Pune District Hospital clinical needs. Passed ISO 13485 audit.");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="badge-gov badge-blue text-[10px]">EXPERT EVALUATION GATE</span>
          <h2 className="text-xl font-black text-white mt-1">6-Dimensional Subject Matter Evaluation Matrix</h2>
          <p className="text-xs text-slate-300 mt-1">Application Ref: app_hlth_001 | Evaluator: Dr. Ananya Kulkarni (IIT Bombay)</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              showNotify("Application Approved for 90-Day Live Sandbox Pilot!", "success");
              setActiveTab('pilots');
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve for Pilot (90 Days)</span>
          </button>
        </div>
      </div>

      {/* 6-Dimensional Score Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EvalScoreCard title="1. Domain & Clinical Fit" score="96 / 100" desc="Aligned with rural diagnostic workflows" status="PASSED" />
        <EvalScoreCard title="2. Technical Feasibility" score="94 / 100" desc="Edge-AI model running under 8 mins/case" status="PASSED" />
        <EvalScoreCard title="3. DPDP & Security" score="98 / 100" desc="Anonymized on-premise data pipeline" status="PASSED" />
        <EvalScoreCard title="4. Scalability Potential" score="92 / 100" desc="Containerized Kubernetes microservices" status="PASSED" />
        <EvalScoreCard title="5. Team Capability" score="90 / 100" desc="28 engineers + 4 medical advisors" status="PASSED" />
        <EvalScoreCard title="6. Cost Efficiency" score="95 / 100" desc="70% lower than traditional solutions" status="PASSED" />
      </div>

      {/* Evaluator Notes */}
      <div className="card-gov p-6 space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm">GovTech Panel Evaluator Sign-Off Notes</h3>
        <textarea 
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
        />
        <div className="flex justify-end">
          <button onClick={() => showNotify("Evaluator notes saved & signed on-chain!", "success")} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">
            Sign & Save Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}

function EvalScoreCard({ title, score, desc, status }) {
  return (
    <div className="card-gov p-5 space-y-2 border-l-4 border-l-emerald-500">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-slate-400">{title}</span>
        <span className="badge-gov badge-emerald text-[9px]">{status}</span>
      </div>
      <div className="text-2xl font-black text-slate-900 font-mono">{score}</div>
      <p className="text-xs text-slate-600">{desc}</p>
    </div>
  );
}

// ==========================================
// 7. PILOTS & TELEMETRY VIEW
// ==========================================

function PilotsView({ pilot, setActiveTab, showNotify }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="badge-gov badge-amber text-[10px]">LIVE SANDBOX TELEMETRY</span>
          <h2 className="text-xl font-black text-white mt-1">{pilot.name}</h2>
          <p className="text-xs text-slate-300 mt-1">Location: {pilot.location} | Duration: {pilot.duration}</p>
        </div>
        <button 
          onClick={() => {
            showNotify("Procurement evidence dossier generated for DPC!", "success");
            setActiveTab('procurement');
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4 text-slate-950" />
          <span>Generate Procurement Synthesis</span>
        </button>
      </div>

      {/* Live Telemetry KPI Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-gov p-5 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Patients Screened</span>
          <div className="text-3xl font-black text-slate-900 font-mono">{pilot.patientsScreened.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Real-Time Telemetry Feed Active</span>
        </div>
        <div className="card-gov p-5 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Diagnostic Accuracy</span>
          <div className="text-3xl font-black text-emerald-600 font-mono">{pilot.accuracyRate}</div>
          <span className="text-[10px] text-slate-500 font-medium">Verified against Senior Radiologist Audit</span>
        </div>
        <div className="card-gov p-5 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Average Triage Time Saved</span>
          <div className="text-3xl font-black text-blue-600 font-mono">{pilot.triageTimeSaved}</div>
          <span className="text-[10px] text-blue-600 font-bold">Speed Increase: 4.2x</span>
        </div>
      </div>

      {/* KPI Checklist */}
      <div className="card-gov p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Contractual Milestone & KPI Verification Matrix</h3>
        <div className="space-y-3">
          {pilot.kpis.map((k, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800">{k.name}</span>
              </div>
              <div className="flex items-center space-x-4 font-mono">
                <span className="text-slate-500">Target: {k.target}</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Achieved: {k.current}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. PROCUREMENT READINESS VIEW
// ==========================================

function ProcurementView({ setActiveTab, showNotify }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="badge-gov badge-emerald text-[10px]">EVIDENCE-BACKED READINESS</span>
          <h2 className="text-xl font-black text-white mt-1">DPC Innovation Procurement Synthesis</h2>
          <p className="text-xs text-slate-300 mt-1">Departmental Procurement Committee Evidence Dossier for HealthAI Technologies</p>
        </div>
        <button 
          onClick={() => {
            showNotify("Dossier submitted to State Procurement Committee!", "success");
            setActiveTab('scale');
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-2"
        >
          <Award className="w-4 h-4 text-slate-950" />
          <span>Submit to DPC Committee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-gov p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Verified Pilot Audit Summary</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">✅ <strong>14,280 Real Patients Screened</strong> with 0 critical safety misdiagnoses.</li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">✅ <strong>₹1.2 Cr Estimated Savings</strong> in emergency triage transport costs.</li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">✅ <strong>DPDP Act 2023 Compliant</strong> data protection architecture certified by CERT-In auditor.</li>
          </ul>
        </div>

        <div className="card-gov p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Legal & Procurement Artifacts</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-bold flex justify-between items-center">
              <span>📄 Sandbox Telemetry Audit Certificate.pdf</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded text-blue-700">SHA-256 Verified</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-bold flex justify-between items-center">
              <span>📄 Cost-Benefit Impact Analysis Matrix.pdf</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded text-blue-700">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. SCALE READINESS VIEW
// ==========================================

function ScaleView({ setActiveTab }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="badge-gov badge-purple text-[10px]">STATEWIDE DEPLOYMENT</span>
          <h2 className="text-xl font-black text-white mt-1">8-Dimensional Scalability Audit & Statewide Roadmap</h2>
          <p className="text-xs text-slate-300 mt-1">Expansion plan across 36 Districts of Maharashtra</p>
        </div>
        <button onClick={() => setActiveTab('audit')} className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg">
          View Blockchain Audit Trail
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-gov p-5 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Target Districts</span>
          <div className="text-3xl font-black text-slate-900 font-mono">36</div>
          <span className="text-[10px] text-purple-600 font-bold">Maharashtra Statewide</span>
        </div>
        <div className="card-gov p-5 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">District Hospitals</span>
          <div className="text-3xl font-black text-blue-600 font-mono">148</div>
          <span className="text-[10px] text-slate-500">Node Deployment</span>
        </div>
        <div className="card-gov p-5 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Beneficiaries</span>
          <div className="text-3xl font-black text-emerald-600 font-mono">4.2M</div>
          <span className="text-[10px] text-emerald-600 font-bold">Patients Served</span>
        </div>
        <div className="card-gov p-5 space-y-1 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Impact</span>
          <div className="text-3xl font-black text-amber-600 font-mono">₹48 Cr</div>
          <span className="text-[10px] text-amber-600 font-bold">Cost Savings</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. BLOCKCHAIN AUDIT VIEW
// ==========================================

function AuditView({ audits }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-gov p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="badge-gov badge-emerald text-[10px]">IMMUTABLE BLOCKCHAIN LEDGER</span>
          <h2 className="text-xl font-black text-white mt-1">Cryptographic Audit Trail & Governance Proofs</h2>
          <p className="text-xs text-slate-300 mt-1">SHA-256 hash chaining ensuring tamper-evident procurement and telemetry history.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 font-bold">Ledger Height: #148,291</span>
        </div>
      </div>

      <div className="card-gov p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Verified Governance Activity Log</h3>
        <div className="space-y-3 font-mono text-xs">
          {audits.map(item => (
            <div key={item.id} className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1">
                <span className="text-amber-400 font-bold">{item.action}</span>
                <span className="text-slate-500">{item.timestamp}</span>
              </div>
              <p className="text-slate-300 font-sans text-xs">{item.details}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                <span>Actor: {item.actor}</span>
                <span className="text-emerald-400 font-bold">Hash: {item.hash}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. CREATE CHALLENGE MODAL
// ==========================================

function CreateChallengeModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Public Health Department');
  const [budget, setBudget] = useState('₹2.0 Cr - ₹4.0 Cr');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;
    onCreate({
      id: `chg_mh_${Math.floor(100 + Math.random() * 900)}`,
      title,
      department,
      state: "Maharashtra",
      budget,
      stage: "RFP Issued",
      deadline: "2026-11-30",
      description,
      tags: ["GovTech", "Innovation", "Maharashtra"],
      applicantsCount: 0,
      shortlistedCount: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base">Post New Departmental Challenge</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Challenge Title</label>
            <input 
              type="text" 
              placeholder="e.g. AI-Powered Traffic Flow Optimization"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold">
              <option value="Public Health Department">Public Health Department</option>
              <option value="Public Works Department">Public Works Department</option>
              <option value="Water Resources Department">Water Resources Department</option>
              <option value="Urban Development Department">Urban Development Department</option>
              <option value="Energy & Renewable Department">Energy & Renewable Department</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Estimated Budget Range</label>
            <input 
              type="text" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Problem Statement Description</label>
            <textarea 
              rows={4}
              placeholder="Detailed description of problem statement and desired innovation outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">Publish Challenge</button>
          </div>
        </form>
      </div>
    </div>
  );
}
