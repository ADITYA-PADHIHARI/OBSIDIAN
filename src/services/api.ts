import { TargetAgent, SecurityEvent, SocMetrics, AiCorrelationOutput } from '../types/soc';

export const api = {
  async getMetrics(): Promise<SocMetrics> {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async getAgents(): Promise<{ agents: TargetAgent[]; total: number; onlineCount: number }> {
    const res = await fetch('/api/agents');
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async registerAgent(payload: Partial<TargetAgent>): Promise<{ success: boolean; agent: TargetAgent }> {
    const res = await fetch('/api/agents/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to register agent');
    return res.json();
  },

  async deleteAgent(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/agents/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete agent');
    return res.json();
  },

  async getEvents(params?: { q?: string; severity?: string; agentId?: string; limit?: number }): Promise<{
    events: SecurityEvent[];
    totalMatched: number;
    totalIngested: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.severity) searchParams.set('severity', params.severity);
    if (params?.agentId) searchParams.set('agentId', params.agentId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const res = await fetch(`/api/events?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async updateEventStatus(id: string, status: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update event status');
    return res.json();
  },

  async runAiCorrelate(customPrompt?: string): Promise<{ success: boolean; aiOutput: AiCorrelationOutput; source: string }> {
    const res = await fetch('/api/ai/correlate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customPrompt })
    });
    if (!res.ok) throw new Error('Failed to run AI correlation');
    return res.json();
  }
};
