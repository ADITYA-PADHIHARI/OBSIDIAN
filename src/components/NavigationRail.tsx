import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  Terminal, 
  Share2, 
  Grid, 
  Cpu, 
  Sliders, 
  Radio, 
  FileCode2,
  Sparkles
} from 'lucide-react';
import { ViewTab } from '../types/soc';

interface NavigationRailProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  copilotOpen: boolean;
  onToggleCopilot: () => void;
  criticalCount: number;
  onlineCount: number;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  onTabChange,
  copilotOpen,
  onToggleCopilot,
  criticalCount,
  onlineCount
}) => {
  const navItems = [
    {
      id: 'cockpit' as ViewTab,
      label: 'SOC Cockpit',
      icon: ShieldAlert,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeColor: 'bg-[#EF4444]'
    },
    {
      id: 'endpoints' as ViewTab,
      label: 'Target Devices & Script',
      icon: Server,
      badge: onlineCount,
      badgeColor: 'bg-[#10B981]'
    },
    {
      id: 'siem' as ViewTab,
      label: 'SIEM Log Explorer',
      icon: Terminal
    },
    {
      id: 'graph' as ViewTab,
      label: 'Target Event Relationships',
      icon: Share2,
      glow: true
    },
    {
      id: 'mitre' as ViewTab,
      label: 'MITRE ATT&CK Matrix',
      icon: Grid
    }
  ];

  return (
    <aside className="w-[56px] min-w-[56px] h-screen bg-[#0F172A] border-r border-slate-800/80 flex flex-col items-center py-3 z-30 select-none">
      {/* Brand Sentinel Emblem */}
      <div 
        className="relative group mb-6 cursor-pointer" 
        onClick={() => onTabChange('cockpit')}
        title="Obsidian Sentinel - Tier 3 SOC"
      >
        <div className="w-10 h-10 rounded bg-[#1E293B] border border-[#6366F1]/40 flex items-center justify-center text-[#C0C1FF] hover:border-[#6366F1] transition-all">
          <div className="relative">
            <Radio className="w-5 h-5 text-[#6366F1] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          </div>
        </div>
      </div>

      {/* Main Navigation Icons */}
      <nav className="flex-1 flex flex-col space-y-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`relative w-full h-10 rounded flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#6366F1]/20 text-[#F8FAFC] border border-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#6366F1] rounded-r" />
              )}

              {/* Notification Badge */}
              {item.badge !== undefined && (
                <span
                  className={`absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-mono font-bold text-white rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls: AI Co-pilot toggle & Script Shortcut */}
      <div className="flex flex-col space-y-2 w-full px-2 pt-3 border-t border-slate-800/80">
        <button
          onClick={onToggleCopilot}
          title={copilotOpen ? "Collapse AI Co-Pilot" : "Expand Autonomous AI Co-Pilot"}
          className={`relative w-full h-10 rounded flex items-center justify-center transition-all ${
            copilotOpen
              ? 'bg-[#8B5CF6]/25 text-[#F8FAFC] border border-[#8B5CF6] shadow-[0_0_14px_rgba(139,92,246,0.4)]'
              : 'text-[#C7C4D7] hover:text-white bg-[#171F33] border border-slate-700/60 hover:border-[#8B5CF6]'
          }`}
        >
          <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-ping" />
        </button>

        <a
          href="/api/agent/install.sh"
          download="sentinel-install.sh"
          title="Download Universal Linux Agent Installer Script"
          className="w-full h-10 rounded flex items-center justify-center text-[#94A3B8] hover:text-[#4CD7F6] hover:bg-[#1E293B] border border-transparent transition-all"
        >
          <FileCode2 className="w-5 h-5" />
        </a>
      </div>
    </aside>
  );
};
