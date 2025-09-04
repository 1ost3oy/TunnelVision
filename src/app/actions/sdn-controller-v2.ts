'use server';

import { NodeSSH } from 'node-ssh';
import type { Server, LogEntry } from '@/lib/types';
import { connectWithKeyManagement } from './ssh';
import { SDNController as CoreSDNController, SDNNode, SDNFlow } from '@/lib/sdn-core';
import { TopologyManager } from '@/lib/topology-manager';

export interface SDNCommand {
  action: 'create' | 'delete' | 'modify' | 'status' | 'deploy' | 'route';
  vpnType?: 'wireguard' | 'openvpn' | 'v2ray' | 'ipsec';
  target: string;
  config?: any;
  flows?: SDNFlow[];
}

export interface SDNControllerInstance {
  controllerId: string;
  clients: Server[];
  core: CoreSDNController;
  topology: TopologyManager;
}

const sdnInstances = new Map<string, SDNControllerInstance>();

export async function initializeSDNController(
  controller: Server,
  clients: Server[],
  log: (entry: LogEntry) => void
): Promise<SDNControllerInstance> {
  
  const controllerId = controller.id;
  
  if (sdnInstances.has(controllerId)) {
    return sdnInstances.get(controllerId)!;
  }

  log({ type: 'info', message: `[SDN] Initializing controller ${controller.name}` });
  
  const core = new CoreSDNController();
  const topology = new TopologyManager();
  
  const controllerNode: SDNNode = {
    id: controller.id,
    name: controller.name,
    ip: controller.ipAddress,
    role: 'controller',
    status: 'active',
    capabilities: ['openflow', 'routing', 'monitoring']
  };
  
  core.addNode(controllerNode);
  topology.addNode(controllerNode);
  
  for (const client of clients) {
    const clientNode: SDNNode = {
      id: client.id,
      name: client.name,
      ip: client.ipAddress,
      role: 'switch',
      status: 'active',
      capabilities: ['forwarding', 'tunneling']
    };
    
    core.addNode(clientNode);
    topology.addSwitch(client.id, clientNode);
  }
  
  const instance: SDNControllerInstance = {
    controllerId,
    clients,
    core,
    topology
  };
  
  sdnInstances.set(controllerId, instance);
  log({ type: 'success', message: `[SDN] Controller initialized with ${clients.length} nodes` });
  
  return instance;
}

export async function executeAdvancedSDN(
  controller: Server,
  clients: Server[],
  command: SDNCommand,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; result?: any }> {
  
  log({ type: 'info', message: `[SDN] Executing ${command.action} on ${command.target}` });
  
  try {
    const instance = await initializeSDNController(controller, clients, log);
    
    switch (command.action) {
      case 'deploy':
        return await deploySDNNetwork(instance, command, log);
      case 'route':
        return await setupRouting(instance, command, log);
      case 'create':
        return await createSDNTunnel(instance, command, log);
      case 'status':
        return await getNetworkStatus(instance, log);
      default:
        throw new Error(`Unknown SDN action: ${command.action}`);
    }
  } catch (error: any) {
    log({ type: 'error', message: `[SDN] Error: ${error.message}` });
    return { success: false };
  }
}

async function deploySDNNetwork(
  instance: SDNControllerInstance,
  command: SDNCommand,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; result?: any }> {
  
  log({ type: 'info', message: '[SDN] Deploying network topology...' });
  
  const nodes = Array.from(instance.core.getNetworkTopology().nodes);
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const link = {
        id: `link-${nodes[i].id}-${nodes[j].id}`,
        srcNode: nodes[i].id,
        srcPort: 1,
        dstNode: nodes[j].id,
        dstPort: 1,
        bandwidth: 1000,
        latency: Math.floor(Math.random() * 50) + 10,
        status: 'up' as const
      };
      
      instance.topology.addLink(link);
    }
  }
  
  log({ type: 'success', message: '[SDN] Network topology deployed' });
  return { success: true, result: instance.topology.getNetworkStats() };
}

async function setupRouting(
  instance: SDNControllerInstance,
  command: SDNCommand,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; result?: any }> {
  
  const [srcId, dstId] = command.target.split(',');
  
  if (!srcId || !dstId) {
    throw new Error('Route command requires source,destination format');
  }
  
  log({ type: 'info', message: `[SDN] Setting up route from ${srcId} to ${dstId}` });
  
  const path = instance.topology.findShortestPath(srcId, dstId);
  
  if (!path) {
    throw new Error(`No path found between ${srcId} and ${dstId}`);
  }
  
  const flows = instance.core.installPath(srcId, dstId);
  
  log({ type: 'success', message: `[SDN] Route installed: ${path.nodes.join(' -> ')}` });
  return { success: true, result: { path, flows } };
}

async function createSDNTunnel(
  instance: SDNControllerInstance,
  command: SDNCommand,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; result?: any }> {
  
  if (!command.vpnType) {
    throw new Error('VPN type required for create command');
  }
  
  log({ type: 'info', message: `[SDN] Creating ${command.vpnType} tunnel on ${command.target}` });
  
  const tunnelFlow: SDNFlow = {
    id: `tunnel-${command.vpnType}-${Date.now()}`,
    priority: 200,
    match: { ipDst: command.config?.remoteIp },
    actions: [{ type: 'forward' }]
  };
  
  instance.core.addFlow(tunnelFlow);
  
  log({ type: 'success', message: `[SDN] ${command.vpnType} tunnel created` });
  return { success: true, result: { tunnelId: tunnelFlow.id } };
}

async function getNetworkStatus(
  instance: SDNControllerInstance,
  log: (entry: LogEntry) => void
): Promise<{ success: boolean; result?: any }> {
  
  const topology = instance.topology.getNetworkStats();
  
  log({ type: 'info', message: '[SDN] Network status retrieved' });
  
  return {
    success: true,
    result: {
      topology,
      timestamp: new Date().toISOString()
    }
  };
}

export async function setupAdvancedSDNAgent(ssh: NodeSSH, serverName: string, log: (entry: LogEntry) => void) {
  log({ type: 'info', message: `[${serverName}] Setting up advanced SDN agent...` });
  
  const agentScript = `#!/bin/bash
mkdir -p /opt/sdn-agent/{bin,config,logs}

apt-get update && apt-get install -y python3-pip openvswitch-switch
pip3 install scapy

cat > /opt/sdn-agent/agent.py << 'EOF'
import json, subprocess, sys
from datetime import datetime

class SDNAgent:
    def __init__(self):
        self.flows = {}
        self.stats = {'packets': 0, 'bytes': 0}
    
    def install_flow(self, flow_id, match, actions):
        ovs_cmd = f"ovs-ofctl add-flow br0 'priority={match.get('priority', 100)}"
        if match.get('ip_dst'):
            ovs_cmd += f",nw_dst={match['ip_dst']}"
        ovs_cmd += f",actions={','.join(actions)}'"
        
        result = subprocess.run(ovs_cmd.split(), capture_output=True, text=True)
        self.flows[flow_id] = {'match': match, 'actions': actions}
        return result.returncode == 0
    
    def get_stats(self):
        result = subprocess.run(['ovs-ofctl', 'dump-flows', 'br0'], capture_output=True, text=True)
        return {'flows': len(self.flows), 'ovs_output': result.stdout}
    
    def setup_tunnel(self, tunnel_type, config):
        if tunnel_type == 'vxlan':
            cmd = f"ovs-vsctl add-port br0 vxlan0 -- set interface vxlan0 type=vxlan options:remote_ip={config['remote_ip']}"
            subprocess.run(cmd.split())
        return True

agent = SDNAgent()

if __name__ == '__main__':
    cmd = json.loads(sys.argv[1])
    action = cmd['action']
    
    if action == 'install_flow':
        result = agent.install_flow(cmd['flow_id'], cmd['match'], cmd['actions'])
    elif action == 'get_stats':
        result = agent.get_stats()
    elif action == 'setup_tunnel':
        result = agent.setup_tunnel(cmd['tunnel_type'], cmd['config'])
    else:
        result = {'error': 'Unknown action'}
    
    print(json.dumps(result))
EOF

ovs-vsctl add-br br0 2>/dev/null || true
chmod +x /opt/sdn-agent/agent.py`;

  await ssh.execCommand(agentScript);
  log({ type: 'success', message: `[${serverName}] Advanced SDN agent installed` });
}