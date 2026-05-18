/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LayoutDashboard, ShieldAlert, Network, Terminal, Archive as ArchiveIcon, Settings as SettingsIcon, Bell, Shield, Lock, Cpu, Menu, X, Globe, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from './types';
import Dashboard from './pages/Dashboard';
import ThreatIntel from './pages/ThreatIntel';
import NetworkGrid from './pages/NetworkGrid';
import NodeOps from './pages/NodeOps';
import Archive from './pages/Archive';
import Settings from './pages/Settings';
import { cn, API_BASE_URL } from './components/TacticalUI';

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { id: 'threat-intel', label: 'Threat Intel', icon: ShieldAlert },
  { id: 'network-grid', label: 'Network Gateway', icon: Network },
  { id: 'node-ops', label: 'Policy Engine', icon: Terminal },
  { id: 'archive', label: 'Audit Archive', icon: ArchiveIcon },
];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('command-center');
  const [isLockdown, setIsLockdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  // Real-time states synchronized via API and WebSockets
  const [wsConnected, setWsConnected] = useState(false);
  const [policiesCount, setPoliciesCount] = useState(0);
  const [activePolicies, setActivePolicies] = useState<any[]>([]);
  const [attackLog, setAttackLog] = useState<any[]>([]);
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  
  const [agentConfig, setAgentConfig] = useState({
    name: 'ShopEasy Support Bot',
    provider: 'gemini',
    api_key: '',
    endpoint: '',
    security_mode: 'autonomous',
    protections: {
      prompt_injection: true,
      data_leak: true,
      admin_escalation: true,
      auto_patch: true,
      threat_logging: true,
    },
    connected: false,
  });

  const [metrics, setMetrics] = useState({
    attacks_total: 0,
    attacks_blocked: 0,
    attacks_slipped: 0,
    policies_generated: 0,
    security_score: 42,
    risk_level: 'HIGH',
    protected_agents: 1,
    timeline: [] as any[],
    threat_types: {} as Record<string, number>,
  });

  // Current threat simulation flow state
  const [currentAttack, setCurrentAttack] = useState<any>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patchDeployed, setPatchDeployed] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', text: 'Welcome to ShopEasy! I am your helpful AI customer support assistant. How can I assist you today?', time: '00:00' }
  ]);

  const addTerminalEntry = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLog(prev => [`[${time}] ${msg}`, ...prev].slice(0, 100));
  };

  // API Methods
  const fetchMetrics = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/metrics/`);
      const data = await r.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/attacks/log`);
      const data = await r.json();
      setAttackLog(data.logs || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const fetchPolicies = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/policies/`);
      const data = await r.json();
      setActivePolicies(data.policies || []);
      setPoliciesCount(data.total || 0);
    } catch (err) {
      console.error("Error fetching policies:", err);
    }
  };

  const onResetDemo = async () => {
    try {
      addTerminalEntry("[SYSTEM] Purging security policies and resetting metrics...");
      const r = await fetch(`${API_BASE_URL}/api/policies/reset`, { method: 'POST' });
      const data = await r.json();
      if (data.status === "reset") {
        addTerminalEntry("[SYSTEM] System state completely reset. Ready for fresh demo.");
        setCurrentAttack(null);
        setCurrentAnalysis(null);
        setPatchDeployed(false);
        setChatMessages([
          { role: 'assistant', text: 'Welcome to ShopEasy! I am your helpful AI customer support assistant. How can I assist you today?', time: '00:00' }
        ]);
        fetchMetrics();
        fetchLogs();
        fetchPolicies();
      }
    } catch (err) {
      addTerminalEntry("[ERROR] Failed to reset demo.");
      console.error(err);
    }
  };

  const onConnectAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addTerminalEntry(`[CONNECTING] Establishing secure bridge to agent "${agentConfig.name}"...`);
      const r = await fetch(`${API_BASE_URL}/api/chat/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentConfig),
      });
      const data = await r.json();
      if (data.status === "connected") {
        setAgentConfig(prev => ({ ...prev, connected: true }));
        setIsConnectModalOpen(false);
        addTerminalEntry(`[SUCCESS] Bridge active. Agent: ${data.agent}. Mode: ${data.mode.toUpperCase()}`);
        fetchMetrics();
      }
    } catch (err) {
      addTerminalEntry("[ERROR] Failed to register agent endpoint.");
      console.error(err);
    }
  };

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activePage]);

  // WebSocket Handshake & Listeners
  useEffect(() => {
    let ws: WebSocket;
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws`;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        addTerminalEntry("[NET] WebSocket secure control feed connected.");
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.event) {
            case "init":
              setMetrics(data.metrics);
              setAttackLog(data.recent_attacks || []);
              setPoliciesCount(data.policies_count || 0);
              setAgentConfig(prev => ({ ...prev, connected: data.connected }));
              break;
            case "agent_connected":
              setAgentConfig(prev => ({
                ...prev,
                connected: true,
                name: data.name,
                security_mode: data.mode
              }));
              addTerminalEntry(`[SYNC] Configured agent successfully. Protection: ${data.mode.toUpperCase()}`);
              break;
            case "attack_fired":
              setMetrics(data.metrics);
              addTerminalEntry(`[RED_TEAM] Attack Fired: ${data.attack_type} (Severity: ${data.severity})`);
              break;
            case "attack_blocked":
              setMetrics(data.metrics);
              addTerminalEntry(`[BLOCK] Threat intercepted by policy: ${data.policy}`);
              break;
            case "gemini_analyzing":
              setIsAnalyzing(true);
              addTerminalEntry(`[ANALYZING] Gemini studying payload for threat vector...`);
              break;
            case "analysis_ready":
              setIsAnalyzing(false);
              addTerminalEntry(`[ANALYSIS] Patch generated. Policy: ${data.policy_name}`);
              break;
            case "patch_deployed":
              setMetrics(data.metrics);
              setPatchDeployed(true);
              addTerminalEntry(`[PATCH] Auto-policy "${data.policy.name}" hot-deployed into active engine!`);
              break;
            case "replay_result":
              setMetrics(data.metrics);
              addTerminalEntry(`[REPLAY] Re-fire test verified: ${data.blocked ? 'BLOCKED ✅' : 'SLIPPED ⚠️'}`);
              break;
          }
          fetchMetrics();
          fetchLogs();
          fetchPolicies();
        } catch (e) {
          console.error("Error parsing WS event", e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        addTerminalEntry("[NET] WebSocket lost. Reconnecting in 3s...");
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'command-center': 
        return (
          <Dashboard 
            metrics={metrics} 
            attackLog={attackLog} 
            activePolicies={activePolicies}
          />
        );
      case 'threat-intel': 
        return (
          <ThreatIntel 
            metrics={metrics}
            attackLog={attackLog}
            activePolicies={activePolicies}
            agentConfig={agentConfig}
            currentAttack={currentAttack}
            setCurrentAttack={setCurrentAttack}
            currentAnalysis={currentAnalysis}
            setCurrentAnalysis={setCurrentAnalysis}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            patchDeployed={patchDeployed}
            setPatchDeployed={setPatchDeployed}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            terminalLog={terminalLog}
            addTerminalEntry={addTerminalEntry}
            fetchLogs={fetchLogs}
            fetchMetrics={fetchMetrics}
            fetchPolicies={fetchPolicies}
          />
        );
      case 'network-grid': 
        return (
          <NetworkGrid 
            metrics={metrics}
            agentConfig={agentConfig}
          />
        );
      case 'node-ops': 
        return (
          <NodeOps 
            activePolicies={activePolicies}
            metrics={metrics}
            addTerminalEntry={addTerminalEntry}
            fetchPolicies={fetchPolicies}
            onResetDemo={onResetDemo}
          />
        );
      case 'archive': 
        return <Archive attackLog={attackLog} />;
      case 'settings': 
        return (
          <Settings 
            agentConfig={agentConfig}
            setAgentConfig={setAgentConfig}
            metrics={metrics}
            onResetDemo={onResetDemo}
            fetchMetrics={fetchMetrics}
            fetchLogs={fetchLogs}
            fetchPolicies={fetchPolicies}
            addTerminalEntry={addTerminalEntry}
          />
        );
      default: 
        return <Dashboard metrics={metrics} attackLog={attackLog} activePolicies={activePolicies} />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-surface flex flex-col transition-all duration-700 font-sans",
      isLockdown && "bg-secondary/10"
    )}>
      {/* Background Scanlines */}
      <div className="scanlines border-none pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 h-16 border-b border-outline/20 bg-surface/85 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-primary hover:bg-primary/10 border border-outline/30"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
             <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
             </div>
             <div className="flex flex-col">
                <h1 className="font-sans text-sm sm:text-base font-bold text-on-surface tracking-tight leading-none truncate max-w-[120px] sm:max-w-none">PROMETHEUS SHIELD</h1>
                <span className="text-[8px] font-semibold text-on-surface-variant uppercase tracking-[0.25em] mt-1.5 hidden xs:block">AI AGENT SECURITY PLATFORM</span>
             </div>
          </div>
          
          <div className="h-8 w-px bg-outline/20 mx-2 hidden lg:block" />
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Gateway Link</span>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", wsConnected ? "bg-tertiary shadow-tertiary-glow" : "bg-secondary shadow-secondary-glow")} />
                  <span className={cn("text-[10px] font-mono font-bold", wsConnected ? "text-tertiary" : "text-secondary")}>
                    {wsConnected ? "ACTIVE" : "OFFLINE"}
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsConnectModalOpen(true)}
            className={cn(
              "btn-tactical px-3 sm:px-4 py-1.5 flex items-center gap-1.5 font-semibold text-xs rounded-lg",
              agentConfig.connected && "border-tertiary/30 bg-tertiary/5 text-tertiary hover:border-tertiary/55 hover:bg-tertiary/8 hover:shadow-tertiary-glow"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", agentConfig.connected ? "bg-tertiary" : "bg-primary")} />
            <span>{agentConfig.connected ? 'Connected' : 'Secure Agent'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-outline/40 bg-surface-container-high/40 rounded-lg text-xs font-semibold text-tertiary">
            <Cpu className="w-3.5 h-3.5" />
            <span>99.98% Protection</span>
          </div>

          <button 
            onClick={() => setIsLockdown(!isLockdown)}
            className={cn(
              "btn-tactical px-3 sm:px-4 py-1.5 flex items-center gap-2 font-semibold text-xs rounded-lg !bg-transparent !border-secondary !text-secondary hover:!bg-secondary hover:!text-white",
              isLockdown && "!bg-secondary !text-white animate-pulse shadow-secondary-glow"
            )}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isLockdown ? 'Unlock Gateway' : 'Lockdown'}</span>
            <span className="sm:hidden">{isLockdown ? 'Unlock' : 'Lock'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 w-64 border-r border-outline/30 bg-surface-container flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
           <div className="p-5 space-y-1 flex-1 overflow-y-auto">
              <p className="text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-widest pl-4 mb-4">Operations</p>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id as PageId)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all group relative cursor-pointer mb-1",
                    activePage === item.id 
                      ? "text-primary bg-primary/8" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-105", activePage === item.id ? "text-primary" : "text-on-surface-variant")} />
                  <span>{item.label}</span>
                  {activePage === item.id && (
                    <motion.div 
                      layoutId="active-nav"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-primary-glow"
                    />
                  )}
                </button>
              ))}
           </div>

           <div className="p-5 border-t border-outline/30 space-y-4">
              <button
                onClick={() => setActivePage('settings')}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer",
                  activePage === 'settings' 
                    ? "text-primary bg-primary/8" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                )}
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <div className="p-3 bg-surface-container-high/50 border border-outline/30 rounded-lg text-[9px] font-mono text-on-surface-variant/80 leading-relaxed uppercase">
                 <div className="flex justify-between mb-1.5">
                    <span>Engine:</span>
                    <span className="font-semibold text-primary">v1.0-Core</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Mitigation:</span>
                    <span className="font-semibold text-tertiary">Armed</span>
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent relative">
          <div className="p-4 sm:p-6 max-w-full lg:max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer / Info Bar */}
      <footer className="h-auto min-h-[2.5rem] border-t border-outline/30 bg-surface-container/85 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2 sm:py-0 text-[9px] font-mono text-on-surface-variant/80 font-semibold uppercase tracking-wider gap-2 sm:gap-0">
         <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
               <span className={cn("w-1.5 h-1.5 rounded-full", wsConnected ? "bg-tertiary shadow-tertiary-glow animate-pulse" : "bg-secondary")} />
               Core Sync: {wsConnected ? "Online" : "Offline"}
            </div>
            <div>Latency: {wsConnected ? "6ms" : "---"}</div>
            <div>Shield Status: {agentConfig.connected ? "Active" : "Inactive"}</div>
         </div>
         <div className="flex items-center gap-4">
            <div>Security Mode: {agentConfig.security_mode.toUpperCase()}</div>
            <div>UTC: {new Date().toISOString().replace('T', ' ').slice(0, 19)}</div>
         </div>
      </footer>

      {isLockdown && (
        <div className="fixed inset-0 z-[100] pointer-events-none border-[10px] sm:border-[20px] border-secondary/20 animate-pulse" />
      )}

      {/* Connect Agent Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg tactical-panel p-6 bg-surface-container-high border-outline"
            >
              <div className="tactical-border-edge" />
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 border border-primary bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary tracking-tight">CONNECT YOUR AI AGENT</h3>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider mt-0.5">Secure your AI in under 60 seconds</p>
                </div>
              </div>

              <form onSubmit={onConnectAgentSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Agent Name</label>
                    <input 
                      type="text" 
                      required
                      value={agentConfig.name}
                      onChange={e => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. ShopEasy Bot"
                      className="w-full bg-black/50 border border-outline/30 p-2.5 text-xs text-primary font-mono outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">AI Provider</label>
                    <select 
                      value={agentConfig.provider}
                      onChange={e => setAgentConfig(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full bg-black/50 border border-outline/30 p-2.5 text-xs text-primary font-mono outline-none focus:border-primary"
                    >
                      <option value="gemini">Google Gemini AI</option>
                      <option value="openai">OpenAI GPT-4</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="custom">Custom Agent Endpoint</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Gemini API Key</label>
                  <input 
                    type="password"
                    value={agentConfig.api_key}
                    onChange={e => setAgentConfig(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder="AIzaSy... (Free tier works perfectly)"
                    className="w-full bg-black/50 border border-outline/30 p-2.5 text-xs text-primary font-mono outline-none focus:border-primary"
                  />
                  <p className="text-[8px] text-on-surface-variant/70 uppercase">ⓘ Optional. Free key gets real-time self-healing rules. Mock mode used by default if empty.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Endpoint URL (Optional)</label>
                  <input 
                    type="text" 
                    value={agentConfig.endpoint}
                    onChange={e => setAgentConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://api.yoursite.com/chat"
                    className="w-full bg-black/50 border border-outline/30 p-2.5 text-xs text-primary font-mono outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Security Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['basic', 'advanced', 'autonomous'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAgentConfig(prev => ({ ...prev, security_mode: mode }))}
                        className={cn(
                          "py-2 border text-[9px] font-mono font-bold uppercase transition-all tracking-wider",
                          agentConfig.security_mode === mode 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-outline/30 hover:border-primary/30 text-on-surface-variant"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Active Protections</label>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-on-surface-variant">
                    {Object.entries(agentConfig.protections).map(([key, val]) => (
                      <label key={key} className="flex items-center gap-2 p-2 bg-black/30 border border-outline/20 select-none">
                        <input 
                          type="checkbox" 
                          checked={val} 
                          onChange={e => setAgentConfig(prev => ({
                            ...prev, 
                            protections: { ...prev.protections, [key]: e.target.checked }
                          }))}
                          className="accent-primary"
                        />
                        <span className="uppercase">{key.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-white text-surface font-bold py-3.5 mt-4 text-[11px] uppercase tracking-[0.2em] shadow-primary-glow hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  [ ⚡ PROTECT MY AI AGENT ]
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
