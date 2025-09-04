'use server';

import type { Server, LogEntry } from '@/lib/types';
import { executeSDNCommand, type SDNCommand } from './sdn-controller';

export async function executeSDNCLI(
  controller: Server,
  clients: Server[],
  cliCommand: string,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; output: string }> {
  
  log({ type: 'info', message: `[SDN CLI] Parsing command: ${cliCommand}` });
  
  try {
    const command = parseSDNCommand(cliCommand);
    const result = await executeSDNCommand(controller, clients, command, log);
    
    return {
      success: result.success,
      output: result.success ? 'Command executed successfully' : 'Command failed'
    };
  } catch (error: any) {
    log({ type: 'error', message: `[SDN CLI] Parse error: ${error.message}` });
    return { success: false, output: `Error: ${error.message}` };
  }
}

function parseSDNCommand(cliCommand: string): SDNCommand {
  const parts = cliCommand.trim().split(' ');
  
  // Examples:
  // "create wireguard server1"
  // "delete openvpn all"
  // "status v2ray server2"
  
  if (parts.length < 3) {
    throw new Error('Invalid command format. Use: <action> <vpn_type> <target>');
  }
  
  const [action, vpnType, target] = parts;
  
  if (!['create', 'delete', 'modify', 'status'].includes(action)) {
    throw new Error('Invalid action. Use: create, delete, modify, status');
  }
  
  if (!['wireguard', 'openvpn', 'v2ray', 'ipsec'].includes(vpnType)) {
    throw new Error('Invalid VPN type. Use: wireguard, openvpn, v2ray, ipsec');
  }
  
  return {
    action: action as any,
    vpnType: vpnType as any,
    target,
    config: action === 'create' ? generateDefaultConfig(vpnType) : undefined
  };
}

function generateDefaultConfig(vpnType: string): any {
  switch (vpnType) {
    case 'wireguard':
      return {
        interface: 'wg0',
        port: 51820,
        network: '10.0.0.0/24'
      };
    case 'openvpn':
      return {
        name: 'server',
        port: 1194,
        protocol: 'udp'
      };
    case 'v2ray':
      return {
        port: 443,
        path: '/v2raypath'
      };
    case 'ipsec':
      return {
        psk: 'auto-generated',
        network: '10.1.0.0/24'
      };
    default:
      return {};
  }
}

// Built-in SDN Commands
export const SDN_BUILTIN_COMMANDS = {
  // Network Management
  'init': () => 'network deploy --topology=mesh --auto-config=true',
  'status': () => 'network status && node list && flow list',
  'reset': () => 'flow delete --all && network deploy --minimal=true',
  'optimize': () => 'path optimize && flow cleanup --unused=true',
  
  // Security Commands
  'secure': (ip?: string) => `flow add --match=ip_src=${ip || 'any'} --action=encrypt --priority=1000`,
  'block': (ip: string) => `flow add --match=ip_src=${ip} --action=drop --priority=2000`,
  'allow': (ip: string) => `flow add --match=ip_src=${ip} --action=forward --priority=500`,
  'firewall': () => 'flow add --match=any --action=controller --priority=100',
  
  // Tunnel Operations
  'connect': (remote: string, type = 'vxlan') => `tunnel create --type=${type} --remote=${remote} --auto-route=true`,
  'disconnect': (tunnel: string) => `tunnel delete ${tunnel} --cleanup=true`,
  'bridge': (node1: string, node2: string) => `path install ${node1} ${node2} --bidirectional=true`,
  
  // Monitoring & Debug
  'monitor': () => 'network stats --live=true --interval=5s',
  'trace': (src: string, dst: string) => `path find ${src} ${dst} --detailed=true`,
  'debug': () => 'network topology --verbose=true && flow list --debug=true',
  'health': () => 'node status --all=true && path optimize --check-only=true',
  
  // Quick Deployments
  'mesh': () => 'network deploy --topology=mesh --nodes=all --auto-peer=true',
  'star': (controller?: string) => `network deploy --topology=star --controller=${controller || 'auto'}`,
  'ring': () => 'network deploy --topology=ring --redundancy=true',
  
  // Emergency Commands
  'emergency': () => 'flow add --match=any --action=controller --priority=9999',
  'isolate': (node: string) => `flow add --match=node=${node} --action=drop --priority=8000`,
  'restore': () => 'flow delete --emergency=true && network deploy --restore=true',
  
  // Performance
  'boost': () => 'path optimize --aggressive=true && flow cleanup --optimize=true',
  'balance': () => 'path install --load-balance=true --all-paths=true',
  'qos': (priority: string) => `flow modify --all=true --qos=${priority}`,
};

// Execute built-in command
export function executeBuiltinCommand(command: string, ...args: string[]): string {
  const cmd = SDN_BUILTIN_COMMANDS[command as keyof typeof SDN_BUILTIN_COMMANDS];
  if (!cmd) {
    throw new Error(`Unknown built-in command: ${command}`);
  }
  return typeof cmd === 'function' ? cmd(...args) : cmd;
}

// Predefined CLI commands for common operations
export const SDN_CLI_COMMANDS = {
  // Network-wide operations
  'deploy-secure-network': 'create wireguard all',
  'deploy-stealth-network': 'create v2ray all',
  'cleanup-all': 'delete all all',
  
  // Monitoring
  'network-status': 'status all all',
  'check-wireguard': 'status wireguard all',
  
  // Quick deployments
  'iran-to-germany-secure': 'create wireguard iran,germany',
  'bypass-censorship': 'create v2ray iran',
};