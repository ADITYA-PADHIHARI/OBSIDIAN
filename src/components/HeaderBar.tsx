import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Plus, 
  Terminal, 
  Sparkles, 
  Wifi, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { SocMetrics } from '../types/soc';

interface HeaderBarProps {
  metrics: SocMetrics | null;
  onOpenAddDevice: () => void;
  onTriggerAiTriage: () => void;
  onRefresh: () => void;
  isAiLoading: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  metrics,
  onOpenAddDevice,
  onTriggerAiTriage,
  onRefresh,
  isAiLoading
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasCritical = (metrics?.criticalAlerts ?? 0) > 0;
  const hasTargets = (metrics?.totalEndpoints ?? 0) > 0;

  return (
    <header className="h-14 bg-[#0F172A] border-b border-slate-800/80 px-4 flex items-center justify-between z-20">
      {/* Left: Branding & Core Sentinel Telemetry */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-2 bg-[#6366F1] rounded-xs" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[15px] tracking-tight text-[#F8FAFC]">
                OBSIDIAN SENTINEL
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#1E293B] border border-slate-700 text-[#C0C1FF]">
                TARGET MONITORING
              </span>
            </div>
          </div>
        </div>

        {/* Global Security Posture Badge */}
        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
          <div className={`px-2.5 py-1 rounded-sm border flex items-center space-x-2 ${
            hasCritical
              ? 'bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444] halo-critical'
              : hasTargets
                ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981] halo-nominal'
                : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasCritical ? 'bg-[#EF4444] pulsing-dot-critical' : hasTargets ? 'bg-[#10B981]' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase">
              {hasCritical
                ? 'CRITICAL TARGET EVENTS REPORTED'
                : metrics === null
                  ? 'WAITING FOR TARGET DATA'
                  : hasTargets
                    ? 'NO UNRESOLVED CRITICAL EVENTS'
                    : 'NO TARGETS REGISTERED'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Live Real-time Telemetry Indicators */}
      <div className="hidden lg:flex items-center space-x-5 text-xs font-mono">
        {/* EPS Ticker */}
        <div className="flex items-center space-x-2 bg-[#0A0E17] px-3 py-1.5 rounded-sm border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-[#4CD7F6] animate-pulse" />
          <span className="text-[#94A3B8]">INGEST:</span>
          <span className="text-[#F8FAFC] font-semibold tracking-wide">
            {metrics ? metrics.eps.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-[#4CD7F6]">EPS</span>
        </div>

        {/* Target Devices Active */}
        <div className="flex items-center space-x-2 bg-[#0A0E17] px-3 py-1.5 rounded-sm border border-slate-800">
          <Wifi className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[#94A3B8]">TARGETS:</span>
          <span className="text-[#10B981] font-semibold">
            {metrics?.onlineEndpoints ?? '—'} ONLINE
          </span>
        </div>

        {/* UTC Clock */}
        <div className="flex items-center space-x-2 bg-[#0A0E17] px-3 py-1.5 rounded-sm border border-slate-800 text-[#94A3B8]">
          <Clock className="w-3.5 h-3.5 text-[#C0C1FF]" />
          <span className="text-[#DAE2FD]">{utcTime}</span>
        </div>
      </div>

      {/* Right: Operational Actions & Target Onboarding Script */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onRefresh}
          title="Force Telemetry Sync"
          className="p-2 rounded-sm bg-[#1E293B] hover:bg-[#334155] border border-slate-700/60 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Autonomous AI Triage Trigger */}
        <button
          onClick={onTriggerAiTriage}
          disabled={isAiLoading}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-all ${
            isAiLoading
              ? 'bg-[#6366F1]/50 text-white cursor-wait'
              : 'bg-[#6366F1] hover:bg-[#4F46E5] text-white border border-white/15 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C0C1FF]" />
          <span>{isAiLoading ? 'CORRELATING...' : 'AI CORRELATE'}</span>
        </button>

        {/* ADD TARGET DEVICE (Requested Feature) */}
        <button
          onClick={onOpenAddDevice}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-mono font-medium bg-[#10B981] hover:bg-[#059669] text-white border border-white/15 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>ADD TARGET DEVICE</span>
        </button>
      </div>
    </header>
  );
};
