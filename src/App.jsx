import React, { useState } from 'react';
import CelestialBackground from './components/CelestialBackground';
import Header from './components/Header';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import LiveAnalyzer from './components/LiveAnalyzer';
import BatchAnalyzer from './components/BatchAnalyzer';
import RiskAnalytics from './components/RiskAnalytics';
import KnowledgeBase from './components/KnowledgeBase';
import DirectiveModal from './components/DirectiveModal';
import QuickDock from './components/QuickDock';
import { getInitialDataset } from './services/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dataset, setDataset] = useState(getInitialDataset());
  const [selectedIncidentForAnalysis, setSelectedIncidentForAnalysis] = useState(null);
  const [activeDirectiveIncident, setActiveDirectiveIncident] = useState(null);
  const [userRole, setUserRole] = useState('Executive HSE Director');

  const sifPrecursors = dataset.filter(d => d.isSifPotential || d.isSifPrecursor);
  const sifCount = sifPrecursors.length;

  const handleSelectIncidentForAnalysis = (incident) => {
    setSelectedIncidentForAnalysis(incident);
    setActiveTab('live');
  };

  const handleSaveToDataset = (newRecord) => {
    setDataset(prev => [newRecord, ...prev]);
  };

  const handleUpdateIncident = (updatedRecord) => {
    setDataset(prev => prev.map(item => item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item));
  };

  const handleOpenDirective = (incident) => {
    setActiveDirectiveIncident(incident || sifPrecursors[0] || dataset[0]);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-28 relative overflow-x-hidden">
      {/* 4K Living Celestial Cyberpunk Background */}
      <CelestialBackground />

      <div className="app-container relative z-10">
        {/* Navigation Header with Neural Core */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sifCount={sifCount}
          totalCount={dataset.length}
          userRole={userRole}
          setUserRole={setUserRole}
        />

        {/* Command Center View Modules */}
        <main>
          {activeTab === 'overview' && (
            <ExecutiveDashboard
              dataset={dataset}
              userRole={userRole}
              onSelectIncident={handleSelectIncidentForAnalysis}
              onOpenDirective={handleOpenDirective}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'live' && (
            <LiveAnalyzer
              initialIncident={selectedIncidentForAnalysis}
              userRole={userRole}
              onSaveToDataset={handleSaveToDataset}
              onUpdateIncident={handleUpdateIncident}
              onOpenDirective={handleOpenDirective}
            />
          )}

          {activeTab === 'batch' && (
            <BatchAnalyzer
              dataset={dataset}
              setDataset={setDataset}
              userRole={userRole}
              onUpdateIncident={handleUpdateIncident}
              onSelectIncident={handleSelectIncidentForAnalysis}
              onOpenDirective={handleOpenDirective}
            />
          )}

          {activeTab === 'analytics' && (
            <RiskAnalytics 
              dataset={dataset} 
              onSelectIncident={handleSelectIncidentForAnalysis}
              onOpenDirective={handleOpenDirective}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBase 
              dataset={dataset}
              onSelectIncident={handleSelectIncidentForAnalysis}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Floating Holographic Dock */}
      <QuickDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => handleOpenDirective(sifPrecursors[0] || dataset[0])}
      />

      {/* SIF Emergency Safety Directive Modal */}
      {activeDirectiveIncident && (
        <DirectiveModal
          incident={activeDirectiveIncident}
          onClose={() => setActiveDirectiveIncident(null)}
        />
      )}
    </div>
  );
}
