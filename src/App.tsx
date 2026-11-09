/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ViewTab, TargetAgent, SecurityEvent, SocMetrics, AiCorrelationOutput } from './types/soc';
import { api } from './services/api';
import { NavigationRail } from './components/NavigationRail';
import { HeaderBar } from './components/HeaderBar';
import { OverviewCockpit } from './components/OverviewCockpit';
import { DeviceManager } from './components/DeviceManager';
import { SiemExplorer } from './components/SiemExplorer';
import { AttackGraph } from './components/AttackGraph';
import { MitreMatrix } from './components/MitreMatrix';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { AddDeviceModal } from './components/AddDeviceModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('cockpit');
  const [metrics, setMetrics] = useState<SocMetrics | null>(null);
  const [agents, setAgents] = useState<TargetAgent[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [addDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<AiCorrelationOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [siemInitialQuery, setSiemInitialQuery] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Initial Load & Polling for Live Telemetry
  const refreshAll = useCallback(async () => {
    try {
      const [m, a, e] = await Promise.all([
        api.getMetrics(),
        api.getAgents(),
        api.getEvents()
      ]);

      setMetrics(m);
      setAgents(a.agents);
      setEvents(e.events);
      setSyncError(null);
    } catch (err) {
      console.warn('Telemetry sync error:', err);
      setSyncError(err instanceof Error ? err.message : 'Unable to load target telemetry.');
    }
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 3500);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Autonomous AI Triage Trigger
  const handleTriggerAiTriage = async (customPrompt?: string) => {
    setIsAiLoading(true);
    setCopilotOpen(true);
    setAiOutput(null);
    setAiError(null);
    try {
      const res = await api.runAiCorrelate(customPrompt);
      if (res.success && res.aiOutput) {
        setAiOutput(res.aiOutput);
      } else {
        setAiError('The analysis service returned no summary.');
      }
    } catch (err) {
      console.error('AI correlation failed:', err);
      setAiError(err instanceof Error ? err.message : 'AI analysis failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Delete / Decommission Agent
  const handleDeleteAgent = async (id: string) => {
    if (window.confirm('Confirm decommissioning target device from SOC fleet?')) {
      await api.deleteAgent(id);
      setAiOutput(null);
      refreshAll();
    }
  };

  // Update single event status
  const handleUpdateEventStatus = async (id: string, status: string) => {
    await api.updateEventStatus(id, status);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: status as any } : e));
    refreshAll();
  };

  // Select agent and jump to SIEM log search
  const handleSelectAgentForLogs = (agentId: string) => {
    const ag = agents.find(a => a.id === agentId);
    if (ag) {
      setSiemInitialQuery(ag.hostname);
    }
    setActiveTab('siem');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0E17] text-[#DAE2FD]">
      {/* 56px Persistent Left Vertical Icon Rail */}
      <NavigationRail
        activeTab={activeTab}
        onTabChange={setActiveTab}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => setCopilotOpen(!copilotOpen)}
        criticalCount={metrics?.criticalAlerts || 0}
        onlineCount={metrics?.onlineEndpoints ?? 0}
      />

      {/* Main Analytical Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Universal Top Header */}
        <HeaderBar
          metrics={metrics}
          onOpenAddDevice={() => setAddDeviceModalOpen(true)}
          onTriggerAiTriage={() => handleTriggerAiTriage()}
          onRefresh={refreshAll}
          isAiLoading={isAiLoading}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5">
          {syncError && (
            <div role="alert" className="mb-4 rounded border border-[#EF4444]/60 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#FCA5A5]">
              Target data could not be refreshed: {syncError}
            </div>
          )}
          {activeTab === 'cockpit' && (
            <OverviewCockpit
              metrics={metrics}
              events={events}
              onOpenAddDevice={() => setAddDeviceModalOpen(true)}
              onNavigateToTab={setActiveTab}
              onTriggerAiTriage={() => handleTriggerAiTriage()}
            />
          )}

          {activeTab === 'endpoints' && (
            <DeviceManager
              agents={agents}
              events={events}
              onOpenAddDevice={() => setAddDeviceModalOpen(true)}
              onDeleteAgent={handleDeleteAgent}
              onSelectAgentForLogs={handleSelectAgentForLogs}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === 'siem' && (
            <SiemExplorer
              events={events}
              onUpdateEventStatus={handleUpdateEventStatus}
              initialQuery={siemInitialQuery}
            />
          )}

          {activeTab === 'graph' && (
            <AttackGraph agents={agents} events={events} />
          )}

          {activeTab === 'mitre' && (
            <MitreMatrix events={events} />
          )}
        </main>
      </div>

      {/* Expandable Right AI Co-Pilot / Triage Inspector (Spanning 4-5 cols) */}
      <AiCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        aiOutput={aiOutput}
        error={aiError}
        isLoading={isAiLoading}
        onRunCustomQuery={(q) => handleTriggerAiTriage(q)}
      />

      {/* Add Target Device Modal with Auto-connect Scripts */}
      <AddDeviceModal
        isOpen={addDeviceModalOpen}
        onClose={() => setAddDeviceModalOpen(false)}
      />
    </div>
  );
}
