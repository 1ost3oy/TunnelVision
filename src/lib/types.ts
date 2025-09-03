import { ObjectId } from 'mongodb';

export interface Server {
  _id: ObjectId;
  id: string;
  name: string;
  ipAddress: string;
  username: string;
  sshPort?: number;
  password?: string;
  sshKey?: string;
  sshKeyConfigured?: boolean;
}

export const tunnelTypes = [
  "WireGuard",
  "OpenVPN",
  "IPIP",
  "GRE",
  "SIT",
  "VTI",
  "IPsec",
  "V2Ray (WS+TLS)",
  "Reverse Tunnel (via SSH)",
] as const;

export type TunnelType = (typeof tunnelTypes)[number];

export interface LogEntry {
  type: 'info' | 'success' | 'error' | 'command' | 'warning';
  message: string;
}

export interface TunnelCreationResult {
  success: boolean;
  logs: LogEntry[];
}

export interface Tunnel {
  _id: ObjectId;
  id: string;
  server1Id: string;
  server2Id: string;
  type: TunnelType;
  createdAt: string;
  tunnelName: string;
  tunnelIp1: string;
  tunnelIp2: string;
  isSaved: boolean;
  domain?: string;
  latency?: number | null;
  isPinging?: boolean;
}

export interface Colors {
  chalky: string;
  coral: string;
  cyan: string;
  error: string;
  ivory: string;
  malibu: string;
  sage: string;
  stone: string;
  violet: string;
  whiskey: string;
}

export interface TokenGroup {
  name: string
  scope: string[]
  settings: {
    foreground?: string
    fontStyle?: string
  }
}
