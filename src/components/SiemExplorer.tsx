import React, { useState } from 'react';
import { 
  Search, 
  Terminal, 
  Filter, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Download, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Database,
  ExternalLink,
  Layers
} from 'lucide-react';
import { SecurityEvent, Severity } from '../types/soc';

interface SiemExplorerProps {
  events: SecurityEvent[];
  onUpdateEventStatus: (id: string, status: string) => void;
  initialQuery?: string;
}

export const SiemExplorer: React.FC<SiemExplorerProps> = ({
  events,
  onUpdateEventStatus,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h' | 'all'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const queryPresets = Array.from(new Set(events.map((event) => event.category)))
    .map((category) => ({ label: category, query: category }));

  const filteredEvents = events.filter((evt) => {
    if (severityFilter !== 'all' && evt.severity !== severityFilter) return false;
    const age = Date.now() - Date.parse(evt.timestamp);
    if (timeRange === '15m' && age > 15 * 60_000) return false;
    if (timeRange === '1h' && age > 60 * 60_000) return false;
    if (timeRange === '24h' && age > 24 * 60 * 60_000) return false;

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      if (q === 'severity:critical') return evt.severity === 'critical';
      if (q === 'severity:high') return evt.severity === 'high';
      
      const inTitle = evt.title.toLowerCase().includes(q);
      const inHost = evt.hostname.toLowerCase().includes(q);
      const inSrc = evt.sourceIp.includes(q);
      const inDst = evt.destinationIp?.includes(q) ?? false;
      const inTechnique = evt.mitreTechnique.toLowerCase().includes(q);
      const inTactic = evt.mitreTactic.toLowerCase().includes(q);
      const inCategory = evt.category.toLowerCase().includes(q);
      const inRaw = JSON.stringify(evt.rawPayload).toLowerCase().includes(q);

      return inTitle || inHost || inSrc || inDst || inTechnique || inTactic || inCategory || inRaw;
    }
    return true;
  });

  const handleCopyJson = (evt: SecurityEvent) => {
    navigator.clipboard.writeText(JSON.stringify(evt, null, 2));
    setCopiedId(evt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityChip = (severity: Severity) => {
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
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-[#06B6D4]/15 border border-[#06B6D4] text-[#06B6D4] text-[10px] font-mono font-medium">
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

  // Field explorer calculation
  const categoryCounts = filteredEvents.reduce((acc, evt) => {
    acc[evt.category] = (acc[evt.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const protocolCounts = filteredEvents.reduce((acc, evt) => {
    if (evt.protocol) acc[evt.protocol] = (acc[evt.protocol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Top Splunk Query Bar */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#F8FAFC]">
            <Database className="w-4 h-4 text-[#8B5CF6]" />
            <span className="font-semibold">Registered Target Event Search</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[#94A3B8]">TIME WINDOW:</span>
            <div className="flex items-center space-x-1 bg-[#0A0E17] p-0.5 rounded border border-slate-800 text-[11px]">
              {(['15m', '1h', '24h', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2 py-0.5 rounded-xs uppercase ${
                    timeRange === t
                      ? 'bg-[#1E293B] text-[#F8FAFC] font-semibold border border-slate-700'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Field with micro-glow focus state */}
        <div className="relative">
          <div className="absolute left-3 top-2.5 flex items-center space-x-1.5 text-xs font-mono text-[#8B5CF6]">
            <span>$</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search registered-target events by host, address, technique, or payload"
            className="w-full bg-[#0A0E17] border border-slate-700 rounded-sm pl-8 pr-28 py-2 text-xs font-mono text-[#DAE2FD] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-20 top-2.5 text-xs font-mono text-slate-500 hover:text-white"
            >
              CLEAR
            </button>
          )}
          <span className="absolute right-2 top-2 text-[10px] font-mono text-[#94A3B8]">LIVE FILTER</span>
        </div>

        {/* Query Presets and Severity Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-[11px] text-[#94A3B8]">OBSERVED CATEGORIES:</span>
            {queryPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => setQuery(p.query)}
                className="px-2 py-0.5 rounded-sm bg-[#1E293B] hover:bg-[#334155] border border-slate-700/80 text-[11px] text-[#C0C1FF] hover:text-white transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-[#94A3B8]">SEVERITY:</span>
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-mono transition-colors ${
                  severityFilter === sev
                    ? 'bg-[#6366F1] text-white font-bold'
                    : 'bg-[#1E293B] text-[#94A3B8] hover:text-white border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Field Explorer Sidebar + High-Density Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 3 cols: Splunk-style Field Explorer */}
        <div className="lg:col-span-3 space-y-3 font-mono text-xs">
          <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-semibold text-[#F8FAFC]">FIELD EXPLORER</span>
              <span className="text-[10px] text-[#94A3B8]">
                {filteredEvents.length} events
              </span>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-1">
              <div className="text-[10px] text-[#94A3B8] uppercase">event.category</div>
              <div className="space-y-1">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => setQuery(cat)}
                    className="w-full flex items-center justify-between px-2 py-1 bg-[#0A0E17] hover:bg-[#1E293B] rounded-sm text-[11px] text-[#DAE2FD] transition-colors"
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-[10px] text-[#8B5CF6] font-bold">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol Breakdown */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <div className="text-[10px] text-[#94A3B8] uppercase">network.protocol</div>
              <div className="space-y-1">
                {Object.entries(protocolCounts).map(([prot, count]) => (
                  <button
                    key={prot}
                    onClick={() => setQuery(prot)}
                    className="w-full flex items-center justify-between px-2 py-1 bg-[#0A0E17] hover:bg-[#1E293B] rounded-sm text-[11px] text-[#DAE2FD] transition-colors"
                  >
                    <span>{prot}</span>
                    <span className="text-[10px] text-[#4CD7F6] font-bold">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 9 cols: Dense Log Stream Table (32px row height locked) */}
        <div className="lg:col-span-9 bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-[#131B2E] border-b border-slate-800 flex items-center justify-between font-mono text-xs">
            <span className="text-[#F8FAFC] font-semibold">
              Live Ingest Stream ({filteredEvents.length} Matched Telemetry Events)
            </span>
            <span className={`flex items-center space-x-1.5 ${filteredEvents.length ? 'text-[#10B981]' : 'text-slate-500'}`}>
              {filteredEvents.length > 0 && <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />}
              <span>{filteredEvents.length ? 'TARGET EVENTS RECEIVED' : 'WAITING FOR TARGET EVENTS'}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#0A0E17] border-b border-slate-800 text-[10px] text-[#94A3B8] uppercase">
                  <th className="py-2 px-3 w-8"></th>
                  <th className="py-2 px-3">Time (UTC)</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Target Host</th>
                  <th className="py-2 px-3">Flow (Src → Dst:Port)</th>
                  <th className="py-2 px-3">MITRE</th>
                  <th className="py-2 px-3">Security Event Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No security telemetry matched the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt, idx) => {
                    const isExpanded = expandedEventId === evt.id;
                    const isCopied = copiedId === evt.id;

                    return (
                      <React.Fragment key={evt.id}>
                        {/* 32px standard row height */}
                        <tr
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                          className={`h-8 border-b border-slate-800/60 hover:bg-[#1E293B] cursor-pointer transition-colors ${
                            idx % 2 === 0 ? 'bg-[#0F172A]' : 'bg-[#131D31]'
                          } ${isExpanded ? 'bg-[#1E293B] border-l-2 border-[#8B5CF6]' : ''}`}
                        >
                          <td className="py-1 px-3 text-slate-500">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-[#8B5CF6]" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </td>
                          <td className="py-1 px-3 whitespace-nowrap text-[11px] text-[#DAE2FD]">
                            {evt.timestamp.replace('T', ' ').substring(11, 23)}
                          </td>
                          <td className="py-1 px-3 whitespace-nowrap">
                            {getSeverityChip(evt.severity)}
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
                          <td className="py-1 px-3 text-[11px] text-[#F8FAFC] truncate max-w-xs">
                            {evt.title}
                          </td>
                        </tr>

                        {/* Inline Expandable JSON Drawer */}
                        {isExpanded && (
                          <tr className="bg-[#0A0E17] border-b border-slate-800">
                            <td colSpan={7} className="p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="flex items-center space-x-2 text-xs font-mono">
                                  <span className="text-[#8B5CF6] font-bold">{evt.id}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-[#94A3B8]">MITRE Tactic:</span>
                                  <span className="text-[#F8FAFC] font-semibold">{evt.mitreTactic}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-[#94A3B8]">Technique:</span>
                                  <span className="text-[#C0C1FF] font-semibold">{evt.mitreTechnique}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyJson(evt);
                                    }}
                                    className="flex items-center space-x-1 px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-xs text-[#94A3B8] hover:text-white rounded-sm"
                                  >
                                    {isCopied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                    <span>{isCopied ? 'COPIED' : 'COPY JSON'}</span>
                                  </button>
                                  {evt.status !== 'contained' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateEventStatus(evt.id, 'contained');
                                      }}
                                      className="px-2.5 py-1 bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981] text-xs text-[#10B981] rounded-sm font-semibold"
                                    >
                                      MARK CONTAINED
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Formatted JSON Output */}
                              <pre className="p-3 bg-[#060E20] border border-slate-800/80 rounded font-mono text-[11px] text-[#4CD7F6] overflow-x-auto">
                                {JSON.stringify(evt.rawPayload, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
