'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Input } from '@/components/starwind/input';
import { Label } from '@/components/starwind/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/starwind/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/starwind/alert';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/starwind/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Play, Pause } from 'lucide-react';

interface FlowRule {
  id: string;
  name: string;
  priority: number;
  match: {
    srcIp?: string;
    dstIp?: string;
    srcPort?: number;
    dstPort?: number;
    protocol?: string;
  };
  actions: {
    type: 'forward' | 'drop' | 'controller' | 'output';
    port?: number;
    value?: string;
  }[];
  status: 'active' | 'inactive';
  stats: {
    packets: number;
    bytes: number;
    duration: number;
  };
}

export default function SDNFlowManager() {
  const [flows, setFlows] = useState<FlowRule[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [operationStatus, setOperationStatus] = useState<'success' | 'error' | 'info' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // New flow form state
  const [newFlow, setNewFlow] = useState({
    name: '',
    priority: 100,
    srcIp: '',
    dstIp: '',
    srcPort: '',
    dstPort: '',
    protocol: 'tcp',
    action: 'forward',
    outputPort: ''
  });

  useEffect(() => {
    initializeFlows();
  }, []);

  const initializeFlows = () => {
    const sampleFlows: FlowRule[] = [
      {
        id: 'flow-1',
        name: 'Iran to Germany Tunnel',
        priority: 200,
        match: {
          srcIp: '192.168.1.0/24',
          dstIp: '10.0.0.0/24',
          protocol: 'tcp'
        },
        actions: [{ type: 'output', port: 1 }],
        status: 'active',
        stats: { packets: 15420, bytes: 7710000, duration: 3600 }
      },
      {
        id: 'flow-2',
        name: 'Block Suspicious Traffic',
        priority: 1000,
        match: {
          srcIp: '192.168.100.0/24',
          protocol: 'tcp'
        },
        actions: [{ type: 'drop' }],
        status: 'active',
        stats: { packets: 250, bytes: 125000, duration: 1800 }
      },
      {
        id: 'flow-3',
        name: 'VPN Traffic Redirect',
        priority: 150,
        match: {
          dstPort: 443,
          protocol: 'tcp'
        },
        actions: [{ type: 'output', port: 2 }],
        status: 'active',
        stats: { packets: 8900, bytes: 4450000, duration: 2400 }
      }
    ];

    setFlows(sampleFlows);
  };

  const createFlow = () => {
    if (!newFlow.name || !newFlow.dstIp) {
      setOperationStatus('error');
      setStatusMessage('Flow name and destination IP are required');
      return;
    }

    const flow: FlowRule = {
      id: `flow-${Date.now()}`,
      name: newFlow.name,
      priority: newFlow.priority,
      match: {
        srcIp: newFlow.srcIp || undefined,
        dstIp: newFlow.dstIp,
        srcPort: newFlow.srcPort ? parseInt(newFlow.srcPort) : undefined,
        dstPort: newFlow.dstPort ? parseInt(newFlow.dstPort) : undefined,
        protocol: newFlow.protocol
      },
      actions: [{
        type: newFlow.action as any,
        port: newFlow.outputPort ? parseInt(newFlow.outputPort) : undefined
      }],
      status: 'active',
      stats: { packets: 0, bytes: 0, duration: 0 }
    };

    setFlows(prev => [...prev, flow]);
    setIsCreating(false);
    setNewFlow({
      name: '', priority: 100, srcIp: '', dstIp: '', srcPort: '', 
      dstPort: '', protocol: 'tcp', action: 'forward', outputPort: ''
    });
    
    setOperationStatus('success');
    setStatusMessage(`Flow "${flow.name}" created successfully`);
  };

  const deleteFlow = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    setFlows(prev => prev.filter(f => f.id !== flowId));
    
    setOperationStatus('success');
    setStatusMessage(`Flow "${flow?.name}" deleted successfully`);
  };

  const toggleFlowStatus = (flowId: string) => {
    setFlows(prev => prev.map(flow => 
      flow.id === flowId 
        ? { ...flow, status: flow.status === 'active' ? 'inactive' : 'active' }
        : flow
    ));
    
    const flow = flows.find(f => f.id === flowId);
    const newStatus = flow?.status === 'active' ? 'inactive' : 'active';
    
    setOperationStatus('info');
    setStatusMessage(`Flow "${flow?.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SDN Flow Manager</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Flow Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Flow Rule</DialogTitle>
              <DialogDescription>
                Define match criteria and actions for the new flow rule.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="flowName">Flow Name</Label>
                  <Input
                    id="flowName"
                    value={newFlow.name}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter flow name"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={newFlow.priority}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="dstIp">Destination IP</Label>
                  <Input
                    id="dstIp"
                    value={newFlow.dstIp}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, dstIp: e.target.value }))}
                    placeholder="10.0.0.0/24"
                  />
                </div>
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={newFlow.action} onValueChange={(value) => setNewFlow(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forward">Forward</SelectItem>
                      <SelectItem value="output">Output to Port</SelectItem>
                      <SelectItem value="drop">Drop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={createFlow}>Create Flow</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Alerts */}
      {operationStatus && (
        <Alert variant={operationStatus}>
          <AlertTitle>Flow Operation</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="flows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flows">Active Flows</TabsTrigger>
          <TabsTrigger value="create">Create Flow</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Rules ({flows.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flows.map((flow) => (
                  <div key={flow.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{flow.name}</h3>
                        <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>
                          {flow.status}
                        </Badge>
                        <Badge variant="outline">Priority: {flow.priority}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFlowStatus(flow.id)}
                        >
                          {flow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedFlow(flow)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFlow(flow.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-muted-foreground">Match Criteria</div>
                        <div className="space-y-1">
                          {flow.match.srcIp && <div>Src IP: {flow.match.srcIp}</div>}
                          {flow.match.dstIp && <div>Dst IP: {flow.match.dstIp}</div>}
                          {flow.match.srcPort && <div>Src Port: {flow.match.srcPort}</div>}
                          {flow.match.dstPort && <div>Dst Port: {flow.match.dstPort}</div>}
                          {flow.match.protocol && <div>Protocol: {flow.match.protocol.toUpperCase()}</div>}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-muted-foreground">Actions</div>
                        <div className="space-y-1">
                          {flow.actions.map((action, idx) => (
                            <div key={idx}>
                              {action.type === 'output' ? `Output to port ${action.port}` : action.type}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-muted-foreground">Statistics</div>
                        <div className="space-y-1">
                          <div>Packets: {flow.stats.packets.toLocaleString()}</div>
                          <div>Bytes: {formatBytes(flow.stats.bytes)}</div>
                          <div>Duration: {formatDuration(flow.stats.duration)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Flow Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Flow Name</label>
                  <Input
                    value={newFlow.name}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter flow name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Input
                    type="number"
                    value={newFlow.priority}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Source IP</label>
                  <Input
                    value={newFlow.srcIp}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, srcIp: e.target.value }))}
                    placeholder="192.168.1.0/24"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Destination IP</label>
                  <Input
                    value={newFlow.dstIp}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, dstIp: e.target.value }))}
                    placeholder="10.0.0.0/24"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Source Port</label>
                  <Input
                    value={newFlow.srcPort}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, srcPort: e.target.value }))}
                    placeholder="8080"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Destination Port</label>
                  <Input
                    value={newFlow.dstPort}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, dstPort: e.target.value }))}
                    placeholder="443"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Protocol</label>
                  <Select value={newFlow.protocol} onValueChange={(value) => setNewFlow(prev => ({ ...prev, protocol: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="icmp">ICMP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Action</label>
                  <Select value={newFlow.action} onValueChange={(value) => setNewFlow(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forward">Forward</SelectItem>
                      <SelectItem value="output">Output to Port</SelectItem>
                      <SelectItem value="drop">Drop</SelectItem>
                      <SelectItem value="controller">Send to Controller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newFlow.action === 'output' && (
                  <div>
                    <label className="text-sm font-medium">Output Port</label>
                    <Input
                      value={newFlow.outputPort}
                      onChange={(e) => setNewFlow(prev => ({ ...prev, outputPort: e.target.value }))}
                      placeholder="1"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button onClick={createFlow}>Create Flow</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{flows.length}</div>
                <div className="text-sm text-muted-foreground">
                  {flows.filter(f => f.status === 'active').length} active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Packets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {flows.reduce((sum, f) => sum + f.stats.packets, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Bytes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatBytes(flows.reduce((sum, f) => sum + f.stats.bytes, 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert variant="info">
            <AlertTitle>Flow Statistics</AlertTitle>
            <AlertDescription>
              Statistics are updated in real-time from OpenFlow switches. 
              Use the CLI to get detailed per-flow statistics.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}