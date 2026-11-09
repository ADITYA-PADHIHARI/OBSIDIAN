import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Terminal, 
  Trash2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { TargetAgent, AgentStatus, SecurityEvent } from '../types/soc';

interface DeviceManagerProps {
  agents: TargetAgent[];
  events: SecurityEvent[];
  onOpenAddDevice: () => void;
  onDeleteAgent: (id: string) => void;
  onSelectAgentForLogs: (agentId: string) => void;
  onRefresh: () => void;
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({
  agents,
  events,
  onOpenAddDevice,
  onDeleteAgent,
  onSelectAgentForLogs,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [osFilter, setOsFilter] = useState<'all' | 'linux' | 'windows' | 'macos' | 'kubernetes'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AgentStatus>('all');
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.ip.includes(searchQuery) ||
      agent.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOs = osFilter === 'all' || agent.os === osFilter;
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

    return matchesSearch && matchesOs && matchesStatus;
  });

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#10B981]/10 border border-[#10B981] text-[#10B981] text-[11px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>ACTIVE</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>OFFLINE</span>
          </span>
        );
    }
  };

  const getOsIcon = (os: string) => {
    switch (os) {
      case 'linux': return '🐧';
      case 'windows': return '🪟';
      case 'macos': return '🍏';
      case 'kubernetes': return '☸️';
      default: return '🖥️';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Fleet Telemetry and Add Device Script CTA */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-[#F8FAFC]">
                Registered Target Systems
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 bg-[#1E293B] border border-slate-700 text-[#C0C1FF] rounded-sm">
                Live target data
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Only registered targets appear here. Heartbeats show online status; events and resource usage appear only when the target reports them.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onRefresh}
              className="p-2 rounded-sm bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-[#94A3B8] hover:text-white transition-colors"
              title="Refresh Fleet"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddDevice}
              className="flex items-center space-x-2 px-3.5 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-mono font-semibold rounded-sm border border-white/15 shadow-[0_0_14px_rgba(16,185,129,0.3)] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>DEPLOY TARGET AGENT SCRIPT</span>
            </button>
          </div>
        </div>

        {/* Micro Fleet Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-[#0A0E17] p-2.5 rounded-sm border border-slate-800/80">
            <div className="text-[10px] text-[#94A3B8]">TOTAL TARGETS</div>
            <div className="text-base font-bold text-[#F8FAFC]">{agents.length}</div>
          </div>
          <div className="bg-[#0A0E17] p-2.5 rounded-sm border border-slate-800/80">
            <div className="text-[10px] text-[#10B981]">ONLINE</div>
            <div className="text-base font-bold text-[#10B981]">
              {agents.filter(a => a.status === 'active').length}
            </div>
          </div>
          <div className="bg-[#0A0E17] p-2.5 rounded-sm border border-slate-800/80">
            <div className="text-[10px] text-[#94A3B8]">OFFLINE</div>
            <div className="text-base font-bold text-[#DAE2FD]">
              {agents.filter(a => a.status === 'offline').length}
            </div>
          </div>
          <div className="bg-[#0A0E17] p-2.5 rounded-sm border border-slate-800/80">
            <div className="text-[10px] text-[#C0C1FF]">REPORTED EVENTS</div>
            <div className="text-base font-bold text-[#C0C1FF]">
              {events.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search hostname, IP, group, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0E17] border border-slate-700/80 rounded-sm pl-8 pr-3 py-1.5 text-[#DAE2FD] focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {/* OS Filter */}
          <div className="flex items-center space-x-1 bg-[#0A0E17] p-1 rounded-sm border border-slate-800">
            {(['all', 'linux', 'windows', 'macos', 'kubernetes'] as const).map((os) => (
              <button
                key={os}
                onClick={() => setOsFilter(os)}
                className={`px-2 py-1 rounded-xs uppercase text-[10px] transition-colors ${
                  osFilter === os
                    ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-slate-700'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {os}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AgentStatus | 'all')}
            className="bg-[#0A0E17] border border-slate-700/80 rounded-sm px-2.5 py-1.5 text-[#DAE2FD] text-xs focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="offline">Offline Only</option>
          </select>
        </div>
      </div>

      {/* Target Devices Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#131B2E] border-b border-slate-800 text-[11px] text-[#94A3B8] uppercase">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Target Endpoint</th>
                <th className="py-2.5 px-3">Operating System</th>
                <th className="py-2.5 px-3">Agent Version</th>
                <th className="py-2.5 px-3">Reported Events</th>
                <th className="py-2.5 px-3">Reported Usage</th>
                <th className="py-2.5 px-3">Keepalive</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {agents.length === 0 ? 'No targets are registered. Run the deployment script on a target system to add it.' : 'No registered target systems matched the filters.'}
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent, index) => {
                  const agentEvents = events.filter(event => event.agentId === agent.id);
                  const lastHeartbeat = Date.parse(agent.lastHeartbeat);
                  const heartbeatAgeSeconds = Number.isFinite(lastHeartbeat)
                    ? Math.max(0, Math.floor((Date.now() - lastHeartbeat) / 1000))
                    : null;

                  return (
                    <tr
                      key={agent.id}
                      className={`border-b border-slate-800/60 hover:bg-[#1E293B]/60 transition-colors ${
                        index % 2 === 0 ? 'bg-[#0F172A]' : 'bg-[#131D31]'
                      }`}
                    >
                      {/* Status */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        {getStatusBadge(agent.status)}
                      </td>

                      {/* Endpoint Hostname & IP */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{getOsIcon(agent.os)}</span>
                          <div>
                            <div className="font-semibold text-[#F8FAFC] tracking-tight">
                              {agent.hostname}
                            </div>
                            <div className="text-[11px] text-[#94A3B8] flex items-center space-x-2">
                              <span>{agent.ip}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-[#C0C1FF]">{agent.group}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* OS Version */}
                      <td className="py-2 px-3 whitespace-nowrap text-[#DAE2FD]">
                        <div className="truncate max-w-[180px]" title={agent.osVersion}>
                          {agent.osVersion}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {agent.tags.join(', ')}
                        </div>
                      </td>

                      {/* Reported agent version */}
                      <td className="py-2 px-3 whitespace-nowrap text-[#94A3B8]">
                        <span className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-slate-700/80 text-[10px]">
                          {agent.agentVersion}
                        </span>
                      </td>

                      {/* Events reported by this target */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-[#DAE2FD]">{agentEvents.length}</span>
                        </div>
                        {agentEvents.filter(event => event.status !== 'resolved').length > 0 && (
                          <div className="text-[10px] text-[#F59E0B]">
                            {agentEvents.filter(event => event.status !== 'resolved').length} unresolved
                          </div>
                        )}
                      </td>

                      {/* Telemetry (CPU / RAM) */}
                      <td className="py-2 px-3 whitespace-nowrap text-[11px]">
                        <div className="flex items-center space-x-3 text-[#94A3B8]">
                          <span>CPU: <strong className="text-[#DAE2FD]">{agent.cpuUsage === null ? '—' : `${agent.cpuUsage}%`}</strong></span>
                          <span>RAM: <strong className="text-[#DAE2FD]">{agent.memoryUsage === null ? '—' : `${agent.memoryUsage}%`}</strong></span>
                        </div>
                      </td>

                      {/* Keepalive */}
                      <td className="py-2 px-3 whitespace-nowrap text-[11px] text-[#94A3B8]">
                        <div className="flex items-center space-x-1">
                          <Clock className={`w-3 h-3 ${agent.status === 'active' ? 'text-[#10B981]' : 'text-slate-500'}`} />
                          <span>{heartbeatAgeSeconds === null ? 'No heartbeat' : `${heartbeatAgeSeconds}s ago`}</span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Jump to SIEM Logs */}
                          <button
                            onClick={() => onSelectAgentForLogs(agent.id)}
                            title="Inspect Agent Logs in SIEM Explorer"
                            className="p-1.5 rounded-sm bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-[#94A3B8] hover:text-white transition-colors"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>

                          {/* Decommission */}
                          <button
                            onClick={() => onDeleteAgent(agent.id)}
                            title="Decommission Agent from Fleet"
                            className="p-1.5 rounded-sm hover:bg-[#EF4444]/20 border border-transparent hover:border-[#EF4444]/50 text-slate-500 hover:text-[#EF4444] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
