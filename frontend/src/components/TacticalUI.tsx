/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function TacticalPanel({ children, className, title, subtitle, refTag }: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  subtitle?: string;
  refTag?: string;
  key?: React.Key;
}) {
  return (
    <div className={cn("tactical-panel", className)}>
      {refTag && (
        <span className="absolute top-4 right-4 text-[8px] font-mono text-on-surface-variant/30 bg-surface-container-highest/60 border border-outline/40 px-1.5 py-0.5 rounded tracking-widest uppercase">
          {refTag}
        </span>
      )}
      {(title || subtitle) && (
        <div className="mb-4">
          {subtitle && <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">{subtitle}</p>}
          {title && <h3 className="font-sans text-base text-on-surface font-bold tracking-tight mt-0.5">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors = {
    blocked: "bg-tertiary/10 text-tertiary border-tertiary/20",
    slipped: "bg-secondary/10 text-secondary border-secondary/20",
    med: "bg-warning/10 text-warning border-warning/20",
    low: "bg-on-surface-variant/5 text-on-surface-variant border-outline/30",
    high: "bg-secondary/10 text-secondary border-secondary/20",
    crit: "bg-secondary/20 text-secondary border-secondary/35 font-semibold",
    clean: "bg-tertiary/10 text-tertiary border-tertiary/20",
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 border rounded-full text-[9px] font-semibold uppercase tracking-wide",
      colors[status as keyof typeof colors] || "bg-outline/20 text-on-surface-variant border-outline/30"
    )}>
      {status}
    </span>
  );
}
