import React from 'react';
import { Share2 } from 'lucide-react';
import { SecurityEvent, TargetAgent } from '../types/soc';

interface AttackGraphProps {
  agents: TargetAgent[];
  events: SecurityEvent[];
}

export const AttackGraph: React.FC<AttackGraphProps> = ({ agents, events }) => (
  <div className="space-y-4">
    <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <Share2 className="w-5 h-5 text-[#8B5CF6]" />
        <h1 className="text-base font-semibold text-[#F8FAFC]">Target Event Relationships</h1>
      </div>
      <p className="text-xs text-[#94A3B8] mt-1">
        Flows below come only from events reported by registered targets. A destination is not a threat verdict.
      </p>
    </div>

    {agents.length === 0 ? (
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-8 text-center text-sm text-slate-500">
        No target systems are registered.
      </div>
    ) : events.length === 0 ? (
      <div className="space-y-3">
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 text-sm text-slate-400">
          No events have been reported by these targets.
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agents.map(agent => (
            <div key={agent.id} className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
              <div className="font-semibold text-[#F8FAFC]">{agent.hostname}</div>
              <div className="mt-1 text-xs font-mono text-[#94A3B8]">{agent.ip}</div>
              <div className="mt-3 text-xs text-[#94A3B8]">Heartbeat status: {agent.status}</div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-[#F8FAFC]">{event.title}</div>
              <span className="text-[10px] uppercase font-mono text-[#C0C1FF]">
                {event.severity} · {event.timestamp.replace('T', ' ').substring(0, 19)} UTC
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
              <div className="rounded border border-[#6366F1]/60 bg-[#131B2E] px-3 py-2">
                <div className="text-[10px] text-[#94A3B8]">REGISTERED TARGET · {event.hostname}</div>
                <div className="mt-1 text-[#DAE2FD]">{event.sourceIp}</div>
              </div>
              <span className="text-[#8B5CF6]" aria-label="reported destination">→</span>
              <div className="rounded border border-slate-700 bg-[#0A0E17] px-3 py-2">
                <div className="text-[10px] text-[#94A3B8]">REPORTED DESTINATION</div>
                <div className="mt-1 text-[#DAE2FD]">
                  {event.destinationIp ?? '—'}{event.destinationPort === null ? '' : `:${event.destinationPort}`}
                </div>
              </div>
              <span className="text-[#94A3B8]">{event.protocol ?? '—'} · {event.mitreTechnique}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
