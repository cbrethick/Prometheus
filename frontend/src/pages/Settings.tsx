/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TacticalPanel, cn, API_BASE_URL } from '../components/TacticalUI';
import { Settings as SettingsIcon, Shield, Zap, CheckCircle2, RotateCcw, Power } from 'lucide-react';

interface SettingsProps {
  agentConfig: {
    name: string;
    provider: string;
    api_key: string;
    endpoint: string;
    security_mode: string;
    protections: Record<string, boolean>;
    connected: boolean;
  };
  setAgentConfig: React.Dispatch<React.SetStateAction<any>>;
  metrics: any;
  onResetDemo: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchPolicies: () => Promise<void>;
  addTerminalEntry: (msg: string) => void;
}

export default function Settings({
  agentConfig,
  setAgentConfig,
  metrics,
  onResetDemo,
  fetchMetrics,
  fetchLogs,
  fetchPolicies,
  addTerminalEntry
}: SettingsProps) {
  const [saving, setSaving] = useState(false);

  // Connection form submit
  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    addTerminalEntry(`[ENGINE] Updating agent config for "${agentConfig.name}"...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentConfig),
      });
      const data = await response.json();
      
      setSaving(false);
      addTerminalEntry(`[SUCCESS] Configuration synchronized. Protection level: ${data.mode.toUpperCase()}`);
      fetchMetrics();
    } catch (err) {
      setSaving(false);
      addTerminalEntry("[ERROR] Failed to save connection preferences.");
      console.error(err);
    }
  };

  // Toggle single protection
  const handleToggleProtection = async (key: string, currentVal: boolean) => {
    const updatedProtections = {
      ...agentConfig.protections,
      [key]: !currentVal
    };
    
    const updatedConfig = {
      ...agentConfig,
      protections: updatedProtections
    };

    setAgentConfig(updatedConfig);
    addTerminalEntry(`[SHIELD] Counter-measure toggled: "${key.replace('_', ' ')}" to ${!currentVal ? 'ENABLED' : 'DISABLED'}`);

    try {
      await fetch(`${API_BASE_URL}/api/chat/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
      fetchMetrics();
    } catch (err) {
      console.error("Failed to sync protection toggle:", err);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
             <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider">System Preferences</p>
            <h1 className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight text-white mt-0.5">Control Center</h1>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Agent Identity & Connected Core */}
          <TacticalPanel title="Gateway Bridge" subtitle="Sync secure model tokens and API routing settings">
             <form onSubmit={handleSaveConnection} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <p className="text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">System Name</p>
                     <input 
                       type="text" 
                       required
                       value={agentConfig.name}
                       onChange={e => setAgentConfig((prev: any) => ({ ...prev, name: e.target.value }))}
                       className="w-full bg-surface-container/60 border border-outline/30 px-3.5 py-2.5 text-xs font-sans text-on-surface outline-none rounded-lg focus:border-primary transition-all" 
                     />
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">Model Provider</p>
                     <select 
                       value={agentConfig.provider}
                       onChange={e => setAgentConfig((prev: any) => ({ ...prev, provider: e.target.value }))}
                       className="w-full bg-surface-container/60 border border-outline/30 px-3.5 py-2.5 text-xs font-sans text-on-surface outline-none rounded-lg focus:border-primary transition-all"
                     >
                       <option value="gemini">Google Gemini AI</option>
                       <option value="openai">OpenAI GPT-4</option>
                       <option value="claude">Anthropic Claude</option>
                       <option value="custom">Custom API Bridge</option>
                     </select>
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">Secure API Token / Key</p>
                   <input 
                     type="password"
                     value={agentConfig.api_key}
                     onChange={e => setAgentConfig((prev: any) => ({ ...prev, api_key: e.target.value }))}
                     placeholder="AIzaSy... (Unexposed locally)"
                     className="w-full bg-surface-container/60 border border-outline/30 px-3.5 py-2.5 text-xs font-sans text-on-surface outline-none rounded-lg focus:border-primary transition-all" 
                   />
                   <p className="text-[9px] text-on-surface-variant/70">ⓘ Used to query Gemini for real cognitive analysis & self-healing rules. Mock fallback active if empty.</p>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">Direct Endpoint Route</p>
                   <input 
                     type="text"
                     value={agentConfig.endpoint}
                     onChange={e => setAgentConfig((prev: any) => ({ ...prev, endpoint: e.target.value }))}
                     placeholder="https://api.yoursite.com/chat"
                     className="w-full bg-surface-container/60 border border-outline/30 px-3.5 py-2.5 text-xs font-sans text-on-surface outline-none rounded-lg focus:border-primary transition-all" 
                   />
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-primary text-surface text-[10px] font-bold py-3 uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-primary-glow transition-all cursor-pointer rounded-lg mt-2"
                >
                  {saving ? "Synchronizing..." : "Synchronize System settings"}
                </button>
             </form>
          </TacticalPanel>

          {/* Security Intensity */}
          <TacticalPanel title="Shield Protection Mode" subtitle="Adjust real-time packet inspection mitigation levels">
             <div className="mt-4 space-y-2.5">
                {[
                  { id: 'basic', label: 'Basic Shielding', desc: 'Predefined compliance rule patterns only', icon: Shield },
                  { id: 'advanced', label: 'Advanced Defense', desc: 'Enhanced semantic vector threat parser', icon: Shield },
                  { id: 'autonomous', label: 'Autonomous Self-Healing', desc: 'Active Gemini neural threat hot-patch loops', icon: Zap },
                ].map((tier, i) => {
                  const isActive = agentConfig.security_mode === tier.id;
                  return (
                    <div 
                      key={i} 
                      onClick={async () => {
                        const updated = { ...agentConfig, security_mode: tier.id };
                        setAgentConfig(updated);
                        addTerminalEntry(`[SYSTEM] Security level escalated to: ${tier.label.toUpperCase()}`);
                        try {
                          await fetch(`${API_BASE_URL}/api/chat/connect`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updated),
                          });
                          fetchMetrics();
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 border transition-all cursor-pointer group rounded-xl shadow-sm",
                        isActive ? "bg-primary/5 border-primary shadow-primary-glow" : "border-outline/20 hover:border-primary/45 hover:bg-primary/5"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", isActive ? "border-primary" : "border-outline/50")}>
                        {isActive && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-xs font-semibold tracking-wide capitalize", isActive ? "text-primary" : "text-on-surface")}>{tier.label}</p>
                        <p className="text-[9px] text-on-surface-variant/80 mt-0.5">{tier.desc}</p>
                      </div>
                      <tier.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-outline/40")} />
                    </div>
                  );
                })}
             </div>
          </TacticalPanel>
       </div>

       {/* Threat Mitigation Toggles */}
       <TacticalPanel title="Active Safeguards" subtitle="Granular control of cognitive security barrier modules">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-4">
             {Object.entries(agentConfig.protections).map(([key, val]) => (
                <div key={key} className="p-4 bg-surface-container-high/40 border border-outline/20 flex flex-col justify-between h-28 rounded-xl shadow-sm">
                   <div>
                     <p className="text-[10px] font-sans font-bold text-primary uppercase tracking-wide leading-tight">
                       {key.replace('_', ' ')}
                     </p>
                     <p className="text-[7.5px] text-on-surface-variant/70 uppercase mt-1">Inspection: {val ? 'Active' : 'Bypassed'}</p>
                   </div>
                   <div className="flex items-center justify-between mt-auto">
                      <span className={`text-[8.5px] font-bold uppercase tracking-wider ${val ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                        {val ? 'PROTECTED' : 'DISABLED'}
                      </span>
                      <div 
                        onClick={() => handleToggleProtection(key, val)}
                        className={cn("w-9 h-5 rounded-full p-0.5 transition-colors relative cursor-pointer", val ? "bg-tertiary" : "bg-outline/30")}
                      >
                         <div className={cn("w-4 h-4 rounded-full bg-surface-container-high shadow transition-transform", val ? "translate-x-4" : "translate-x-0")} />
                      </div>
                   </div>
                </div>
             ))}
             
             {/* Readonly stats block inside the grid for visual balance */}
             <div className="p-4 bg-surface-container-high/20 border border-dashed border-outline/30 flex flex-col justify-center items-center h-28 rounded-xl">
                <span className="text-[9px] font-sans font-bold text-on-surface-variant/80 uppercase tracking-wider text-center">Threat Capture</span>
                <span className="text-xl font-sans text-tertiary font-extrabold mt-1">99.98%</span>
             </div>
          </div>
       </TacticalPanel>

       {/* Danger Zone */}
       <TacticalPanel className="border-secondary/35 bg-secondary/5 border-l-4 border-l-secondary" title="Demonstration Protocol Override" subtitle="Reset gateway security shield states">
          <p className="text-[11px] font-sans text-on-surface-variant leading-relaxed max-w-2xl">
             Warning: Executing this protocol resets the compliance in-memory log history, deletes deployed YAML defense directives, and sets the system security score back to 42. Choose this to start a fresh red-team hacker demonstration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
             <button 
               onClick={onResetDemo}
               className="py-3 border border-secondary text-secondary text-[10px] font-bold uppercase tracking-wider hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-lg"
             >
               <RotateCcw className="w-4 h-4 animate-spin [animation-duration:8s]" /> Reset Security Score & Logs (42)
             </button>
             <button 
               onClick={() => {
                 addTerminalEntry("[SYSTEM] Purging compliance log tables...");
                 onResetDemo();
               }}
               className="py-3 bg-secondary text-white text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-lg"
             >
               <Power className="w-4 h-4" /> Purge & Suspend System Services
             </button>
          </div>
       </TacticalPanel>
    </div>
  );
}
