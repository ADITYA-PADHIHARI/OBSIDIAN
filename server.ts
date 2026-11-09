import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'crypto';
import { isIP } from 'net';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI if key available
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI();
}

export interface TargetAgent {
  id: string;
  hostname: string;
  ip: string;
  os: 'linux' | 'windows' | 'macos' | 'kubernetes';
  osVersion: string;
  agentVersion: string;
  status: 'active' | 'offline';
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
  severity: 'critical' | 'high' | 'medium' | 'low';
  agentId: string;
  hostname: string;
  sourceIp: string;
  destinationIp: string | null;
  destinationPort: number | null;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'SSH' | 'HTTP' | 'DNS' | 'SMB' | null;
  category: 'authentication' | 'process_injection' | 'network_anomaly' | 'privilege_escalation' | 'file_integrity' | 'c2_beacon';
  title: string;
  mitreTechnique: string;
  mitreTactic: string;
  rawPayload: Record<string, any>;
  status: 'new' | 'investigating' | 'contained' | 'resolved';
}

// In-memory SOC state contains only targets registered during this server run.
const agents: Map<string, TargetAgent> = new Map();
const events: SecurityEvent[] = [];
const isAgentOnline = (agent: TargetAgent) =>
  Number.isFinite(Date.parse(agent.lastHeartbeat)) &&
  Date.now() - Date.parse(agent.lastHeartbeat) <= 45_000;

// --- AGENT SCRIPT INSTALLATION ENDPOINTS ---

/**
 * Returns an installer for a persistent Linux VM heartbeat service.
 */
app.get('/api/agent/install.sh', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const serverUrl = `${protocol}://${host}`;

  const bashScript = `#!/usr/bin/env bash
set -euo pipefail

SERVER_URL="${serverUrl}"
INSTALL_DIR="/opt/obsidian-sentinel-vm"
INSTALL_PATH="$INSTALL_DIR/agent.sh"
STATE_DIR="/var/lib/obsidian-sentinel-vm"
SERVICE_PATH="/etc/systemd/system/obsidian-sentinel-vm.service"

if [ "\${1:-}" = "--agent" ]; then
    AGENT_ID=$(cat "$STATE_DIR/agent-id")
    OS_VERSION=$(. /etc/os-release 2>/dev/null; printf '%s' "\${PRETTY_NAME:-$(uname -sr)}")
    while true; do
        HOSTNAME=$(hostname -f 2>/dev/null || hostname)
        IP_ADDR=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i=1; i<=NF; i++) if ($i == "src") {print $(i+1); exit}}')
        if [ -z "$IP_ADDR" ]; then
            IP_ADDR=$(ip -4 -o addr show scope global 2>/dev/null | awk 'NR==1 {split($4, a, "/"); print a[1]}')
        fi

        if [ -n "$IP_ADDR" ]; then
            HEARTBEAT=$(python3 -c 'import json,sys; print(json.dumps({"id":sys.argv[1],"hostname":sys.argv[2],"ip":sys.argv[3],"osVersion":sys.argv[4]}))' \\
                "$AGENT_ID" "$HOSTNAME" "$IP_ADDR" "$OS_VERSION")
            STATUS=$(curl --silent --output /dev/null --write-out "%{http_code}" \\
                -X POST "$SERVER_URL/api/agents/heartbeat" \\
                -H "Content-Type: application/json" -d "$HEARTBEAT" 2>/dev/null || true)

            if [ "$STATUS" = "404" ]; then
                REGISTRATION=$(python3 -c 'import json,sys; print(json.dumps({"id":sys.argv[1],"hostname":sys.argv[2],"ip":sys.argv[3],"os":"linux","osVersion":sys.argv[4],"agentVersion":"sentinel-vm-heartbeat","group":"Virtual-Machines","tags":["vm","linux"]}))' \\
                    "$AGENT_ID" "$HOSTNAME" "$IP_ADDR" "$OS_VERSION")
                REGISTER_STATUS=$(curl --silent --output /dev/null --write-out "%{http_code}" \\
                    -X POST "$SERVER_URL/api/agents/register" \\
                    -H "Content-Type: application/json" -d "$REGISTRATION" 2>/dev/null || true)
                if [ "$REGISTER_STATUS" != "201" ]; then
                    echo "VM registration failed (HTTP \${REGISTER_STATUS:-unreachable})." >&2
                fi
            elif [ "$STATUS" = "000" ]; then
                echo "Obsidian Sentinel manager is unreachable: $SERVER_URL" >&2
            elif [ "$STATUS" != "200" ]; then
                echo "VM heartbeat failed (HTTP $STATUS)." >&2
            fi
        else
            echo "Could not detect a VM IPv4 address." >&2
        fi
        sleep 15
    done
fi

if [ "$(id -u)" -ne 0 ]; then
    echo "Run this installer as root (for example: download it, then use sudo bash)." >&2
    exit 1
fi
for command in curl ip python3 systemctl; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Missing required command: $command" >&2
        exit 1
    fi
done
curl --fail --silent --show-error "$SERVER_URL/api/agents" >/dev/null

mkdir -p "$INSTALL_DIR" "$STATE_DIR"
if [ ! -s "$STATE_DIR/agent-id" ]; then
    cat /proc/sys/kernel/random/uuid > "$STATE_DIR/agent-id"
fi
curl --fail --silent --show-error "$SERVER_URL/api/agent/install.sh" -o "$INSTALL_PATH"
chmod 0755 "$INSTALL_PATH"
cat > "$SERVICE_PATH" <<'SERVICE'
[Unit]
Description=Obsidian Sentinel VM heartbeat agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/opt/obsidian-sentinel-vm/agent.sh --agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable --now obsidian-sentinel-vm.service
echo "Obsidian Sentinel VM agent installed and started. It will run after reboot."
`;

  res.setHeader('Content-Type', 'text/x-shellscript');
  res.setHeader('Content-Disposition', 'attachment; filename="sentinel-install.sh"');
  res.send(bashScript);
});

/**
 * Returns an installer for a persistent Windows VM startup task.
 */
app.get('/api/agent/install.ps1', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const serverUrl = `${protocol}://${host}`;

  const psScript = `param([switch]$RunAgent)
$ErrorActionPreference = "Stop"
$ServerUrl = "${serverUrl}"
$InstallDir = Join-Path $env:ProgramData "ObsidianSentinelVm"
$AgentPath = Join-Path $InstallDir "agent.ps1"
$AgentIdPath = Join-Path $InstallDir "agent-id"
$TaskName = "Obsidian Sentinel VM Agent"

if (-not $RunAgent) {
    $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "Run this installer from an elevated PowerShell window inside the Windows VM."
    }

    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    if (-not (Test-Path $AgentIdPath)) {
        [guid]::NewGuid().ToString() | Set-Content -Path $AgentIdPath
    }
    Copy-Item -LiteralPath $PSCommandPath -Destination $AgentPath -Force
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File \`"$AgentPath\`" -RunAgent"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -User "SYSTEM" -RunLevel Highest -Force | Out-Null
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "Obsidian Sentinel VM agent installed. It will start automatically after reboot."
    exit 0
}

$AgentId = "vm-win-" + (Get-Content -Path $AgentIdPath -Raw).Trim()
$Hostname = $env:COMPUTERNAME
$OS = (Get-CimInstance Win32_OperatingSystem).Caption
while ($true) {
    try {
        $IP = Get-NetIPAddress -AddressFamily IPv4 |
            Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and -not $_.SkipAsSource } |
            Select-Object -First 1 -ExpandProperty IPAddress

        if ($IP) {
            $heartbeat = @{
                id = $AgentId
                hostname = $Hostname
                ip = $IP
                osVersion = $OS
            } | ConvertTo-Json -Compress
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/agents/heartbeat" -Method Post -ContentType "application/json" -Body $heartbeat | Out-Null
            } catch {
                if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) {
                    $registration = @{
                        id = $AgentId
                        hostname = $Hostname
                        ip = $IP
                        os = "windows"
                        osVersion = $OS
                        agentVersion = "sentinel-vm-heartbeat"
                        group = "Virtual-Machines"
                        tags = @("vm", "windows")
                    } | ConvertTo-Json -Compress
                    Invoke-RestMethod -Uri "$ServerUrl/api/agents/register" -Method Post -ContentType "application/json" -Body $registration | Out-Null
                } else {
                    throw
                }
            }
        } else {
            Write-Warning "Could not detect a VM IPv4 address."
        }
    } catch {
        Write-Warning "Sentinel VM agent could not reach the manager: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 15
}
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(psScript);
});

// --- REST API ROUTES ---

// Fleet of Agents
app.get('/api/agents', (req: Request, res: Response) => {
  const currentAgents = Array.from(agents.values()).map(agent => {
    return {
      ...agent,
      status: isAgentOnline(agent) ? 'active' as const : 'offline' as const
    };
  });
  res.json({
    agents: currentAgents,
    total: agents.size,
    onlineCount: currentAgents.filter(a => a.status === 'active').length
  });
});

// Register a target after its deployment script runs on that target.
app.post('/api/agents/register', (req: Request, res: Response) => {
  const { id, hostname, ip, os, osVersion, agentVersion, group, tags } = req.body;
  if (
    typeof hostname !== 'string' || !hostname.trim() ||
    typeof ip !== 'string' || !ip.trim() ||
    !['linux', 'windows', 'macos', 'kubernetes'].includes(os) ||
    typeof osVersion !== 'string' || !osVersion.trim()
  ) {
    return res.status(400).json({ error: 'Target hostname, IP address, supported OS, and OS version are required.' });
  }
  const agentId = typeof id === 'string' && id.trim() ? id.trim() : `agt-${randomUUID()}`;
  if (agents.has(agentId)) {
    return res.status(409).json({ error: 'Target agent ID is already registered.' });
  }
  const newAgent: TargetAgent = {
    id: agentId,
    hostname: hostname.trim(),
    ip: ip.trim(),
    os,
    osVersion: osVersion.trim(),
    agentVersion: typeof agentVersion === 'string' && agentVersion.trim() ? agentVersion.trim() : 'unknown',
    status: 'offline',
    cpuUsage: null,
    memoryUsage: null,
    lastHeartbeat: '',
    registeredAt: new Date().toISOString(),
    group: typeof group === 'string' && group.trim() ? group.trim() : 'default',
    tags: Array.isArray(tags) ? tags.filter((tag: unknown): tag is string => typeof tag === 'string') : [],
    eventsReported: 0
  };

  agents.set(newAgent.id, newAgent);
  res.status(201).json({ success: true, agent: newAgent });
});

// Agent Heartbeat
app.post('/api/agents/heartbeat', (req: Request, res: Response) => {
  const { id, cpuUsage, memoryUsage, hostname, ip, osVersion } = req.body;
  if (!id || !agents.has(id)) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const agent = agents.get(id)!;
  if (
    (cpuUsage !== undefined && (typeof cpuUsage !== 'number' || cpuUsage < 0 || cpuUsage > 100)) ||
    (memoryUsage !== undefined && (typeof memoryUsage !== 'number' || memoryUsage < 0 || memoryUsage > 100)) ||
    (hostname !== undefined && (typeof hostname !== 'string' || !hostname.trim())) ||
    (ip !== undefined && (typeof ip !== 'string' || !isIP(ip))) ||
    (osVersion !== undefined && (typeof osVersion !== 'string' || !osVersion.trim()))
  ) {
    return res.status(400).json({ error: 'Invalid heartbeat fields. CPU and memory must be percentages, and host identity fields must be valid.' });
  }
  agent.lastHeartbeat = new Date().toISOString();
  if (typeof cpuUsage === 'number') agent.cpuUsage = cpuUsage;
  if (typeof memoryUsage === 'number') agent.memoryUsage = memoryUsage;
  if (typeof hostname === 'string') agent.hostname = hostname.trim();
  if (typeof ip === 'string') agent.ip = ip;
  if (typeof osVersion === 'string') agent.osVersion = osVersion.trim();
  agent.status = 'active';

  res.json({ success: true, status: agent.status });
});

// Telemetry Event ingestion from target agent
app.post('/api/agents/telemetry', (req: Request, res: Response) => {
  const { agentId, title, severity, category, mitreTechnique, mitreTactic, rawPayload } = req.body;
  const agent = agents.get(agentId);
  if (!agent) return res.status(404).json({ error: 'Registered target agent not found.' });
  if (
    typeof title !== 'string' || !title.trim() ||
    !['critical', 'high', 'medium', 'low'].includes(severity) ||
    !['authentication', 'process_injection', 'network_anomaly', 'privilege_escalation', 'file_integrity', 'c2_beacon'].includes(category) ||
    typeof mitreTechnique !== 'string' || typeof mitreTactic !== 'string' ||
    !rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)
  ) {
    return res.status(400).json({ error: 'Telemetry must include a title, valid severity and category, MITRE fields, and a payload object.' });
  }

  const newEvt: SecurityEvent = {
    id: `EVT-${randomUUID()}`,
    timestamp: new Date().toISOString(),
    severity,
    agentId,
    hostname: agent.hostname,
    sourceIp: agent.ip,
    destinationIp: typeof rawPayload.dest_ip === 'string' ? rawPayload.dest_ip : null,
    destinationPort: typeof rawPayload.dest_port === 'number' ? rawPayload.dest_port : null,
    protocol: ['TCP', 'UDP', 'ICMP', 'SSH', 'HTTP', 'DNS', 'SMB'].includes(rawPayload.protocol)
      ? rawPayload.protocol
      : null,
    category,
    title: title.trim(),
    mitreTechnique,
    mitreTactic,
    rawPayload,
    status: 'new'
  };

  events.unshift(newEvt);
  agent.eventsReported += 1;

  res.status(201).json({ success: true, event: newEvt });
});

// Delete / Decommission agent
app.delete('/api/agents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!agents.has(id)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  agents.delete(id);
  for (let index = events.length - 1; index >= 0; index--) {
    if (events[index].agentId === id) events.splice(index, 1);
  }
  res.json({ success: true });
});

// Get Live Events / SIEM Log Stream with SPL/KQL query filter
app.get('/api/events', (req: Request, res: Response) => {
  const { q, severity, agentId, limit = '100' } = req.query;
  let filtered = events.filter(event => agents.has(event.agentId));

  if (severity && severity !== 'all') {
    filtered = filtered.filter(e => e.severity === severity);
  }

  if (agentId && agentId !== 'all') {
    filtered = filtered.filter(e => e.agentId === agentId);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const query = q.toLowerCase().trim();
    filtered = filtered.filter(e => {
      return (
        e.title.toLowerCase().includes(query) ||
        e.hostname.toLowerCase().includes(query) ||
        e.sourceIp.includes(query) ||
        (e.destinationIp?.includes(query) ?? false) ||
        e.mitreTechnique.toLowerCase().includes(query) ||
        e.mitreTactic.toLowerCase().includes(query) ||
        JSON.stringify(e.rawPayload).toLowerCase().includes(query)
      );
    });
  }

  const parsedLimit = Number.parseInt(limit as string, 10);
  const max = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 100;
  res.json({
    events: filtered.slice(0, max),
    totalMatched: filtered.length,
    totalIngested: events.length
  });
});

// Update event status
app.patch('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const evt = events.find(e => e.id === id);
  if (!evt) return res.status(404).json({ error: 'Event not found' });
  if (status) evt.status = status;
  res.json({ success: true, event: evt });
});

// SOC Operations Cockpit Global Metrics
app.get('/api/metrics', (req: Request, res: Response) => {
  const targetEvents = events.filter(event => agents.has(event.agentId));
  const critCount = targetEvents.filter(e => e.severity === 'critical' && e.status !== 'resolved').length;
  const highCount = targetEvents.filter(e => e.severity === 'high' && e.status !== 'resolved').length;
  const medCount = targetEvents.filter(e => e.severity === 'medium' && e.status !== 'resolved').length;
  const lowCount = targetEvents.filter(e => e.severity === 'low' && e.status !== 'resolved').length;

  const totalTargetEvents = Array.from(agents.values()).reduce((sum, a) => sum + a.eventsReported, 0);
  const recentEvents = targetEvents.filter(event => Date.now() - Date.parse(event.timestamp) < 60_000).length;

  res.json({
    eps: recentEvents / 60,
    totalEndpoints: agents.size,
    onlineEndpoints: Array.from(agents.values()).filter(isAgentOnline).length,
    criticalAlerts: critCount,
    highAlerts: highCount,
    mediumAlerts: medCount,
    lowAlerts: lowCount,
    totalAlerts: critCount + highCount + medCount + lowCount,
    totalTargetEvents
  });
});

// Autonomous AI Co-Pilot & Threat Correlation Engine
app.post('/api/ai/correlate', async (req: Request, res: Response) => {
  const { customPrompt } = req.body;

  // Gather current critical events & affected agents
  const targetEvents = events.filter(event => agents.has(event.agentId));
  const activeAgents = Array.from(agents.values());

  if (targetEvents.length === 0) {
    return res.json({
      success: true,
      source: 'target-telemetry',
      aiOutput: {
        threatSummary: activeAgents.length
          ? 'No security events have been received from the registered targets.'
          : 'No target systems are registered. Add a target to begin collecting data.',
        killChainPhase: 'Not determined',
        blastRadius: [],
        attackPath: [],
        recommendedActions: []
      }
    });
  }

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `        Analyze only the telemetry and registered targets supplied below. Do not invent actors, findings,
        relationships, commands, or assets. Use "Not determined" and empty arrays where data
        does not support a conclusion. Return valid JSON with these keys:
        threatSummary, killChainPhase, blastRadius, attackPath, recommendedActions.
        Do not include executable containment commands.

        Recent Target Events:
        ${JSON.stringify(targetEvents.slice(0, 20), null, 2)}

        Registered Target Context:
        ${JSON.stringify(activeAgents.map(a => ({ host: a.hostname, ip: a.ip, os: a.os, status: isAgentOnline(a) ? 'active' : 'offline' })), null, 2)}

        User Prompt/Focus: ${customPrompt || 'Summarize only the supplied target event evidence.'}

Respond ONLY with valid JSON.`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, aiOutput: parsed, source: 'gemini-2.5-flash' });
      }
      return res.status(502).json({ error: 'AI analysis returned an empty response.' });
    } catch (err: any) {
      console.error('Gemini API call failed:', err?.message);
      return res.status(502).json({ error: 'AI analysis request failed.' });
    }
  }

  // Without an AI provider, summarize only events and targets present in memory.
  const latestEvents = targetEvents.slice(0, 5);
  const heuristicAnalysis = {
    threatSummary: `${targetEvents.length} target event(s) have been received. The five most recent are listed below.`,
    killChainPhase: latestEvents[0]?.mitreTactic || 'Not determined',
    blastRadius: Array.from(new Set(latestEvents.map(event => event.hostname))),
    attackPath: latestEvents.slice().reverse().map(event =>
      `${event.timestamp} — ${event.title} (${event.mitreTechnique}) on ${event.hostname}`
    ),
    recommendedActions: ['Review the received telemetry and verify findings on the affected target systems.']
  };

  res.json({ success: true, aiOutput: heuristicAnalysis, source: 'target-telemetry-summary' });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Obsidian Sentinel] SOC Manager listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
