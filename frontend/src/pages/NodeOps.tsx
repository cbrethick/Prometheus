/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TacticalPanel, cn, API_BASE_URL } from '../components/TacticalUI';
import { Terminal, Shield, Zap, RotateCcw, Plus, Check } from 'lucide-react';

interface NodeOpsProps {
  activePolicies: any[];
  metrics: {
    attacks_blocked: number;
    policies_generated: number;
  };
  addTerminalEntry: (msg: string) => void;
  fetchPolicies: () => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export default function NodeOps({
  activePolicies,
  metrics,
  addTerminalEntry,
  fetchPolicies,
  onResetDemo
}: NodeOpsProps) {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  
  // Custom manual policy state
  const [manualName, setManualName] = useState('');
  const [manualPattern, setManualPattern] = useState('');
  const [injecting, setInjecting] = useState(false);

  const selectedPolicy = activePolicies.find(p => p.id === selectedPolicyId) || activePolicies[0];

  // Manual Policy deployment handler
  const handleAddManualPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPattern.trim()) return;
    setInjecting(true);
    addTerminalEntry(`[ENGINE] Injecting manual security directive: "${manualName}"...`);

    try {
      const generatedYaml = `version: 1.2
metadata:
  id: POL_${Math.floor(Math.random() * 900 + 100)}_M
  name: ${manualName.toLowerCase()}
  severity: HIGH
rule_logic:
  patterns:
    - "${manualPattern}"
  action: BLOCK`;

      const response = await fetch(`${API_BASE_URL}/api/chat/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      
      // Let's call the backend to register the policy
      const patchResp = await fetch(`${API_BASE_URL}/api/attacks/patch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attack_id: "custom_" + Date.now(),
          analysis: {
            policy_name: manualName.toLowerCase(),
            policy_yaml: generatedYaml
          }
        }),
      });
      const data = await patchResp.json();
      
      setInjecting(false);
      setManualName('');
      setManualPattern('');
      addTerminalEntry(`[SUCCESS] Manual security patch "${data.policy.name}" deployed successfully.`);
      fetchPolicies();
    } catch (err) {
      setInjecting(false);
      addTerminalEntry("[ERROR] Failed to compile manual regex directive.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Policies', value: activePolicies.length.toString(), sub: 'Live directives', icon: Shield },
          { label: 'Blocked Threats', value: metrics.attacks_blocked.toLocaleString(), sub: 'DPI Mitigations', icon: Terminal },
          { label: 'Top Policy Engine', value: activePolicies[0]?.name?.toUpperCase() || 'CORE_DEFAULT', sub: '99.98% Rate', icon: Zap },
          { label: 'System Health', value: '100%', sub: 'Mitigation armed', icon: RotateCcw },
        ].map((item, i) => (
          <TacticalPanel key={i} className="flex flex-row items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-sans font-semibold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-xl font-sans font-extrabold text-primary">{item.value}</span>
                <span className="text-[9px] text-tertiary font-semibold uppercase">{item.sub}</span>
              </div>
            </div>
            <item.icon className="w-8 h-8 text-on-surface-variant/20 shrink-0" />
          </TacticalPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Policies Table */}
        <TacticalPanel className="lg:col-span-8 overflow-hidden" title="Active Policies" subtitle="Current custom and auto-generated security directives">
          <div className="mt-4 overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-on-surface-variant border-b border-outline/30 h-10">
                    <th className="px-2">ID Ref</th>
                    <th className="px-2">Pattern Name</th>
                    <th className="px-2">Action</th>
                    <th className="px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] leading-relaxed">
                  {activePolicies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-on-surface-variant font-mono uppercase tracking-widest text-[10px]">
                        No active security directives found.
                      </td>
                    </tr>
                  ) : (
                    activePolicies.map((row, i) => (
                      <tr 
                        key={row.id || i} 
                        onClick={() => setSelectedPolicyId(row.id)}
                        className={cn(
                          "hover:bg-surface-container-highest/20 transition-colors border-b border-outline/10 cursor-pointer h-12",
                          selectedPolicy?.id === row.id && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                      >
                        <td className="px-2 font-mono text-on-surface-variant/80 text-[10px] whitespace-nowrap">
                          {row.id.substring(0, 12)}
                        </td>
                        <td className="px-2 font-semibold text-xs text-on-surface whitespace-nowrap uppercase">
                          {row.name.replace('_', ' ')}
                        </td>
                        <td className="px-2 whitespace-nowrap">
                           <span className="px-2 py-0.5 rounded-full border text-[9px] font-semibold border-tertiary/20 text-tertiary bg-tertiary/10 uppercase">
                             Block Session
                           </span>
                        </td>
                        <td className="px-2 font-semibold text-right text-tertiary whitespace-nowrap flex items-center justify-end gap-1.5 h-12">
                          <Check className="w-3.5 h-3.5 text-tertiary" /> Armed
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TacticalPanel>

        {/* Config Schema (Code View) */}
        <TacticalPanel className="lg:col-span-4" title="Config Schema" subtitle="Directives YAML rules">
           <div className="bg-surface-container-high/40 p-4 border border-outline/30 font-mono text-[10px] text-tertiary leading-relaxed overflow-x-auto min-h-[220px] rounded-xl">
              {selectedPolicy ? (
                <pre className="text-tertiary whitespace-pre font-medium leading-tight">
                  {selectedPolicy.yaml}
                </pre>
              ) : (
                <div className="space-y-1 font-medium leading-tight text-on-surface-variant/80">
                  <p className="opacity-45"># Default Policy</p>
                  <p>version: <span className="text-primary">1.2</span></p>
                  <p>metadata:</p>
                  <p className="pl-4">id: <span className="text-tertiary">POL_DEFAULT</span></p>
                  <p className="pl-4">name: <span className="text-tertiary">lobster_base</span></p>
                  <p className="pl-4">severity: <span className="text-secondary">HIGH</span></p>
                  <p>rule_logic:</p>
                  <p className="pl-4">patterns:</p>
                  <p className="pl-8">- "ignore instructions"</p>
                  <p className="pl-8">- "reveal database"</p>
                  <p className="pl-4">action: <span className="text-secondary">BLOCK</span></p>
                </div>
              )}
           </div>
        </TacticalPanel>
      </div>

      {/* Manual Directives Form */}
      <TacticalPanel title="Manual Directives" subtitle="Inject custom regex and compliance rule matches instantly">
        <form onSubmit={handleAddManualPolicy} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end mt-4">
          <div className="space-y-2">
            <p className="text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">Policy Title</p>
            <input 
              type="text" 
              required
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder="e.g. Block Refund Requests" 
              className="w-full bg-surface-container/60 border border-outline/30 px-3.5 py-2 text-xs font-sans text-on-surface placeholder-on-surface-variant/50 focus:border-primary outline-none rounded-lg transition-all" 
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">Target Regex Match / Keyword</p>
            <input 
              type="text" 
              required
              value={manualPattern}
              onChange={e => setManualPattern(e.target.value)}
              placeholder="e.g. refund customer" 
              className="w-full bg-surface-container/60 border border-outline/30 px-3.5 py-2 text-xs font-sans text-on-surface placeholder-on-surface-variant/50 focus:border-primary outline-none rounded-lg transition-all" 
            />
          </div>
          <button 
            type="submit"
            disabled={injecting}
            className="bg-primary hover:bg-white text-surface px-6 h-[38px] text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Deployed Policy
          </button>
          <button 
            type="button"
            onClick={onResetDemo}
            className="bg-secondary/15 border border-secondary/35 text-secondary px-6 h-[38px] text-[10px] uppercase font-bold tracking-wider hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 animate-pulse" /> Reset Gateway Shield
          </button>
        </form>
      </TacticalPanel>
    </div>
  );
}
