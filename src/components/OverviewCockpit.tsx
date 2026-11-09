import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Server, 
  Terminal, 
  ArrowUpRight, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Wifi,
  ChevronDown
} from 'lucide-react';
import { SocMetrics, SecurityEvent, Severity } from '../types/soc';

interface OverviewCockpitProps {
  metrics: SocMetrics | null;
  events: SecurityEvent[];
  onOpenAddDevice: () => void;
  onNavigateToTab: (tab: 'cockpit' | 'endpoints' | 'siem' | 'graph' | 'mitre') => void;
  onTriggerAiTriage: () => void;
}

export const OverviewCockpit: React.FC<OverviewCockpitProps> = ({
  metrics,
  events,
  onOpenAddDevice,
  onNavigateToTab,
  onTriggerAiTriage
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#EF4444]/15 border border-[#EF4444] text-[#EF4444] text-[10px] font-mono font-bold halo-critical">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] pulsing-dot-critical" />
            <span>CRITICAL</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#F59E0B]/15 border border-[#F59E0B] text-[#F59E0B] text-[10px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span>HIGH</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#06B6D4]/15 border border-[#06B6D4] text-[#06B6D4] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
            <span>MED</span>
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#10B981]/15 border border-[#10B981] text-[#10B981] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>LOW</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Target Device Quick Connection Banner (Direct prompt requirement highlight) */}
      <div className="bg-[#131B2E] border border-slate-700/80 rounded-lg p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-[#10B981]/20 border border-[#10B981] text-[#10B981]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-[#F8FAFC]">
                Add a Linux or Windows machine
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={onOpenAddDevice}
            className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-mono font-bold rounded-sm border border-white/15 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all shrink-0"
          >
            DEPLOY AGENT
          </button>
        </div>
      </div>

      {/* Primary 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {/* Metric 1: Ingestion Velocity */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[11px] font-semibold uppercase">INGESTION VELOCITY</span>
            <Activity className="w-4 h-4 text-[#4CD7F6] animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
              {metrics ? metrics.eps.toFixed(2) : '—'}
            </span>
            <span className="text-xs text-[#4CD7F6]">EPS</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-slate-800">
            <span>Total Ingested:</span>
            <span className="text-[#DAE2FD]">
              {metrics ? `${metrics.totalTargetEvents.toLocaleString()} target events` : '—'}
            </span>
          </div>
        </div>

        {/* Metric 2: Critical & High Threats */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[11px] font-semibold uppercase text-[#EF4444]">CRITICAL THREATS</span>
            <AlertOctagon className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#EF4444] tracking-tight">
              {metrics?.criticalAlerts ?? '—'}
            </span>
            <span className="text-xs text-[#F59E0B]">
              + {metrics?.highAlerts ?? '—'} High Severity
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-slate-800">
            <span>Unresolved target events:</span>
            <span className="text-[#DAE2FD] font-semibold">            {metrics?.totalAlerts ?? '—'}</span>
          </div>
        </div>

        {/* Metric 3: Target Endpoints Fleet */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[11px] font-semibold uppercase">TARGET ENDPOINTS</span>
            <Wifi className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#10B981] tracking-tight">
              {metrics?.onlineEndpoints ?? '—'}
            </span>
            <span className="text-xs text-[#94A3B8]">/ {metrics?.totalEndpoints ?? '—'} Online</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-slate-800">
            <span>Offline targets:</span>
            <span className="text-[#DAE2FD]">
              {metrics ? Math.max(0, metrics.totalEndpoints - metrics.onlineEndpoints) : '—'}
            </span>
          </div>
        </div>

        {/* Metric 4: Events received from registered targets */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[11px] font-semibold uppercase">TARGET EVENTS</span>
            <Activity className="w-4 h-4 text-[#6366F1]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
              {metrics?.totalTargetEvents ?? '—'}
            </span>
            <span className="text-xs text-[#6366F1]">received</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-slate-800">
            <span>Reported in last minute:</span>
            <span className="text-[#C0C1FF]">{metrics ? (metrics.eps * 60).toFixed(0) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Section: Live Telemetry Event Stream */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden">
        {/* Stream Header */}
        <div className="px-4 py-3 bg-[#131B2E] border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 font-mono text-xs">
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
            <span className="font-bold text-[#F8FAFC]">TARGET-REPORTED EVENT STREAM</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#10B981]/20 text-[#10B981] rounded">
              {events.length ? 'TARGET EVENTS' : 'WAITING FOR TARGET DATA'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <button
              onClick={() => onNavigateToTab('siem')}
              className="text-[#C0C1FF] hover:text-white flex items-center space-x-1"
            >
              <span>OPEN EVENT EXPLORER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* High-Density Live Stream Table (32px locked row height) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0A0E17] border-b border-slate-800 text-[10px] text-[#94A3B8] uppercase">
                <th className="py-2 px-3 w-8"></th>
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3">Target Device</th>
                <th className="py-2 px-3">Traffic Path (Src → Dst)</th>
                <th className="py-2 px-3">ATT&CK Technique</th>
                <th className="py-2 px-3">Security Detection Narrative</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No security events have been reported by registered targets.
                  </td>
                </tr>
              )}
              {events.slice(0, 10).map((evt, idx) => {
                const isExpanded = expandedEventId === evt.id;
                return (
                  <React.Fragment key={evt.id}>
                    <tr
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className={`h-8 border-b border-slate-800/60 hover:bg-[#1E293B] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-[#0F172A]' : 'bg-[#131D31]'
                      } ${isExpanded ? 'bg-[#1E293B] border-l-2 border-[#6366F1]' : ''}`}
                    >
                      <td className="py-1 px-3 text-slate-500">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#6366F1]" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </td>
                      <td className="py-1 px-3 whitespace-nowrap text-[11px] text-[#DAE2FD]">
                        {evt.timestamp.replace('T', ' ').substring(11, 23)}
                      </td>
                      <td className="py-1 px-3 whitespace-nowrap">
                        {getSeverityBadge(evt.severity)}
                      </td>
                      <td className="py-1 px-3 whitespace-nowrap text-[11px] font-semibold text-[#F8FAFC]">
                        {evt.hostname}
                      </td>
                      <td className="py-1 px-3 whitespace-nowrap text-[11px] text-[#94A3B8]">
                        <span>{evt.sourceIp}</span>
                        <span className="text-slate-500 px-1">→</span>
                        <span className="text-[#C0C1FF]">
                          {evt.destinationIp ?? '—'}{evt.destinationPort === null ? '' : `:${evt.destinationPort}`}
                        </span>
                        <span className="ml-1.5 px-1 py-0.2 bg-[#0A0E17] text-[9px] text-[#4CD7F6] rounded">
                          {evt.protocol ?? '—'}
                        </span>
                      </td>
                      <td className="py-1 px-3 whitespace-nowrap text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-[#171F33] border border-slate-700 text-[#C0C1FF]">
                          {evt.mitreTechnique}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-[11px] text-[#F8FAFC] truncate max-w-sm">
                        {evt.title}
                      </td>
                    </tr>

                    {/* Expandable JSON drawer */}
                    {isExpanded && (
                      <tr className="bg-[#0A0E17] border-b border-slate-800">
                        <td colSpan={7} className="p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[#6366F1] font-semibold">
                              PAYLOAD INSPECTION: {evt.id} ({evt.category})
                            </span>
                            <span className="text-[#94A3B8]">MITRE Tactic: {evt.mitreTactic}</span>
                          </div>
                          <pre className="p-3 bg-[#060E20] border border-slate-800 rounded font-mono text-[11px] text-[#4CD7F6] overflow-x-auto">
                            {JSON.stringify(evt.rawPayload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
