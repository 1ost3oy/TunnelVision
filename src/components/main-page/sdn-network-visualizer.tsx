'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/starwind/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/starwind/select';
import { Input } from '@/components/starwind/input';
import { Label } from '@/components/starwind/label';
import { SDNAutoTunnel } from './sdn-auto-tunnel';
import { InlineAIChat } from '@/components/common/inline-ai-chat';

type NetworkNode = {
  id: string;
  name: string;
  type: 'controller' | 'switch' | 'host';
  x: number;
  y: number;
  status: 'active' | 'inactive';
  ip: string;
  serverName?: string;
};

type NetworkFlow = {
  id: string;
  from: string;
  to: string;
  protocol: string;
  port: number;
  action: 'allow' | 'block' | 'redirect';
  priority: number;
  packets: number;
  bytes: number;
};

type TrafficPath = {
  id: string;
  nodes: string[];
  active: boolean;
  bandwidth: number;
  latency: number;
};

export function SDNNetworkVisualizer({ servers = [] }: { servers?: any[] }) {
  const [nodes, setNodes] = useState<NetworkNode[]>(() => {
    const baseNodes = [
      { id: 'controller', name: 'SDN Controller', type: 'controller' as const, x: 400, y: 80, status: 'active' as const, ip: '192.168.1.1', serverName: '' },
      { id: 'switch1', name: 'Switch-1', type: 'switch' as const, x: 200, y: 250, status: 'active' as const, ip: '192.168.1.10', serverName: '' },
      { id: 'switch2', name: 'Switch-2', type: 'switch' as const, x: 600, y: 250, status: 'active' as const, ip: '192.168.1.20', serverName: '' },
    ];
    
    const hostNodes = servers.slice(0, 4).map((server, index) => ({
      id: `host${index + 1}`,
      name: `Host-${index + 1}`,
      type: 'host' as const,
      x: 100 + (index * 150),
      y: 400,
      status: 'active' as const,
      ip: server?.ipAddress || `10.0.0.${index + 1}`,
      serverName: server?.name || `Server-${index + 1}`
    }));
    
    // Fill remaining slots if less than 4 servers
    while (hostNodes.length < 4) {
      const index = hostNodes.length;
      hostNodes.push({
        id: `host${index + 1}`,
        name: `Host-${index + 1}`,
        type: 'host' as const,
        x: 100 + (index * 150),
        y: 400,
        status: 'active' as const,
        ip: `10.0.0.${index + 1}`,
        serverName: `Server-${index + 1}`
      });
    }
    
    return [...baseNodes, ...hostNodes];
  });

  const [flows, setFlows] = useState<NetworkFlow[]>([
    { id: 'f1', from: 'host1', to: 'host3', protocol: 'TCP', port: 80, action: 'allow', priority: 100, packets: 1250, bytes: 2048000 },
    { id: 'f2', from: 'host2', to: 'host4', protocol: 'UDP', port: 53, action: 'allow', priority: 200, packets: 890, bytes: 512000 },
  ]);

  const [trafficPaths, setTrafficPaths] = useState<TrafficPath[]>([
    { id: 'p1', nodes: ['host1', 'switch1', 'switch2', 'host3'], active: true, bandwidth: 100, latency: 15 },
    { id: 'p2', nodes: ['host2', 'switch1', 'switch2', 'host4'], active: true, bandwidth: 50, latency: 25 },
  ]);

  const [selectedFlow, setSelectedFlow] = useState<NetworkFlow | null>(null);
  const [newFlow, setNewFlow] = useState({ from: '', to: '', protocol: 'TCP', port: 80, action: 'allow' as const, priority: 100 });

  const getNodeColor = (node: NetworkNode) => {
    switch (node.type) {
      case 'controller': return '#ff0de0';
      case 'switch': return '#00d4e8';
      case 'host': return '#02ee9d';
      default: return '#666';
    }
  };

  const getConnectionPath = (from: NetworkNode, to: NetworkNode) => {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  };

  // مسیر نمایش ترافیک را بر اساس نزدیک‌ترین سوئیچ‌ها بین مبدأ و مقصد محاسبه می‌کند
  const computePathNodes = (fromId: string, toId: string): string[] => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    if (!fromNode || !toNode) return [];

    const switches = nodes.filter(n => n.type === 'switch');
    if (switches.length === 0) return [fromId, toId];

    // انتخاب نزدیک‌ترین سوئیچ به مبدأ و مقصد بر اساس مختصات X
    const nearestTo = (targetX: number) =>
      switches.reduce((prev, curr) =>
        Math.abs(curr.x - targetX) < Math.abs(prev.x - targetX) ? curr : prev
      , switches[0]);

    const fromSwitch = nearestTo(fromNode.x);
    const toSwitch = nearestTo(toNode.x);

    const seq: string[] = [fromId, fromSwitch.id];
    if (fromSwitch.id !== toSwitch.id) seq.push(toSwitch.id);
    seq.push(toId);

    return seq;
  };

  const addFlow = () => {
    // جلوگیری از افزودن قانون نامعتبر
    if (!newFlow.from || !newFlow.to || newFlow.from === newFlow.to) return;

    const flow: NetworkFlow = {
      id: `f${flows.length + 1}`,
      ...newFlow,
      packets: 0,
      bytes: 0
    };
    setFlows([...flows, flow]);
    setNewFlow({ from: '', to: '', protocol: 'TCP', port: 80, action: 'allow', priority: 100 });
  };

  // همگام‌سازی مسیرهای ترافیک با قوانین جریان تا اتصال‌ها بلافاصله در ویژوالایزر دیده شوند
  useEffect(() => {
    const newPaths: TrafficPath[] = flows
      .filter(f => f.from && f.to)
      .map((f) => {
        const nodesSeq = computePathNodes(f.from, f.to);
        return {
          id: `p-${f.id}`,
          nodes: nodesSeq,
          active: f.action === 'allow' || f.action === 'redirect',
          bandwidth: Math.max(10, 160 - f.priority),
          latency: Math.max(1, Math.round(f.priority / 5)),
        } as TrafficPath;
      });

    setTrafficPaths(newPaths);
  }, [flows, nodes]);

  const deleteFlow = (flowId: string) => {
    setFlows(flows.filter(f => f.id !== flowId));
  };

  const modifyFlow = (flowId: string, updates: Partial<NetworkFlow>) => {
    setFlows(flows.map(f => f.id === flowId ? { ...f, ...updates } : f));
  };

  // Simulate traffic animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFlows(prev => prev.map(flow => ({
        ...flow,
        packets: flow.packets + Math.floor(Math.random() * 10),
        bytes: flow.bytes + Math.floor(Math.random() * 1000)
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50">
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <circle cx="25" cy="25" r="20" stroke="#ff0de0"/>
                <circle cx="15" cy="15" r="3" fill="#00d4e8"/>
                <circle cx="35" cy="15" r="3" fill="#00d4e8"/>
                <circle cx="15" cy="35" r="3" fill="#02ee9d"/>
                <circle cx="35" cy="35" r="3" fill="#02ee9d"/>
                <path stroke="#666" d="M25 25L15 15M25 25L35 15M25 25L15 35M25 25L35 35"/>
              </g>
            </svg>
            SDN Network Topology
          </CardTitle>
          <InlineAIChat 
            servers={servers}
            context="SDN Network: Help with network topology, flow rules, and traffic management"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Network Visualization */}
        <div className="w-full flex justify-center">
          <svg width="100%" height="500" viewBox="0 0 800 500" className="border rounded-xl bg-gradient-to-br from-background via-card to-muted shadow-2xl overflow-hidden">
              <defs>
                <filter id="neonGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))"/>
                  <stop offset="50%" stopColor="hsl(var(--secondary))"/>
                  <stop offset="100%" stopColor="hsl(var(--accent))"/>
                </linearGradient>
                <radialGradient id="dataStreamGrad" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
                  <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.05"/>
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.02"/>
                </radialGradient>
              </defs>
              
              {/* Animated Background - Similar to Header */}
              <g opacity="0.2">
                <circle cx="50" cy="50" r="2" fill="hsl(var(--primary))">
                  <animate attributeName="cx" values="50;750;50" dur="6s" repeatCount="indefinite"/>
                </circle>
                <circle cx="100" cy="100" r="1.5" fill="hsl(var(--secondary))">
                  <animate attributeName="cx" values="100;700;100" dur="8s" repeatCount="indefinite"/>
                </circle>
                <circle cx="150" cy="150" r="1" fill="hsl(var(--accent))">
                  <animate attributeName="cx" values="150;650;150" dur="10s" repeatCount="indefinite"/>
                </circle>
                
                {/* Horizontal flowing lines */}
                <line x1="0" y1="150" x2="800" y2="150" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="stroke-dasharray" values="0,800;400,400;800,0" dur="4s" repeatCount="indefinite"/>
                </line>
                <line x1="0" y1="250" x2="800" y2="250" stroke="hsl(var(--secondary))" strokeWidth="0.5" opacity="0.2">
                  <animate attributeName="stroke-dasharray" values="0,800;400,400;800,0" dur="5s" repeatCount="indefinite"/>
                </line>
                <line x1="0" y1="350" x2="800" y2="350" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.1">
                  <animate attributeName="stroke-dasharray" values="0,800;400,400;800,0" dur="6s" repeatCount="indefinite"/>
                </line>
              </g>
              {/* Connections */}
              {trafficPaths.map(path => {
                const pathNodes = path.nodes.map(nodeId => nodes.find(n => n.id === nodeId)!);
                return (
                  <g key={path.id}>
                    {pathNodes.slice(0, -1).map((node, i) => {
                      const nextNode = pathNodes[i + 1];
                      return (
                        <g key={`${node.id}-${nextNode.id}`}>
                          <path
                            d={getConnectionPath(node, nextNode)}
                            stroke={path.active ? 'url(#dataFlow)' : '#475569'}
                            strokeWidth="3"
                            strokeDasharray={path.active ? '10,5' : 'none'}
                            filter={path.active ? 'url(#neonGlow)' : 'none'}
                          >
                            {path.active && (
                              <animate attributeName="stroke-dashoffset" values="0;-15" dur="1s" repeatCount="indefinite"/>
                            )}
                          </path>
                          {/* Traffic flow animation */}
                          {path.active && (
                            <circle r="3" fill="#06b6d4" filter="url(#neonGlow)">
                              <animateMotion dur="2s" repeatCount="indefinite">
                                <path d={getConnectionPath(node, nextNode)} />
                              </animateMotion>
                            </circle>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const nodeColor = node.type === 'controller' ? 'hsl(var(--primary))' : 
                                 node.type === 'switch' ? 'hsl(var(--secondary))' : 'hsl(var(--accent))';
                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === 'controller' ? 28 : 22}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="2"
                      opacity="0.6"
                      strokeDasharray="5,3"
                      className={node.status === 'active' ? 'animate-pulse' : ''}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === 'controller' ? 22 : 18}
                      fill={nodeColor}
                      stroke="#1e293b"
                      strokeWidth="3"
                      filter="url(#neonGlow)"
                      className={node.status === 'active' ? '' : 'opacity-50'}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === 'controller' ? 12 : 10}
                      fill="#0f172a"
                      opacity="0.8"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      className="text-sm font-bold fill-white"
                      filter="url(#neonGlow)"
                    >
                      {node.type === 'controller' ? '⚡' : node.type === 'switch' ? '⚙' : '💻'}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 45}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white"
                    >
                      {node.name}
                    </text>
                    {node.serverName && (
                      <text
                        x={node.x}
                        y={node.y + 58}
                        textAnchor="middle"
                        className="text-xs fill-cyan-300 opacity-90"
                      >
                        {node.serverName}
                      </text>
                    )}
                    <text
                      x={node.x}
                      y={node.y + (node.serverName ? 71 : 58)}
                      textAnchor="middle"
                      className="text-xs fill-gray-200 opacity-80"
                    >
                      {node.ip}
                    </text>
                  </g>
                );
              })}
            </svg>
        </div>
        
        {/* Control Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Auto-Tunnel Controller */}
          <div>
            <SDNAutoTunnel servers={nodes.filter(n => n.type === 'host')} />
          </div>
          {/* Flow Management */}
          <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Flow Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 max-h-80 overflow-y-auto">
                {flows.map(flow => (
                  <div key={flow.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="text-xs font-medium">
                        {nodes.find(n => n.id === flow.from)?.name} → {nodes.find(n => n.id === flow.to)?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {flow.protocol}:{flow.port} | {flow.action} | P:{flow.priority}
                      </div>
                      <div className="text-xs text-green-500">
                        {flow.packets} pkts, {(flow.bytes / 1024).toFixed(1)}KB
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedFlow(flow)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modify Flow Rule</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Action</Label>
                              <Select value={flow.action} onValueChange={(value: 'allow' | 'block' | 'redirect') => modifyFlow(flow.id, { action: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="allow">Allow</SelectItem>
                                  <SelectItem value="block">Block</SelectItem>
                                  <SelectItem value="redirect">Redirect</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Input 
                                type="number" 
                                value={flow.priority} 
                                onChange={(e) => modifyFlow(flow.id, { priority: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="destructive" onClick={() => deleteFlow(flow.id)}>
                        Del
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add New Flow */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full">Add Flow Rule</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Flow Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>From</Label>
                        <Select value={newFlow.from} onValueChange={(value) => setNewFlow({...newFlow, from: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {nodes.filter(n => n.type === 'host').map(node => (
                              <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>To</Label>
                        <Select value={newFlow.to} onValueChange={(value) => setNewFlow({...newFlow, to: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {nodes.filter(n => n.type === 'host').map(node => (
                              <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Protocol</Label>
                          <Select value={newFlow.protocol} onValueChange={(value) => setNewFlow({...newFlow, protocol: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TCP">TCP</SelectItem>
                              <SelectItem value="UDP">UDP</SelectItem>
                              <SelectItem value="ICMP">ICMP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Port</Label>
                          <Input 
                            type="number" 
                            value={newFlow.port} 
                            onChange={(e) => setNewFlow({...newFlow, port: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <Button onClick={addFlow} className="w-full">Add Flow</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

          {/* Network Stats */}
          <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Active Nodes:</span>
                    <Badge variant="secondary">{nodes.filter(n => n.status === 'active').length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Flow Rules:</span>
                    <Badge variant="secondary">{flows.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Paths:</span>
                    <Badge variant="secondary">{trafficPaths.filter(p => p.active).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Traffic:</span>
                    <Badge variant="secondary">{flows.reduce((sum, f) => sum + f.packets, 0)} pkts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Controller Status:</span>
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}