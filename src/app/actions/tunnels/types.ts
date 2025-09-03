import { NodeSSH } from 'node-ssh';
import type { Server, TunnelType, LogEntry } from '@/lib/types';

export interface CommandOptions {
    tunnelType: TunnelType;
    server1: Server;
    server2: Server;
    ssh1: NodeSSH;
    ssh2: NodeSSH;
    tunnelName: string;
    tunnelIp1: string;
    tunnelIp2: string;
    domain?: string;
    log: (entry: LogEntry) => void;
}

export interface CommandResult {
    commandsS1: string[];
    commandsS2: string[];
    extraLogs: LogEntry[];
}