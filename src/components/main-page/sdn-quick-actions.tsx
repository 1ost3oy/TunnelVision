'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Input } from '@/components/starwind/input';
import { Label } from '@/components/starwind/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/starwind/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/starwind/alert';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/starwind/dialog';
import { Network, Shield, Zap, Settings, Globe, Lock } from 'lucide-react';

export default function SDNQuickActions() {
  const [alertStatus, setAlertStatus] = useState<'success' | 'error' | 'warning' | 'info' | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (status: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlertStatus(status);
    setAlertMessage(message);
    setTimeout(() => setAlertStatus(null), 3000);
  };

  const quickActions = [
    {
      title: 'Deploy Secure Tunnel',
      description: 'Create encrypted tunnel between Iran and Germany',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => showAlert('success', 'Secure tunnel deployed successfully')
    },
    {
      title: 'Block Suspicious Traffic',
      description: 'Add security flow rules to block malicious IPs',
      icon: <Lock className="w-6 h-6" />,
      color: 'bg-red-500',
      action: () => showAlert('warning', 'Security rules activated')
    },
    {
      title: 'Optimize Network',
      description: 'Auto-optimize paths and bandwidth allocation',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => showAlert('info', 'Network optimization in progress')
    },
    {
      title: 'Global Load Balance',
      description: 'Distribute traffic across all available nodes',
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => showAlert('success', 'Load balancing configured')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SDN Quick Actions</h1>

      {alertStatus && (
        <Alert variant={alertStatus}>
          <AlertTitle>Action Result</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`${action.color} rounded-lg p-3 text-white`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button onClick={action.action} size="sm">
                    Execute
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Flow Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Flow Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Create Custom Flow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Flow Rule</DialogTitle>
                  <DialogDescription>
                    Define specific match criteria and actions for your flow rule.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="ruleName">Rule Name</Label>
                    <Input id="ruleName" placeholder="My Custom Rule" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="srcIp">Source IP</Label>
                      <Input id="srcIp" placeholder="192.168.1.0/24" />
                    </div>
                    <div>
                      <Label htmlFor="dstIp">Destination IP</Label>
                      <Input id="dstIp" placeholder="10.0.0.0/24" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="action">Action</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forward">Forward</SelectItem>
                        <SelectItem value="drop">Drop</SelectItem>
                        <SelectItem value="redirect">Redirect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => showAlert('success', 'Custom flow rule created')}>
                    Create Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Network Deployment Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Network Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Network className="w-4 h-4 mr-2" />
                  Deploy New Network
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy SDN Network</DialogTitle>
                  <DialogDescription>
                    Configure and deploy a new SDN network topology.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="networkName">Network Name</Label>
                    <Input id="networkName" placeholder="Production Network" />
                  </div>
                  <div>
                    <Label htmlFor="topology">Topology Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topology" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mesh">Mesh Network</SelectItem>
                        <SelectItem value="star">Star Topology</SelectItem>
                        <SelectItem value="ring">Ring Topology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nodes">Number of Nodes</Label>
                      <Input id="nodes" type="number" placeholder="5" />
                    </div>
                    <div>
                      <Label htmlFor="bandwidth">Bandwidth (Mbps)</Label>
                      <Input id="bandwidth" type="number" placeholder="1000" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => showAlert('info', 'Network deployment started')}>
                    Deploy Network
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Predefined Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Network Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => showAlert('success', 'Iran-Germany secure tunnel template applied')}
            >
              <Shield className="w-6 h-6 mb-2" />
              Iran-Germany Secure
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => showAlert('success', 'High-speed mesh network template applied')}
            >
              <Zap className="w-6 h-6 mb-2" />
              High-Speed Mesh
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => showAlert('success', 'Load balanced network template applied')}
            >
              <Globe className="w-6 h-6 mb-2" />
              Load Balanced
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}