/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageId = 'command-center' | 'threat-intel' | 'network-grid' | 'node-ops' | 'archive' | 'settings';

export interface ScanResult {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'med' | 'high' | 'crit';
  status: 'blocked' | 'slipped' | 'monitored';
  preview: string;
}

export interface NodeStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'compromised';
  type: string;
  load: number;
}
