import React, { useState } from 'react';
import { Check, Copy, Download, Info, Server, Terminal, X } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'linux' | 'windows'>('linux');
  const [managerUrl, setManagerUrl] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.origin
  );
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!isOpen) return null;

  const normalizedManagerUrl = managerUrl.trim().replace(/\/+$/, '');
  let validManagerUrl = false;
  let managerHostname = '';
  try {
    const parsedUrl = new URL(normalizedManagerUrl);
    validManagerUrl = ['http:', 'https:'].includes(parsedUrl.protocol) &&
      !parsedUrl.username && !parsedUrl.password &&
      parsedUrl.pathname === '/' && !parsedUrl.search && !parsedUrl.hash;
    managerHostname = parsedUrl.hostname;
  } catch {
    validManagerUrl = false;
  }
  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(managerHostname);
  const scriptUrl = `${normalizedManagerUrl}/api/agent/install.${platform === 'linux' ? 'sh' : 'ps1'}`;
  const command = platform === 'linux'
    ? `curl -fsSL "${scriptUrl}" -o /tmp/obsidian-sentinel-vm-install.sh && sudo bash /tmp/obsidian-sentinel-vm-install.sh; status=$?; rm -f /tmp/obsidian-sentinel-vm-install.sh; exit $status`
    : `$ErrorActionPreference = 'Stop'; $script = "$env:TEMP\\obsidian-sentinel-vm-install.ps1"; Invoke-WebRequest -UseBasicParsing -Uri "${scriptUrl}" -OutFile $script; & $script`;

  const handleCopy = async () => {
    if (!validManagerUrl || isLoopback) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setCopyError('');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : 'Clipboard access failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-lg w-full max-w-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#131B2E]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F8FAFC]">Add a Linux or Windows machine</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-sm hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="manager-url" className="mb-1 block text-[11px] font-mono text-[#94A3B8]">
              SOC MANAGER ADDRESS REACHABLE FROM THE VM
            </label>
            <input
              id="manager-url"
              type="url"
              value={managerUrl}
              onChange={(event) => setManagerUrl(event.target.value)}
              placeholder="http://192.168.1.20:3000"
              className="w-full rounded-sm border border-slate-700 bg-[#0A0E17] px-3 py-2 text-xs font-mono text-[#DAE2FD] focus:border-[#6366F1] focus:outline-none"
            />
            {isLoopback ? (
              <p className="mt-1 text-[11px] text-[#F59E0B]">
                localhost only points to the VM itself. Enter the computer running this app's LAN IP or a DNS name the VM can reach.
              </p>
            ) : !validManagerUrl ? (
              <p className="mt-1 text-[11px] text-[#EF4444]">
                Enter a valid http:// or https:// manager origin with no path.
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#94A3B8]">
                Make sure the VM can reach this address and the manager port is allowed through the host firewall.
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            {(['linux', 'windows'] as const).map(option => (
              <button
                key={option}
                onClick={() => setPlatform(option)}
                className={`px-3 py-2 rounded-sm border text-xs font-mono uppercase ${
                  platform === option
                    ? 'border-[#6366F1] bg-[#1E293B] text-white'
                    : 'border-slate-700 text-[#94A3B8]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="bg-[#0A0E17] border border-slate-800 rounded-sm p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#C0C1FF]">
                <Terminal className="w-3.5 h-3.5" />
                <span>Run on the target system</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={scriptUrl}
                  download={`sentinel-install.${platform === 'linux' ? 'sh' : 'ps1'}`}
                  aria-disabled={!validManagerUrl || isLoopback}
                  onClick={(event) => { if (!validManagerUrl || isLoopback) event.preventDefault(); }}
                  className={`flex items-center space-x-1 px-2.5 py-1 bg-[#1E293B] border border-slate-700 text-[11px] font-mono text-[#94A3B8] hover:text-white rounded-sm ${!validManagerUrl || isLoopback ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
                <button
                  onClick={handleCopy}
                  disabled={!validManagerUrl || isLoopback}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-[#6366F1] text-white text-[11px] font-mono rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY COMMAND'}</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-[#060E20] border border-slate-800/80 rounded font-mono text-xs text-[#10B981] overflow-x-auto whitespace-pre-wrap select-all">
              {command}
            </pre>
            {copyError && <p className="text-xs text-[#EF4444]">{copyError}</p>}
          </div>

          <p className="text-xs text-[#94A3B8] flex items-start space-x-2">
            <Info className="w-4 h-4 text-[#4CD7F6] shrink-0" />
            <span>
              The Linux installer configures a system service; Windows configures a startup task. Both keep heartbeats running after setup and reboot. Use the same reachable manager address inside the VM; localhost will not reach the host computer.
            </span>
          </p>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-[#0A0E17] flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-mono text-[#94A3B8] bg-[#1E293B] border border-slate-700 rounded-sm">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
