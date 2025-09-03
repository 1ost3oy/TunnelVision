import { NextRequest, NextResponse } from 'next/server';
import { connectWithKeyManagement } from '@/app/actions/ssh';
import type { Server } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { action, nodes, config } = await request.json();

    switch (action) {
      case 'deploy':
        return await deploySDNNetwork(nodes, config);
      case 'status':
        return await getStatus(nodes);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function deploySDNNetwork(nodes: Server[], config: any) {
  const results = [];
  
  for (const node of nodes) {
    try {
      const ssh = await connectWithKeyManagement(node, () => {});
      
      const agentScript = `#!/bin/bash
mkdir -p /opt/sdn-agent
cat > /opt/sdn-agent/deploy.py << 'EOF'
import subprocess, json, sys
def deploy_wg():
    subprocess.run(['apt-get', 'update'])
    subprocess.run(['apt-get', 'install', '-y', 'wireguard-tools'])
    subprocess.run(['wg', 'genkey'], stdout=open('/etc/wireguard/private.key', 'w'))
    subprocess.run(['wg', 'pubkey'], stdin=open('/etc/wireguard/private.key'), stdout=open('/etc/wireguard/public.key', 'w'))
    print(json.dumps({'status': 'deployed', 'node': '${node.name}'}))

deploy_wg()
EOF
python3 /opt/sdn-agent/deploy.py`;

      await ssh.execCommand(agentScript);
      
      results.push({
        node: node.name,
        status: 'deployed',
        ip: node.ipAddress
      });
      
      ssh.dispose();
    } catch (error: any) {
      results.push({
        node: node.name,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return NextResponse.json({ success: true, results });
}

async function getStatus(nodes: Server[]) {
  const status = nodes.map(node => ({
    node: node.name,
    ip: node.ipAddress,
    status: 'active'
  }));
  
  return NextResponse.json({ success: true, status });
}