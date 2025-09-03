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