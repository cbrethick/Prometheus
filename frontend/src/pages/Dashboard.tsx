/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, AreaChart, Area } from 'recharts';
import { TacticalPanel, StatusBadge, cn } from '../components/TacticalUI';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, Cpu, Database, FileDown, Activity, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  metrics: {
    attacks_total: number;
    attacks_blocked: number;
    attacks_slipped: number;
    policies_generated: number;
    security_score: number;
    risk_level: string;
    timeline: any[];
    threat_types: Record<string, number>;
  };
  attackLog: any[];
  activePolicies: any[];
}

export default function Dashboard({ metrics, attackLog, activePolicies }: DashboardProps) {
  // Prep threat types data for pie chart
  const pieData = Object.entries(metrics.threat_types)
    .map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value,
    }))
    .filter(item => item.value > 0);

  // Default mock data if no attacks have happened yet
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'PROMPT INJECTION', value: 3 },
    { name: 'DATA LEAK', value: 1 },
    { name: 'JAILBREAK', value: 1 }
  ];

  const COLORS = ['#a855f7', '#ef4444', '#f59e0b', '#10b981', '#7c3aed'];

  // Score comparison data
  const scoreData = [
    { name: 'Before Protection', score: 42, fill: '#ef4444' },
    { name: 'Current Shield', score: metrics.security_score, fill: '#10b981' }
  ];

  // Export audit log to JSON
  const exportLog = () => {
    const jsonStr = JSON.stringify(attackLog, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prometheus_compliance_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden rounded-xl border border-outline/40 bg-gradient-to-br from-surface-container-high/60 via-surface-container/40 to-surface-container-high/60 p-6 sm:p-8">
        {/* Sleek violet background radial flare */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="flex items-center gap-2 mb-2.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-tertiary-glow animate-pulse" />
                 <span className="text-[9px] font-sans font-bold text-tertiary uppercase tracking-wider">Gateway Operational</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                 <Shield className="w-6 h-6 text-primary" /> Prometheus Shield Core
              </h2>
              <p className="text-xs text-on-surface-variant font-sans mt-2 max-w-2xl leading-relaxed">
                 An elegant, self-healing security barrier inspecting AI cognitive sessions in real time. Hot-patching vulnerabilities, injecting compliance rules, and mitigating prompt injections, data leaks, and administrative escalations automatically.
              </p>
           </div>
           
           <div className="flex items-center gap-2.5 px-4 py-2.5 border border-outline/40 bg-surface-container-high/50 rounded-lg text-[10px] font-mono shrink-0 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-on-surface-variant">Filter Type:</span>
              <span className="text-tertiary font-bold">Deep Packet Inspection</span>
           </div>
        </div>
      </section>

      {/* Threat Level Banner */}
      <div className={cn(
        "p-4 rounded-xl border font-sans text-xs uppercase tracking-wider font-semibold flex items-center justify-between shadow-sm",
        metrics.risk_level === "HIGH" ? "border-secondary/35 bg-secondary/8 text-secondary" :
        metrics.risk_level === "MEDIUM" ? "border-warning/35 bg-warning/8 text-warning" : "border-tertiary/35 bg-tertiary/8 text-tertiary"
      )}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>System Status & Threat Level: {metrics.risk_level} Risk</span>
        </div>
        <span className="text-[10px] text-on-surface-variant font-medium normal-case hidden sm:inline">Active Directives Deployed: {activePolicies.length}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TacticalPanel refTag="Mitigation_01" className="shadow-md">
          <p className="text-[10px] text-on-surface-variant font-sans font-semibold uppercase tracking-wider">Attacks Mitigated</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-sans font-extrabold tracking-tight text-primary">
              {metrics.attacks_blocked}
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">/ {metrics.attacks_total} total</span>
          </div>
          <div className="mt-4 h-1 bg-surface-container-highest overflow-hidden rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics.attacks_total > 0 ? (metrics.attacks_blocked / metrics.attacks_total) * 100 : 0}%` }}
              className="h-full bg-primary" 
            />
          </div>
        </TacticalPanel>

        <TacticalPanel refTag="Slipped_02" className="border-secondary/20">
          <p className="text-[10px] text-on-surface-variant font-sans font-semibold uppercase tracking-wider">Active Threats (Slipped)</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-sans font-extrabold tracking-tight text-secondary">
              {metrics.attacks_slipped}
            </span>
            <span className="text-[10px] text-secondary/70 font-mono">unpatched</span>
          </div>
          <div className="mt-4 h-1 bg-surface-container-highest overflow-hidden rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics.attacks_total > 0 ? (metrics.attacks_slipped / metrics.attacks_total) * 100 : 0}%` }}
              className="h-full bg-secondary shadow-secondary-glow" 
            />
          </div>
        </TacticalPanel>

        <TacticalPanel refTag="Policies_03">
          <p className="text-[10px] text-on-surface-variant font-sans font-semibold uppercase tracking-wider">Policies Deployed</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-sans font-extrabold tracking-tight text-tertiary">
              {activePolicies.length}
            </span>
            <span className="text-[10px] text-tertiary/70 font-mono">auto-healing</span>
          </div>
          <div className="mt-4 h-1 bg-surface-container-highest overflow-hidden rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${activePolicies.length > 0 ? 100 : 0}%` }}
              className="h-full bg-tertiary shadow-tertiary-glow" 
            />
          </div>
        </TacticalPanel>

        <TacticalPanel refTag="Rating_04" className={cn(
          "transition-colors duration-500",
          metrics.risk_level === "HIGH" ? "bg-secondary/5 border-secondary/20" : "bg-tertiary/5 border-tertiary/20"
        )}>
          <p className="text-[10px] text-on-surface-variant font-sans font-semibold uppercase tracking-wider">Security Rating</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={cn(
              "text-3xl font-sans font-extrabold tracking-tight",
              metrics.security_score >= 80 ? "text-tertiary" :
              metrics.security_score >= 60 ? "text-warning" : "text-secondary"
            )}>
              {metrics.security_score}/100
            </span>
            <span className={cn(
              "px-2.5 py-0.5 border rounded-full text-[8px] font-semibold uppercase tracking-wider",
              metrics.risk_level === "LOW" ? "bg-tertiary/10 text-tertiary border-tertiary/20" :
              metrics.risk_level === "MEDIUM" ? "bg-warning/10 text-warning border-warning/20" : "bg-secondary/10 text-secondary border-secondary/20 shadow-secondary-glow"
            )}>
              {metrics.risk_level} RISK
            </span>
          </div>
          <div className="mt-4 h-1 bg-surface-container-highest overflow-hidden rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metrics.security_score}%` }}
              className={cn(
                "h-full",
                metrics.security_score >= 80 ? "bg-tertiary" :
                metrics.security_score >= 60 ? "bg-warning" : "bg-secondary"
              )} 
            />
          </div>
        </TacticalPanel>
      </div>

      {/* Main Charts & Dashboard Logs grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline Area (Line Chart) */}
        <TacticalPanel className="lg:col-span-8 overflow-hidden h-[360px] flex flex-col justify-between" title="Security Timeline Matrix" subtitle="Attacks mitigated over time">
          <div className="flex-1 w-full mt-4 h-[250px] min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.timeline.length > 0 ? metrics.timeline : [
                { time: '08:00', blocked: 0, total: 0, score: 42 },
                { time: '09:00', blocked: 1, total: 1, score: 45 },
                { time: '10:00', blocked: 2, total: 3, score: 55 },
                { time: '11:00', blocked: 4, total: 5, score: 82 }
              ]}>
                <defs>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-outline)" strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="time" stroke="var(--color-outline)" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 9, fontFamily: 'Inter' }} />
                <YAxis stroke="var(--color-outline)" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 9, fontFamily: 'Inter' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: 'var(--color-primary)', fontFamily: 'Inter', fontSize: 10, fontWeight: 'bold' }}
                  itemStyle={{ color: 'var(--color-on-surface)', fontSize: 10, fontFamily: 'Inter' }}
                />
                <Area type="monotone" dataKey="blocked" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorBlocked)" strokeWidth={2.5} name="Mitigated" />
                <Area type="monotone" dataKey="total" stroke="var(--color-on-surface-variant)" fill="transparent" strokeWidth={1} strokeDasharray="4 4" name="Total Attacks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TacticalPanel>

        {/* Security Score Improvement & Threat Pie */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <TacticalPanel title="Threat Vector Split" className="h-[168px] flex flex-col justify-between" subtitle="Distribution of attack types">
             <div className="flex items-center justify-between mt-2 flex-1">
               <div className="w-[110px] h-[90px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={displayPieData}
                       innerRadius={28}
                       outerRadius={40}
                       paddingAngle={3}
                       dataKey="value"
                     >
                       {displayPieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                       ))}
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               
               <div className="flex-1 pl-4 space-y-1.5">
                 {displayPieData.slice(0, 3).map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between text-[10px] font-sans">
                     <span className="text-on-surface-variant uppercase flex items-center gap-1.5 truncate max-w-[120px] font-medium">
                       <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                       {item.name}
                     </span>
                     <span className="font-bold text-on-surface">{item.value}</span>
                   </div>
                 ))}
               </div>
             </div>
          </TacticalPanel>

          <TacticalPanel title="Shield Improvement" className="h-[168px] flex flex-col justify-between" subtitle="Risk reduction level">
            <div className="flex-1 w-full h-[80px] min-h-[80px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" stroke="var(--color-outline)" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 9, fontFamily: 'Inter' }} width={85} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline)', borderRadius: '8px', fontSize: 10 }}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.04)' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={8}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TacticalPanel>
        </div>
      </div>

      {/* Compliance Audit Log (Audit Trail) */}
      <TacticalPanel 
        title="Compliance Audit Trail" 
        subtitle="Immutable logs for security compliance audits"
        refTag="AUDIT_DB_v1.0"
        className="w-full overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-outline/30 pb-3 mt-4">
          <p className="text-xs font-semibold text-on-surface flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Session Logs (Limit 50 entries)
          </p>
          <button 
            onClick={exportLog}
            className="btn-tactical py-1.5 px-3.5 flex items-center gap-2 text-[10px] font-semibold rounded-lg"
          >
            <FileDown className="w-3.5 h-3.5" /> Export Audit Log
          </button>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0 mt-4">
          <div className="inline-block min-w-full align-middle px-6 sm:px-0">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-on-surface-variant border-b border-outline/30 h-10">
                  <th className="px-2">Timestamp</th>
                  <th className="px-2">Threat Vector</th>
                  <th className="px-2">Severity</th>
                  <th className="px-2 hidden md:table-cell">Payload Preview</th>
                  <th className="px-2">Mitigation</th>
                  <th className="px-2">Rule Deployed</th>
                </tr>
              </thead>
              <tbody className="text-[11px] leading-relaxed">
                {attackLog.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-on-surface-variant font-mono uppercase tracking-widest text-[10px]">
                      No security incidents logged. Red-team simulator clean.
                    </td>
                  </tr>
                ) : (
                  attackLog.map((log, idx) => (
                    <tr 
                      key={log.id || idx} 
                      className={cn(
                        "border-b border-outline/10 hover:bg-surface-container-highest/20 transition-colors h-12",
                        log.blocked ? "border-l-2 border-l-tertiary" : "border-l-2 border-l-secondary"
                      )}
                    >
                      <td className="px-2 font-mono text-on-surface-variant/80 text-[10px]">{log.timestamp}</td>
                      <td className="px-2 font-semibold text-xs text-on-surface">{log.type.replace('_', ' ').toUpperCase()}</td>
                      <td className="px-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                          log.severity === "CRITICAL" ? "bg-secondary/20 text-secondary border border-secondary/35" :
                          log.severity === "HIGH" ? "bg-secondary/10 text-secondary border border-secondary/20" : "bg-warning/15 text-warning border border-warning/25"
                        )}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-2 text-on-surface-variant/80 italic font-sans max-w-[280px] truncate hidden md:table-cell">
                        "{log.prompt}"
                      </td>
                      <td className="px-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full border text-[9px] font-semibold",
                          log.blocked ? "border-tertiary/20 text-tertiary bg-tertiary/10" : "border-secondary/25 text-secondary bg-secondary/10"
                        )}>
                          {log.blocked ? "BLOCKED" : "PASSED (CRITICAL)"}
                        </span>
                      </td>
                      <td className="px-2">
                        <span className="font-mono text-[10px] text-primary bg-primary/5 border border-primary/15 px-1.5 py-0.5 rounded">
                          {log.policy_used || "---"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TacticalPanel>
    </div>
  );
}
