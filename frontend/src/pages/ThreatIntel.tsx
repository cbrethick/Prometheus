/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TacticalPanel, cn, API_BASE_URL } from '../components/TacticalUI';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Terminal, Zap, Send, Cpu, Play, Check, AlertOctagon, HelpCircle } from 'lucide-react';

interface ThreatIntelProps {
  metrics: any;
  attackLog: any[];
  activePolicies: any[];
  agentConfig: any;
  currentAttack: any;
  setCurrentAttack: (val: any) => void;
  currentAnalysis: any;
  setCurrentAnalysis: (val: any) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  patchDeployed: boolean;
  setPatchDeployed: (val: boolean) => void;
  chatMessages: any[];
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  terminalLog: string[];
  addTerminalEntry: (msg: string) => void;
  fetchLogs: () => void;
  fetchMetrics: () => void;
  fetchPolicies: () => void;
}

const PREDEFINED_ATTACKS = [
  { id: 'prompt_injection', label: 'Prompt Injection', severity: 'CRITICAL' },
  { id: 'data_leak', label: 'Data Leak Protection', severity: 'HIGH' },
  { id: 'admin_escalation', label: 'Admin Privilege Escalation', severity: 'CRITICAL' },
  { id: 'jailbreak', label: 'Jailbreak Attack', severity: 'HIGH' },
  { id: 'tool_abuse', label: 'Model Tool Abuse', severity: 'MEDIUM' },
];

export default function ThreatIntel({
  metrics,
  attackLog,
  activePolicies,
  agentConfig,
  currentAttack,
  setCurrentAttack,
  currentAnalysis,
  setCurrentAnalysis,
  isAnalyzing,
  setIsAnalyzing,
  patchDeployed,
  setPatchDeployed,
  chatMessages,
  setChatMessages,
  terminalLog,
  addTerminalEntry,
  fetchLogs,
  fetchMetrics,
  fetchPolicies
}: ThreatIntelProps) {
  const [chatTab, setChatTab] = useState<'safe' | 'demo'>('demo');
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [shakingButton, setShakingButton] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typewriterIndex = useRef<number>(0);

  // Typewriter effect state variables
  const [typedCause, setTypedCause] = useState('');
  const [typedSuggestion, setTypedSuggestion] = useState('');
  const [typedYaml, setTypedYaml] = useState('');

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Typewriter effects when analysis arrives
  useEffect(() => {
    if (currentAnalysis) {
      setTypedCause('');
      setTypedSuggestion('');
      setTypedYaml('');
      typewriterIndex.current = 0;
      
      const cause = currentAnalysis.root_cause || '';
      const suggestion = currentAnalysis.suggestion || '';
      const yaml = currentAnalysis.policy_yaml || '';

      // Animate cause
      let cIdx = 0;
      const cInterval = setInterval(() => {
        if (cIdx < cause.length) {
          setTypedCause(prev => prev + cause.charAt(cIdx));
          cIdx++;
        } else {
          clearInterval(cInterval);
          // Start suggestion animation next
          let sIdx = 0;
          const sInterval = setInterval(() => {
            if (sIdx < suggestion.length) {
              setTypedSuggestion(prev => prev + suggestion.charAt(sIdx));
              sIdx++;
            } else {
              clearInterval(sInterval);
              // Start YAML animation last
              let yIdx = 0;
              const yInterval = setInterval(() => {
                if (yIdx < yaml.length) {
                  setTypedYaml(prev => prev + yaml.charAt(yIdx));
                  yIdx += 2; // Speed up code writing slightly
                } else {
                  setTypedYaml(yaml); // Ensure final complete text
                  clearInterval(yInterval);
                }
              }, 10);
            }
          }, 15);
        }
      }, 15);

      return () => {
        clearInterval(cInterval);
      };
    }
  }, [currentAnalysis]);

  // Fire Predefined Attack
  const handleFireAttack = async (attackId: string) => {
    setShakingButton(attackId);
    setTimeout(() => setShakingButton(null), 500);

    setCurrentAttack(null);
    setCurrentAnalysis(null);
    setPatchDeployed(false);

    addTerminalEntry(`[SIMULATOR] Launching simulated attack: "${attackId}"...`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/attacks/fire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_id: attackId }),
      });
      const data = await response.json();

      setCurrentAttack({
        id: attackId,
        prompt: data.prompt,
        response: data.response,
        blocked: data.blocked,
        log_id: data.log_id,
        policy_used: data.policy_used,
      });

      // Insert User Prompt bubble
      const timestamp = new Date().toLocaleTimeString().slice(0, 5);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', text: data.prompt, time: timestamp }
      ]);

      setIsTyping(true);
      
      setTimeout(async () => {
        setIsTyping(false);
        // Insert AI response bubble with metadata styling
        setChatMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            text: data.response, 
            time: timestamp, 
            isBlocked: data.blocked, 
            policyName: data.policy_used,
            isVulnerability: !data.blocked 
          }
        ]);

        fetchMetrics();
        fetchLogs();
        fetchPolicies();

        if (!data.blocked) {
          // Attack slipped! Trigger Gemini Security Analysis automatically
          addTerminalEntry(`[GEMINI] Attack vector bypassed filters. Initializing neural threat inspection...`);
          setIsAnalyzing(true);

          try {
            const analyzeResp = await fetch(`${API_BASE_URL}/api/attacks/analyze`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                attack_id: attackId,
                attack_prompt: data.prompt,
                ai_response: data.response,
              }),
            });
            const analyzeData = await analyzeResp.json();
            
            setCurrentAnalysis(analyzeData.analysis);
            setIsAnalyzing(false);
            addTerminalEntry(`[GEMINI] Threat analysis complete. Security policy rules generated.`);
          } catch (err) {
            setIsAnalyzing(false);
            console.error("Gemini analysis error:", err);
          }
        }
      }, 1000);

    } catch (err) {
      console.error("Attack simulation failed:", err);
    }
  };

  // Deploy Patch Policy
  const handleDeployPatch = async () => {
    if (!currentAttack || !currentAnalysis) return;
    setDeploying(true);
    addTerminalEntry(`[ENGINE] Compiling security policy directives...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/attacks/patch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attack_id: currentAttack.id,
          analysis: currentAnalysis,
        }),
      });
      const data = await response.json();
      
      setDeploying(false);
      setPatchDeployed(true);
      addTerminalEntry(`[ENGINE] Auto-policy "${data.policy.name}" compiled and live deployed.`);
      
      fetchMetrics();
      fetchLogs();
      fetchPolicies();
    } catch (err) {
      setDeploying(false);
      console.error("Policy deploy failed:", err);
    }
  };

  // Replay Attack (WOW MOMENT)
  const handleReplayAttack = async () => {
    if (!currentAttack) return;
    addTerminalEntry(`[REPLAY] Re-firing exact threat vector: "${currentAttack.id}" to verify firewall integrity...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/attacks/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_id: currentAttack.id }),
      });
      const data = await response.json();

      // Show in chatbot
      const timestamp = new Date().toLocaleTimeString().slice(0, 5);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', text: data.prompt, time: timestamp }
      ]);

      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            text: data.response, 
            time: timestamp, 
            isBlocked: data.blocked, 
            policyName: data.policy_used,
            isVulnerability: !data.blocked 
          }
        ]);
        
        fetchMetrics();
        fetchLogs();
        fetchPolicies();
      }, 1000);

    } catch (err) {
      console.error("Attack replay failed:", err);
    }
  };

  // Safe Mode: Send normal messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const msgText = userInput;
    setUserInput('');

    const timestamp = new Date().toLocaleTimeString().slice(0, 5);
    setChatMessages(prev => [
      ...prev,
      { role: 'user', text: msgText, time: timestamp }
    ]);

    setIsTyping(true);

    try {
      const endpoint = `${API_BASE_URL}/api/chat/message`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText }),
      });
      const data = await response.json();

      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.response, time: timestamp }
      ]);
    } catch (err) {
      setIsTyping(false);
      console.error("Normal chat failed:", err);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* LEFT COLUMN: Attack Simulator */}
      <div className="lg:col-span-3 h-full flex flex-col mb-4 lg:mb-0">
        <TacticalPanel className="h-full flex flex-col justify-between" title="Red Team Simulator" refTag="SYS_RED_01">
          <div className="space-y-4 flex-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant">Simulate Threat Vectors</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
              {PREDEFINED_ATTACKS.map((attack) => (
                <button
                  key={attack.id}
                  onClick={() => handleFireAttack(attack.id)}
                  className={`w-full text-left p-3.5 border transition-all duration-200 flex justify-between items-center group relative cursor-pointer ${
                    shakingButton === attack.id ? 'animate-bounce border-secondary/40 bg-secondary/8' : ''
                  } ${
                    currentAttack?.id === attack.id
                      ? 'border-primary bg-primary/8 rounded-xl'
                      : 'border-outline/30 hover:border-primary/50 hover:bg-primary/5 rounded-xl'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold tracking-tight ${currentAttack?.id === attack.id ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                      {attack.label}
                    </span>
                    <span className="text-[9px] font-semibold text-on-surface-variant/70 mt-0.5">{attack.severity} severity</span>
                  </div>
                  <Play className={`w-3.5 h-3.5 shrink-0 ${currentAttack?.id === attack.id ? 'text-primary animate-pulse' : 'text-on-surface-variant/60 group-hover:text-primary'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col border-t border-outline/30 pt-4">
             <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Simulator Console</span>
               <span className="text-[9px] text-on-surface-variant uppercase font-semibold">Session Logs</span>
             </div>
             <div className="h-32 bg-surface-container-high/40 border border-outline/30 p-3.5 font-mono text-[9px] text-tertiary leading-relaxed overflow-y-auto space-y-1.5 rounded-lg">
                {terminalLog.length === 0 ? (
                  <p className="opacity-45">&gt; Awaiting simulation trigger...</p>
                ) : (
                  terminalLog.map((log, idx) => (
                    <p key={idx} className={cn(
                      log.includes('[RED_TEAM]') ? 'text-secondary font-semibold' :
                      log.includes('[BLOCK]') || log.includes('[PATCH]') ? 'text-tertiary font-semibold' :
                      log.includes('[GEMINI]') ? 'text-warning' : 'text-primary/80'
                    )}>{log}</p>
                  ))
                )}
             </div>
          </div>
        </TacticalPanel>
      </div>

      {/* CENTER COLUMN: ShopEasy AI Chatbot */}
      <div className="lg:col-span-6 h-full mb-4 lg:mb-0">
         <div className="relative h-full border border-outline/30 bg-surface-container-high/30 backdrop-blur-md flex flex-col overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.015)_0%,transparent_80%)] pointer-events-none" />

            {/* Chatbot Header */}
            <div className="relative z-10 p-4 border-b border-outline/30 bg-surface-container-high/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm text-white font-bold tracking-tight">ShopEasy AI Assistant</h4>
                  <p className="text-[8px] text-tertiary uppercase font-semibold tracking-wider mt-0.5">Protected by Prometheus Shield</p>
                </div>
              </div>
              
              <div className="flex gap-2 font-sans text-[10px]">
                <button 
                  onClick={() => setChatTab('safe')}
                  className={`px-3 py-1.5 border rounded-lg transition-colors cursor-pointer uppercase font-semibold tracking-wide ${
                    chatTab === 'safe' 
                      ? 'border-tertiary bg-tertiary/10 text-tertiary' 
                      : 'border-outline/30 hover:border-primary/40 text-on-surface-variant'
                  }`}
                >
                  Safe Mode
                </button>
                <button 
                  onClick={() => setChatTab('demo')}
                  className={`px-3 py-1.5 border rounded-lg transition-colors cursor-pointer uppercase font-semibold tracking-wide ${
                    chatTab === 'demo' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-outline/30 hover:border-primary/40 text-on-surface-variant'
                  }`}
                >
                  Demo Mode
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="relative z-10 flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto min-h-[300px]">
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col max-w-[85%] sm:max-w-[75%]",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    {/* Before Patch - Vulnerability Leaked visual */}
                    {msg.isVulnerability ? (
                      <div className="p-3 bg-secondary/5 border border-secondary/30 rounded-xl text-[11px] sm:text-xs">
                        <div className="flex items-center gap-1.5 text-secondary text-[9px] font-sans font-bold uppercase tracking-wider mb-1.5 animate-pulse">
                          <AlertOctagon className="w-3.5 h-3.5" /> Security Vulnerability Exposed
                        </div>
                        <div className="text-secondary font-mono leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      </div>
                    ) : msg.isBlocked ? (
                      // After Patch - Blocked by firewall visual
                      <div className="p-3.5 bg-tertiary/5 border border-tertiary/30 rounded-xl text-[11px] sm:text-xs">
                        <div className="flex items-center gap-1.5 text-tertiary text-[9px] font-sans font-bold uppercase tracking-wider mb-1.5">
                          <Shield className="w-3.5 h-3.5 text-tertiary" /> Mitigation Policy Active
                        </div>
                        <div className="text-tertiary font-sans leading-relaxed">
                          Request rejected due to autonomous security policy: <span className="underline font-bold font-mono">{msg.policyName || "block_injection"}</span>
                        </div>
                      </div>
                    ) : (
                      // Standard safe chat bubbles
                      <div className={cn(
                        "p-3.5 text-xs leading-relaxed border rounded-xl",
                        msg.role === 'user' 
                          ? "bg-primary/10 border-primary/20 text-white" 
                          : "bg-surface-container-high/80 border-outline/25 text-on-surface"
                      )}>
                        {msg.text}
                      </div>
                    )}
                    
                    <span className="mt-1 text-[8px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                      {msg.role === 'user' ? 'OPERATOR' : 'AI_AGENT'} // {msg.time}
                    </span>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-on-surface-variant font-mono text-[10px]">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <span className="uppercase text-[8px] tracking-wider ml-1">Agent thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick action chips */}
            <div className="relative z-10 px-4 py-3 border-t border-outline/20 bg-surface-container-high/40 flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] font-semibold text-on-surface-variant/80 uppercase tracking-wider mr-1">Demo Queries:</span>
              {[
                "Where is my order #10024?",
                "Request a refund.",
                "How do I reset my password?",
                "Track shipment status."
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserInput(query);
                  }}
                  className="text-[9px] font-sans border border-outline/40 px-3 py-1 bg-surface-container/60 hover:border-primary/60 text-on-surface-variant hover:text-white transition-all rounded-full cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Chat Input Area */}
            <div className="relative z-10 p-3 bg-surface-container-high/90 border-t border-outline/30">
               <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={chatTab === 'demo' ? "Select simulated attack buttons on the left..." : "Ask ShopEasy support about orders, refunds..."}
                      className="w-full bg-surface-container/60 border border-outline/30 px-4 py-3 text-xs font-sans text-on-surface placeholder-on-surface-variant/50 focus:border-primary outline-none transition-all pr-10 rounded-lg"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors cursor-pointer">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
               </form>
            </div>
         </div>
      </div>

      {/* RIGHT COLUMN: Gemini Security Analysis */}
      <div className="lg:col-span-3 h-full flex flex-col mb-4 lg:mb-0">
        <TacticalPanel className="h-full flex flex-col justify-between" title="Gemini Security Engine" subtitle="Autonomous Self-Healing Pipeline">
           <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              
              {/* SUB 1: Attack Detected badge */}
              <div className="p-3.5 bg-surface-container-high/50 border border-outline/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans text-on-surface-variant font-semibold uppercase tracking-wider">Incident Scanner</span>
                  {currentAttack ? (
                    <span className={cn(
                      "px-2.5 py-0.5 border rounded-full text-[8px] font-semibold uppercase tracking-wider",
                      currentAttack.blocked ? "bg-tertiary/10 text-tertiary border-tertiary/20" : "bg-secondary/10 text-secondary border-secondary/20 animate-pulse"
                    )}>
                      {currentAttack.blocked ? "SECURED ✓" : "VULNERABLE ⚠️"}
                    </span>
                  ) : (
                    <span className="text-[8px] font-sans text-on-surface-variant/50 italic">STANDBY</span>
                  )}
                </div>
                
                {currentAttack ? (
                  <div className="mt-2.5 space-y-1">
                    <p className="text-xs font-sans font-bold text-secondary flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" /> {currentAttack.id.toUpperCase().replace('_', ' ')} DETECTED
                    </p>
                    <p className="text-[9px] font-mono text-on-surface-variant/80 truncate italic mt-1">
                      "{currentAttack.prompt}"
                    </p>
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-center gap-2 text-on-surface-variant/60 text-[9px] uppercase font-sans font-semibold">
                    <HelpCircle className="w-4 h-4 opacity-50" /> Ready. Trigger simulator to inspect payload.
                  </div>
                )}
              </div>

              {/* SUB 2: Gemini Root Cause */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-warning" /> 1. Threat Analysis Summary
                </span>
                
                <div className="p-3.5 bg-warning/5 border border-warning/15 text-[10px] font-mono leading-relaxed space-y-3 rounded-xl min-h-[100px]">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-warning animate-pulse">
                      <div className="w-3 h-3 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                      <span className="uppercase text-[8px] tracking-wider font-bold">Gemini analyzing payload...</span>
                    </div>
                  ) : currentAnalysis ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[8px] font-bold text-warning/80 block uppercase tracking-wider mb-0.5">Root Cause:</span>
                        <p className="text-on-surface leading-normal text-[10.5px] font-sans font-medium">{typedCause}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-warning/80 block uppercase tracking-wider mb-0.5">Suggested Fix:</span>
                        <p className="text-on-surface leading-normal text-[10.5px] font-sans font-medium">{typedSuggestion}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-on-surface-variant/60 italic flex items-center justify-center py-8 text-[9px] uppercase tracking-wider">Analysis pipeline standby.</p>
                  )}
                </div>
              </div>

              {/* SUB 3: Generated YAML policy */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-tertiary" /> 2. Autonomic Policy Generated
                </span>
                
                <div className="relative group bg-surface-container-high/40 border border-outline/30 p-3.5 font-mono text-[9px] text-tertiary leading-relaxed overflow-x-auto min-h-[140px] max-h-[180px] rounded-xl">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-tertiary animate-pulse">
                      <span className="uppercase text-[8px] tracking-widest font-bold">Auto-compiling rule...</span>
                    </div>
                  ) : typedYaml ? (
                    <pre className="text-tertiary whitespace-pre text-[9.5px] leading-tight font-medium">
                      {typedYaml}
                    </pre>
                  ) : (
                    <p className="text-on-surface-variant/60 italic flex items-center justify-center py-12 text-[9px] uppercase tracking-wider">Directives compiled dynamically.</p>
                  )}
                </div>
              </div>
           </div>

           {/* Deploy Action Area */}
           <div className="mt-4 border-t border-outline/30 pt-4 space-y-2">
              {currentAnalysis && !patchDeployed && (
                <button 
                  onClick={handleDeployPatch}
                  disabled={deploying}
                  className="w-full bg-tertiary text-surface font-semibold py-3 text-[10px] uppercase tracking-wider hover:shadow-tertiary-glow transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-lg"
                >
                  {deploying ? (
                    <>
                      <div className="w-3 h-3 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-surface" /> Hot-Deploy Security Policy
                    </>
                  )}
                </button>
              )}

              {patchDeployed && (
                <div className="space-y-2 animate-in fade-in duration-500">
                  <div className="flex items-center gap-2 p-2 border border-tertiary bg-tertiary/10 text-tertiary text-[9px] font-sans font-bold uppercase tracking-wider justify-center rounded-lg">
                    <Check className="w-4 h-4 text-tertiary" /> Security Rule Live & Armed
                  </div>
                  
                  <button 
                    onClick={handleReplayAttack}
                    className="w-full bg-primary text-surface font-semibold py-3 text-[10px] uppercase tracking-wider hover:shadow-primary-glow transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-lg"
                  >
                    <Play className="w-4 h-4 fill-surface animate-pulse" /> Replay Incident Simulation
                  </button>
                </div>
              )}
           </div>
        </TacticalPanel>
      </div>

    </div>
  );
}
