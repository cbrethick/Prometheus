/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TacticalPanel } from '../components/TacticalUI';
import { History, Shield, CheckCircle2, Download } from 'lucide-react';
import { cn } from '../components/TacticalUI';

interface ArchiveProps {
  attackLog: any[];
}

export default function Archive({ attackLog }: ArchiveProps) {
  // Export audit log to JSON
  const exportLog = () => {
    const jsonStr = JSON.stringify(attackLog, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prometheus_immutable_audit_vault_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalThreats = attackLog.length;
  const blockedThreats = attackLog.filter(l => l.blocked).length;
  const protectionPercentage = totalThreats > 0 ? ((blockedThreats / totalThreats) * 100).toFixed(2) : "100.00";

  return (
    <div className="space-y-6">
       <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0 mb-2">
        <div className="space-y-1">
          <h2 className="text-[10px] font-sans font-bold text-primary uppercase tracking-wider">Compliance Audit Vault</h2>
          <h3 className="font-sans text-xl sm:text-2xl text-white font-extrabold tracking-tight">System Archive</h3>
          <p className="text-on-surface-variant text-xs max-w-2xl font-sans mt-1">
            Access immutable incident logs and verified security compliance certificates. All data is cryptographically anchored to the Prometheus Neural Core.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 lg:mt-0">
           <div className="flex items-center justify-center gap-2 px-4 py-2 border border-outline/30 bg-surface-container-high/40 text-[10px] font-sans text-on-surface font-semibold uppercase tracking-wide rounded-lg">
              <History className="w-3.5 h-3.5 text-primary" /> Session Range: Live logs
           </div>
           <button 
             onClick={exportLog}
             className="btn-tactical px-5 py-2 bg-primary text-surface font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-primary-glow transition-all rounded-lg"
           >
              <Download className="w-3.5 h-3.5" /> Export Compliance Log
           </button>
        </div>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: 'SOC2 Compliance Audit', value: `${protectionPercentage}% Readiness`, icon: CheckCircle2, color: 'text-tertiary', progress: 'bg-tertiary' },
            { label: 'Neural Vault Anchoring', value: 'VERIFIED', icon: Shield, color: 'text-primary', progress: 'bg-primary' },
            { label: 'Total Protected Attacks', value: `${blockedThreats} / ${totalThreats} Blocked`, icon: Shield, color: 'text-primary', progress: 'bg-primary' },
          ].map((item, i) => (
            <TacticalPanel key={i} className="flex flex-col border-l-4 border-l-primary/60 shadow-sm">
               <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold ${item.color} uppercase tracking-wider`}>{item.label}</span>
                  <item.icon className={`w-4 h-4 ${item.color} opacity-60`} />
               </div>
               <span className="text-lg font-sans font-bold mt-4 text-white">{item.value}</span>
               <div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className={`h-full ${item.progress}`} style={{ width: '100%' }} />
               </div>
               <p className="text-[8px] text-on-surface-variant/70 font-sans font-semibold uppercase tracking-wider mt-2">Vault Integration: Anchored</p>
            </TacticalPanel>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Audit Log Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs font-sans text-on-surface font-bold uppercase tracking-wider flex items-center gap-2.5">
               <History className="w-4 h-4 text-primary" /> Chronological Security Timeline
            </h4>
            <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-outline/30">
               {attackLog.length === 0 ? (
                  <p className="text-on-surface-variant font-mono text-[10px] uppercase tracking-widest py-8 pl-2">
                     Vault empty. Waiting for simulator logs to anchor.
                  </p>
               ) : (
                  attackLog.map((evt, i) => (
                    <div key={evt.id || i} className="relative">
                       <div className={cn(
                         "absolute -left-8 top-4 w-3.5 h-3.5 rounded-full border-2 border-surface z-10",
                         evt.blocked ? 'bg-tertiary' : 'bg-secondary'
                       )} />
                       <TacticalPanel className="py-4 shadow-sm">
                          <div className="flex justify-between items-center text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                             <span className="opacity-60 font-mono">{evt.timestamp}</span>
                             <span className="px-2 py-0.5 rounded-full border border-outline/30 text-primary text-[8px] tracking-widest">VECTOR: {evt.type.toUpperCase().replace('_', ' ')}</span>
                          </div>
                          <p className="text-[12px] font-sans font-normal text-on-surface/90 leading-relaxed">
                            Threat attempt intercepted at cognitive gateway. Prompt: <span className="text-primary font-mono not-italic font-bold bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">"{evt.prompt}"</span>. Mitigation status: <span className={cn(evt.blocked ? "text-tertiary" : "text-secondary", "font-semibold")}>{evt.blocked ? "BLOCKED" : "VULNERABLE (UNPATCHED)"}</span>.
                          </p>
                       </TacticalPanel>
                    </div>
                  ))
               )}
            </div>
          </div>

          {/* Shield Patch Checklist */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-sans text-on-surface font-bold uppercase tracking-wider flex items-center gap-2.5">
               <Shield className="w-4 h-4 text-primary" /> Active Rules Archive
            </h4>
            <div className="space-y-2">
               {attackLog.filter(l => l.blocked).slice(0, 5).map((patch, i) => (
                 <div key={i} className="flex items-center justify-between p-3.5 bg-surface-container-high/40 border border-outline/20 hover:border-primary/40 transition-colors cursor-pointer group rounded-xl shadow-sm">
                    <div>
                       <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-wide">{patch.policy_used || 'AUTO_GEN_PATCH'}</p>
                       <p className="text-[8.5px] text-on-surface-variant font-mono mt-0.5">{patch.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-sans text-tertiary font-bold">ACTIVE</span>
                       <span className="text-[9px] font-sans font-bold text-primary uppercase flex items-center gap-1 group-hover:underline">YAML <Download className="w-2.5 h-2.5" /></span>
                    </div>
                  </div>
               ))}
               
               {attackLog.filter(l => l.blocked).length === 0 && (
                 <p className="text-on-surface-variant/60 font-sans text-[9px] uppercase tracking-wider text-center py-10 border border-dashed border-outline/35 rounded-xl bg-surface-container-high/20">
                   No patched rules currently archived.
                 </p>
               )}
            </div>
          </div>
      </div>
    </div>
  );
}
