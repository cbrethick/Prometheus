/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TacticalPanel } from '../components/TacticalUI';
import { motion } from 'motion/react';
import { Shield, Network, Zap, Cpu, Search, Activity, Lock } from 'lucide-react';
import { cn } from '../components/TacticalUI';
import gatewayIllustration from '../assets/ai_security_illustration.png';

interface NetworkGridProps {
  metrics: {
    attacks_total: number;
    attacks_blocked: number;
    attacks_slipped: number;
    policies_generated: number;
    security_score: number;
    risk_level: string;
  };
  agentConfig: {
    name: string;
    provider: string;
    security_mode: string;
    connected: boolean;
  };
}

export default function NetworkGrid({ metrics, agentConfig }: NetworkGridProps) {
  const isOnline = agentConfig.connected;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <TacticalPanel className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8 py-4 lg:py-4">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Protected System Model</span>
          <span className="font-sans text-sm sm:text-base font-bold text-primary truncate max-w-[200px] sm:max-w-none mt-0.5">
            {agentConfig.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-tertiary shadow-tertiary-glow" : "bg-secondary shadow-secondary-glow")} />
           <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Status</span>
            <span className={cn("font-sans text-xs font-semibold", isOnline ? "text-tertiary" : "text-secondary")}>
              {isOnline ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        <div className="lg:ml-auto flex flex-wrap items-center justify-center lg:justify-end gap-6 sm:gap-8 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-outline/30">
           <div className="flex flex-col items-center lg:items-start">
              <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Cognitive Provider</span>
              <span className="font-sans text-xs font-semibold uppercase mt-0.5">{agentConfig.provider}</span>
           </div>
           <div className="flex flex-col items-center lg:items-start">
              <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Mitigation Mode</span>
              <span className="font-sans text-xs font-semibold uppercase text-tertiary mt-0.5">{agentConfig.security_mode}</span>
           </div>
           <div className="px-4 py-2 border border-primary/20 bg-primary/5 rounded-lg shrink-0">
              <span className="text-xs font-semibold font-mono text-primary">
                {isOnline ? "GATEWAY ARMED" : "DISARMED"}
              </span>
           </div>
        </div>
      </TacticalPanel>

      {/* Main Visualization Area */}
      <div className="relative h-[400px] sm:h-[500px] tactical-panel bg-black/20 flex items-center justify-center overflow-hidden group">
         {/* Background Image Asset - Using our gorgeous vector security illustration */}
         <img 
          src={gatewayIllustration} 
          alt="Secure neural firewall illustrations" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.14] group-hover:scale-105 transition-transform duration-[20s]"
         />

         {/* Connection Lines (SVGs) */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.3))' }}>
            {/* Center to Top */}
            <line x1="50%" y1="50%" x2="50%" y2="25%" stroke={isOnline ? "var(--color-tertiary)" : "var(--color-outline)"} strokeWidth="1.5" strokeDasharray="5 5" className={cn(isOnline && "animate-pulse")} />
            {/* Center to Bottom */}
            <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="5 5" className="opacity-50" />
            {/* Center to Right */}
            <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="5 5" className="opacity-50" />
            {/* Center to Left */}
            <line x1="50%" y1="50%" x2="25%" y2="50%" stroke={metrics.attacks_slipped > 0 ? "var(--color-secondary)" : "var(--color-primary)"} strokeWidth="1.5" strokeDasharray="5 5" className="opacity-50" />
         </svg>

         {/* Nodes */}
         <div className="relative w-full h-full">
            {/* Central Prometheus Shield Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={cn(
                  "w-28 h-28 bg-surface-container border flex flex-col items-center justify-center rounded-2xl shadow-[0_0_35px_rgba(168,85,247,0.15)] relative",
                  isOnline ? "border-primary" : "border-outline"
                )}
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-pulse" />
                <Shield className={cn("w-9 h-9 relative z-10", isOnline ? "text-primary animate-pulse" : "text-on-surface-variant")} />
                <span className="mt-2 text-[10px] font-bold text-white tracking-widest uppercase relative z-10">SHIELD</span>
              </motion.div>
            </div>

            {/* Top Node: ShopEasy AI */}
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className={cn(
                 "w-14 h-14 border flex items-center justify-center rounded-xl bg-surface-container-high shadow-md",
                 isOnline ? "border-tertiary" : "border-outline"
               )}>
                  <Activity className={cn("w-5 h-5", isOnline ? "text-tertiary animate-pulse" : "text-on-surface-variant")} />
               </div>
               <span className="mt-2.5 text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">{agentConfig.name}</span>
            </div>

             {/* Bottom Node: Policy Engine */}
             <div className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className="w-14 h-14 bg-surface-container-high border border-outline/30 flex items-center justify-center rounded-xl shadow-md">
                  <Search className="w-5 h-5 text-primary" />
               </div>
               <span className="mt-2.5 text-[9px] font-bold text-primary/70 tracking-widest uppercase">Policy Engine</span>
            </div>

            {/* Left Node: Lobster Trap (Alert) */}
            <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <motion.div 
                 animate={{ opacity: [0.7, 1, 0.7] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className={cn(
                   "w-14 h-14 border flex items-center justify-center rounded-xl bg-surface-container-high shadow-md",
                   metrics.attacks_slipped > 0 ? "border-secondary shadow-secondary-glow" : "border-outline/30"
                 )}
               >
                  <Lock className={cn("w-5 h-5", metrics.attacks_slipped > 0 ? "text-secondary animate-bounce" : "text-primary")} />
               </motion.div>
               <span className="mt-2.5 text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">Lobster Trap DPI</span>
            </div>

            {/* Right Node: Gemini API */}
            <div className="absolute top-1/2 left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className="w-14 h-14 bg-surface-container-high border border-outline/30 flex items-center justify-center rounded-xl shadow-md">
                  <Zap className="w-5 h-5 text-primary animate-pulse" />
               </div>
               <span className="mt-2.5 text-[9px] font-bold text-primary/70 tracking-widest uppercase">Gemini AI</span>
            </div>
         </div>

         {/* Side Labels */}
         <div className="absolute bottom-4 right-6 text-right">
            <p className="text-[9px] text-tertiary font-bold tracking-wider mb-1">RISK LEVEL: {metrics.risk_level}</p>
            <p className="text-[8px] text-on-surface-variant font-mono">MITIGATION DIRECTIVES: {metrics.attacks_blocked}</p>
         </div>
         <div className="absolute top-4 left-6">
            <p className="text-[9px] text-on-surface-variant font-mono">LATENCY MAP :: LIVE</p>
            <p className="text-[8px] text-on-surface-variant/40 font-mono">REF_009 // GRID_ALPHA</p>
         </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Requests Intercepted', value: metrics.attacks_total.toLocaleString(), color: 'text-primary', bar: 'bg-primary' },
          { label: 'Threats Blocked', value: metrics.attacks_blocked.toLocaleString(), color: 'text-tertiary', bar: 'bg-tertiary' },
          { label: 'Security Score', value: `${metrics.security_score}/100`, color: 'text-primary', bar: 'bg-primary', detail: metrics.risk_level },
          { label: 'Policies Active', value: metrics.policies_generated.toString(), color: 'text-on-surface', bar: 'bg-outline', detail: 'ACTIVE' },
        ].map((item, i) => (
          <TacticalPanel key={i}>
            <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">{item.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-2xl font-sans font-bold ${item.color}`}>{item.value}</span>
              {item.detail && <span className={`text-[8px] font-bold ${item.detail === 'LOW' ? 'text-tertiary' : 'text-on-surface-variant'}`}>{item.detail}</span>}
            </div>
            <div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className={`h-full ${item.bar} opacity-60`} style={{ width: `${Math.min(100, Math.max(10, metrics.attacks_total > 0 ? (metrics.attacks_blocked / metrics.attacks_total) * 100 : 0))}%` }} />
            </div>
          </TacticalPanel>
        ))}
      </div>
    </div>
  );
}
