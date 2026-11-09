import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  AlertTriangle, 
  RefreshCw
} from 'lucide-react';
import { AiCorrelationOutput } from '../types/soc';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  aiOutput: AiCorrelationOutput | null;
  error: string | null;
  isLoading: boolean;
  onRunCustomQuery: (prompt: string) => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  aiOutput,
  error,
  isLoading,
  onRunCustomQuery
}) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onRunCustomQuery(prompt);
    setPrompt('');
  };

  return (
    <aside className="w-full lg:w-[420px] lg:min-w-[420px] h-screen bg-[#0F172A] border-l border-slate-800 flex flex-col z-30 font-mono text-xs shadow-[-10px_0_30px_rgba(0,0,0,0.6)]">
      {/* Copilot Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-[#131B2E]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-sm bg-[#8B5CF6]/20 border border-[#8B5CF6] text-[#8B5CF6] halo-copilot">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[#F8FAFC] tracking-tight flex items-center space-x-2">
              <span>SENTINEL AI CO-PILOT</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#6366F1]/20 border border-[#6366F1] text-[#C4ABFF]">
                TARGET EVENTS
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8]">Analysis of registered-target telemetry</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-sm text-slate-400 hover:text-white hover:bg-[#1E293B]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Copilot Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="relative">
              <RefreshCw className="w-8 h-8 text-[#8B5CF6] animate-spin" />
              <Sparkles className="w-4 h-4 text-[#C0C1FF] absolute -top-1 -right-1" />
            </div>
            <div className="text-xs font-semibold text-[#F8FAFC]">
              Analyzing reported target events...
            </div>
            <p className="text-[11px] text-[#94A3B8] max-w-xs">
              Summarizing only the event data received from registered targets.
            </p>
          </div>
        ) : error ? (
          <div role="alert" className="rounded border border-[#EF4444]/60 bg-[#EF4444]/10 p-3 text-xs text-[#FCA5A5]">
            Analysis failed: {error}
          </div>
        ) : aiOutput ? (
          <>
            {/* Reported tactic */}
            <div className="bg-[#171F33] border border-slate-800 rounded-sm p-3 space-y-2">
              <span className="text-[10px] text-[#94A3B8] uppercase">REPORTED TACTIC</span>
              <div className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                <span>{aiOutput.killChainPhase}</span>
              </div>
            </div>

            {/* Threat Narrative */}
            <div className="bg-[#0A0E17] border border-slate-800 rounded-sm p-3 space-y-1.5">
              <div className="text-[10px] text-[#C4ABFF] font-semibold uppercase flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Target Event Summary</span>
              </div>
              <p className="text-[11px] text-[#DAE2FD] leading-relaxed">
                {aiOutput.threatSummary}
              </p>
            </div>

            {/* Blast Radius Targets */}
            <div className="bg-[#0A0E17] border border-slate-800 rounded-sm p-3 space-y-2">
              <div className="text-[10px] text-[#EF4444] font-semibold uppercase flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Targets in Reported Events ({aiOutput.blastRadius.length})</span>
              </div>
              <div className="space-y-1">
                {aiOutput.blastRadius.map((target, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-[#131B2E] border border-slate-800 text-[11px] text-[#DAE2FD] flex items-center space-x-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                    <span className="truncate">{target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconstructed Attack Path */}
            <div className="bg-[#0A0E17] border border-slate-800 rounded-sm p-3 space-y-2">
              <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">
                Received Event Sequence
              </div>
              <div className="space-y-2">
                {aiOutput.attackPath.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-slate-700 text-[#C0C1FF] text-[9px] font-bold shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="text-[#DAE2FD]">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Tactical Actions */}
            <div className="bg-[#0A0E17] border border-slate-800 rounded-sm p-3 space-y-2">
              <div className="text-[10px] text-[#10B981] font-semibold uppercase">
                Review Guidance
              </div>
              <div className="space-y-1.5">
                {aiOutput.recommendedActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#131B2E] border border-slate-800 space-y-1"
                  >
                    <div className="text-[11px] text-[#F8FAFC]">{action}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
            <p>Run an analysis to summarize telemetry received from registered targets.</p>
          </div>
        )}
      </div>

      {/* Analyst Query Bar */}
      <div className="p-3 border-t border-slate-800 bg-[#131B2E]">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about the received target events..."
            className="w-full bg-[#0A0E17] border border-slate-700 rounded-sm pl-3 pr-9 py-2 text-xs text-[#DAE2FD] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-2 top-2 p-1 text-[#8B5CF6] hover:text-[#C4ABFF] disabled:text-slate-600"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
