'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Input } from '@/components/starwind/input';
import { Progress } from '@/components/starwind/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/starwind/alert';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/starwind/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Zap, Activity, Terminal, Settings } from 'lucide-react';

interface SDNNode {
  id: string;
  name: string;
  ip: string;
  role: 'controller' | 'switch' | 'host';
  status: 'active' | 'inactive' | 'error';
}

interface SDNFlow {
  id: string;
  priority: number;
  match: string;
  actions: string;
  packets: number;
  bytes: number;
}

export default function SDNDashboard() {
  const [nodes, setNodes] = useState<SDNNode[]>([]);
  const [flows, setFlows] = useState<SDNFlow[]>([]);
  const [cliInput, setCLIInput] = useState('');
  const [cliOutput, setCLIOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  useEffect(() => {
    setNodes([
      { id: 'ctrl-1', name: 'Controller-1', ip: '192.168.1.1', role: 'controller', status: 'active' },
      { id: 'sw-1', name: 'Switch-1', ip: '192.168.1.10', role: 'switch', status: 'active' },
      { id: 'sw-2', name: 'Switch-2', ip: '192.168.1.20', role: 'switch', status: 'active' },
      { id: 'host-1', name: 'Host-1', ip: '10.0.0.1', role: 'host', status: 'active' }
    ]);

    setFlows([
      { id: 'flow-1', priority: 200, match: 'ip_dst=10.0.0.1', actions: 'output:1', packets: 1500, bytes: 750000 },
      { id: 'flow-2', priority: 100, match: 'eth_type=0x0800', actions: 'controller', packets: 500, bytes: 250000 }
    ]);

    setIsConnected(true);
    setNetworkStatus('success');
  }, []);

  const handleCLICommand = async (command: string) => {
    setCLIOutput(prev => [...prev, `> ${command}`]);
    
    let response = '';
    
    if (command.startsWith('network deploy')) {
      response = 'SDN Network deployed successfully\nNodes: 4, Links: 6, Flows: 2';
      setNetworkStatus('success');
    } else if (command.startsWith('network status')) {
      response = `Network Status: ${isConnected ? 'Connected' : 'Disconnected'}\nNodes: 4\nActive Links: 6`;
    } else if (command.startsWith('flow add')) {
      response = 'Flow rule added successfully';
      setNetworkStatus('success');
    } else if (command.startsWith('tunnel create')) {
      response = 'VPN tunnel created successfully';
      setNetworkStatus('success');
    } else if (command.startsWith('help')) {
      response = `SDN Commands:
- network deploy/status/topology
- flow add/delete/list  
- tunnel create/delete/list
- path find/install`;
    } else {
      response = `Command executed: ${command}`;
    }
    
    setCLIOutput(prev => [...prev, response, '']);
    setCLIInput('');
  };

  const [deployProgress, setDeployProgress] = useState(0);
  
  const deployNetwork = () => {
    setNetworkStatus('info');
    setDeployProgress(0);
    
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setNetworkStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SDN Controller Dashboard</h1>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Deploy Network</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deploy SDN Network</DialogTitle>
                <DialogDescription>
                  Configure and deploy your SDN network topology.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Network Name</label>
                  <Input placeholder="My SDN Network" />
                </div>
                <div>
                  <label className="text-sm font-medium">Topology Type</label>
                  <Input placeholder="Mesh" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={deployNetwork}>Deploy</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Reset</Button>
        </div>
      </div>

      {/* Network Status Alert */}
      {networkStatus === 'success' && (
        <Alert variant="success">
          <AlertTitle>Network Status</AlertTitle>
          <AlertDescription>
            SDN network is running successfully. All nodes are connected and flows are active.
          </AlertDescription>
        </Alert>
      )}

      {networkStatus === 'info' && (
        <Alert variant="info">
          <AlertTitle>Deploying Network</AlertTitle>
          <AlertDescription>
            SDN network deployment in progress. Please wait...
            <div className="mt-3 space-y-2">
              <Progress value={deployProgress} className="w-full" />
              <div className="text-xs">{deployProgress}% complete</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1Gbps</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topology" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
          <TabsTrigger value="flows">Flow Tables</TabsTrigger>
          <TabsTrigger value="cli">SDN CLI</TabsTrigger>
        </TabsList>

        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nodes.map((node) => (
                  <div key={node.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {node.role === 'controller' && <Settings className="w-4 h-4" />}
                        {node.role === 'switch' && <Network className="w-4 h-4" />}
                        {node.role === 'host' && <Activity className="w-4 h-4" />}
                        <span className="font-medium">{node.name}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>IP: {node.ip}</div>
                      <div>Role: {node.role}</div>
                      <div>Status: {node.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OpenFlow Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flows.map((flow) => (
                  <div key={flow.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Flow: {flow.id}</div>
                        <div className="text-sm text-muted-foreground">Priority: {flow.priority}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Match: {flow.match}</div>
                        <div className="text-sm text-muted-foreground">Actions: {flow.actions}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Packets: {flow.packets.toLocaleString()} | Bytes: {flow.bytes.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cli" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SDN Command Line Interface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                {cliOutput.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={cliInput}
                  onChange={(e) => setCLIInput(e.target.value)}
                  placeholder="Enter SDN command..."
                  className="font-mono"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && cliInput.trim()) {
                      handleCLICommand(cliInput.trim());
                    }
                  }}
                />
                <Button 
                  onClick={() => cliInput.trim() && handleCLICommand(cliInput.trim())}
                  disabled={!cliInput.trim()}
                >
                  Execute
                </Button>
              </div>
              
              <Alert variant="info">
                <AlertTitle>Quick Commands</AlertTitle>
                <AlertDescription>
                  Try: network deploy | flow add | tunnel create | help
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}