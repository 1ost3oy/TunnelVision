'use server';

import { NodeSSH } from 'node-ssh';
import type { Server, LogEntry } from '@/lib/types';
import { connectWithKeyManagement } from './ssh';

export interface SDNCommand {
  action: 'create' | 'delete' | 'modify' | 'status';
  vpnType: 'wireguard' | 'openvpn' | 'v2ray' | 'ipsec';
  target: string; // server ID or 'all'
  config?: any;
}

export interface SDNController {
  controllerId: string;
  clients: Server[];
}

export async function executeSDNCommand(
  controller: Server,
  clients: Server[],
  command: SDNCommand,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; result?: any }> {
  
  log({ type: 'info', message: `[SDN Controller] Executing ${command.action} ${command.vpnType} on ${command.target}` });
  
  const targetServers = command.target === 'all' ? clients : clients.filter(s => s.id === command.target);
  
  try {
    const controllerSSH = await connectWithKeyManagement(controller, log);
    
    // Install SDN agent on controller if not exists
    await setupSDNAgent(controllerSSH, controller.name, log);
    
    for (const server of targetServers) {
      const clientSSH = await connectWithKeyManagement(server, log);
      
      switch (command.action) {
        case 'create':
          await createVPNService(clientSSH, server.name, command.vpnType, command.config, log);
          break;
        case 'delete':
          await deleteVPNService(clientSSH, server.name, command.vpnType, log);
          break;
        case 'status':
          await getVPNStatus(clientSSH, server.name, command.vpnType, log);
          break;
      }
      
      clientSSH.dispose();
    }
    
    controllerSSH.dispose();
    log({ type: 'success', message: `[SDN Controller] Command executed successfully` });
    return { success: true };
    
  } catch (error: any) {
    log({ type: 'error', message: `[SDN Controller] Error: ${error.message}` });
    return { success: false };
  }
}

async function setupSDNAgent(ssh: NodeSSH, serverName: string, log: (entry: LogEntry) => void) {
  log({ type: 'info', message: `[${serverName}] Setting up SDN agent...` });
  
  const agentScript = `#!/bin/bash
# SDN Agent for centralized VPN management
mkdir -p /opt/sdn-agent
cat > /opt/sdn-agent/agent.py << 'EOF'
import json, subprocess, sys
def execute_vpn_command(cmd_type, vpn_type, config=None):
    if vpn_type == 'wireguard':
        if cmd_type == 'create':
            subprocess.run(['wg-quick', 'up', config['interface']])
        elif cmd_type == 'delete':
            subprocess.run(['wg-quick', 'down', config['interface']])
    elif vpn_type == 'openvpn':
        if cmd_type == 'create':
            subprocess.run(['systemctl', 'start', f"openvpn@{config['name']}"])
        elif cmd_type == 'delete':
            subprocess.run(['systemctl', 'stop', f"openvpn@{config['name']}"])
    return {'status': 'success'}

if __name__ == '__main__':
    cmd = json.loads(sys.argv[1])
    result = execute_vpn_command(cmd['action'], cmd['vpn_type'], cmd.get('config'))
    print(json.dumps(result))
EOF
chmod +x /opt/sdn-agent/agent.py`;

  await ssh.execCommand(agentScript);
  log({ type: 'success', message: `[${serverName}] SDN agent installed` });
}

async function createVPNService(ssh: NodeSSH, serverName: string, vpnType: string, config: any, log: (entry: LogEntry) => void) {
  log({ type: 'info', message: `[${serverName}] Creating ${vpnType} service...` });
  
  const command = JSON.stringify({ action: 'create', vpn_type: vpnType, config });
  const result = await ssh.execCommand(`python3 /opt/sdn-agent/agent.py '${command}'`);
  
  if (result.code === 0) {
    log({ type: 'success', message: `[${serverName}] ${vpnType} service created` });
  } else {
    throw new Error(`Failed to create ${vpnType} on ${serverName}: ${result.stderr}`);
  }
}

async function deleteVPNService(ssh: NodeSSH, serverName: string, vpnType: string, log: (entry: LogEntry) => void) {
  log({ type: 'info', message: `[${serverName}] Deleting ${vpnType} service...` });
  
  const command = JSON.stringify({ action: 'delete', vpn_type: vpnType });
  const result = await ssh.execCommand(`python3 /opt/sdn-agent/agent.py '${command}'`);
  
  if (result.code === 0) {
    log({ type: 'success', message: `[${serverName}] ${vpnType} service deleted` });
  } else {
    throw new Error(`Failed to delete ${vpnType} on ${serverName}: ${result.stderr}`);
  }
}

async function getVPNStatus(ssh: NodeSSH, serverName: string, vpnType: string, log: (entry: LogEntry) => void) {
  log({ type: 'info', message: `[${serverName}] Checking ${vpnType} status...` });
  
  const command = JSON.stringify({ action: 'status', vpn_type: vpnType });
  const result = await ssh.execCommand(`python3 /opt/sdn-agent/agent.py '${command}'`);
  
  log({ type: 'info', message: `[${serverName}] ${vpnType} status: ${result.stdout}` });
}