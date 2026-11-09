import React, { useMemo, useState } from 'react';
import { Grid } from 'lucide-react';
import { SecurityEvent } from '../types/soc';

interface MitreMatrixProps {
  events: SecurityEvent[];
}

export const MitreMatrix: React.FC<MitreMatrixProps> = ({ events }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const techniques = useMemo(() => {
    const byTechnique = new Map<string, {
      id: string;
      tactic: string;
      events: SecurityEvent[];
      targets: Set<string>;
    }>();

    for (const event of events) {
      const current = byTechnique.get(event.mitreTechnique) ?? {
        id: event.mitreTechnique,
        tactic: event.mitreTactic,
        events: [],
        targets: new Set<string>()
      };
      current.events.push(event);
      current.targets.add(event.hostname);
      byTechnique.set(event.mitreTechnique, current);
    }

    return Array.from(byTechnique.values()).sort((a, b) => a.tactic.localeCompare(b.tactic) || a.id.localeCompare(b.id));
  }, [events]);

  const selected = techniques.find(technique => technique.id === selectedTechnique);

  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-[#6366F1]" />
          <h1 className="text-base font-semibold text-[#F8FAFC]">MITRE ATT&CK Observed in Target Events</h1>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1">
          Only techniques and tactics explicitly reported by registered targets are listed. No-hit techniques are omitted.
        </p>
      </div>

      {techniques.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-8 text-center text-sm text-slate-500">
          No target-reported events include MITRE ATT&CK mappings.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {techniques.map(technique => (
            <button
              key={technique.id}
              type="button"
              onClick={() => setSelectedTechnique(selectedTechnique === technique.id ? null : technique.id)}
              className={`text-left bg-[#0F172A] border rounded-lg p-4 transition-colors ${
                selectedTechnique === technique.id ? 'border-[#6366F1]' : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-[#C0C1FF]">{technique.id}</span>
                <span className="text-xs text-[#94A3B8]">{technique.events.length} event(s)</span>
              </div>
              <div className="mt-2 text-sm text-[#F8FAFC]">{technique.tactic}</div>
              <div className="mt-2 text-xs text-[#94A3B8]">
                Targets: {Array.from(technique.targets).join(', ')}
              </div>
              <div className="mt-3 text-xs text-[#DAE2FD] line-clamp-2">
                {technique.events[0].title}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <section className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">
            {selected.id} · {selected.tactic}
          </h2>
          {selected.events.map(event => (
            <div key={event.id} className="border-t border-slate-800 pt-3">
              <div className="flex flex-wrap justify-between gap-2 text-xs">
                <span className="text-[#DAE2FD]">{event.title}</span>
                <span className="text-[#94A3B8]">{event.hostname} · {event.timestamp.replace('T', ' ').substring(0, 19)} UTC</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
