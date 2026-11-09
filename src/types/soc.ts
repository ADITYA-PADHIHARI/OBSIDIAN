export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AgentStatus = 'active' | 'offline';
export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'SSH' | 'HTTP' | 'DNS' | 'SMB';
export type EventCategory = 
  | 'authentication' 
  | 'process_injection' 
  | 'network_anomaly' 
  | 'privilege_escalation' 
  | 'file_integrity' 
  | 'c2_beacon';

export interface TargetAgent {
  id: string;
  hostname: string;
  ip: string;
  os: 'linux' | 'windows' | 'macos' | 'kubernetes';
  osVersion: string;
  agentVersion: string;
  status: AgentStatus;
  cpuUsage: number | null;
  memoryUsage: number | null;
  lastHeartbeat: string;
  registeredAt: string;
  group: string;
  tags: string[];
  eventsReported: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: Severity;
  agentId: string;
  hostname: string;
  sourceIp: string;
  destinationIp: string | null;
  destinationPort: number | null;
  protocol: Protocol | null;
  category: EventCategory;
  title: string;
  mitreTechnique: string;
  mitreTactic: string;
  rawPayload: Record<string, any>;
  status: 'new' | 'investigating' | 'contained' | 'resolved';
}

export interface SocMetrics {
  eps: number;
  totalEndpoints: number;
  onlineEndpoints: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  totalAlerts: number;
  totalTargetEvents: number;
}

export interface AiCorrelationOutput {
  threatSummary: string;
  killChainPhase: string;
  blastRadius: string[];
  attackPath: string[];
  recommendedActions: string[];
}

export type ViewTab = 'cockpit' | 'endpoints' | 'siem' | 'graph' | 'mitre';
