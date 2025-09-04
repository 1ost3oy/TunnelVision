'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/starwind/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/starwind/pagination';
import { Network, Zap, Terminal, Settings, Activity, Shield } from 'lucide-react';

export default function SDNPaginatedDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<'success' | 'info' | null>('success');

  const pages = [
    {
      id: 1,
      icon: <Network className="w-4 h-4" />,
      title: 'Network Topology',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Controller (192.168.1.1)</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Switch-1 (192.168.1.10)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: <Zap className="w-4 h-4" />,
      title: 'Flow Rules',
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="font-medium">Flow-1: Priority 200</div>
                <div className="text-muted-foreground">Match: ip_dst=10.0.0.1 → Action: output:1</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 3,
      icon: <Terminal className="w-4 h-4" />,
      title: 'CLI Interface',
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm">
                <div>$ network status</div>
                <div>Network: Active | Nodes: 4 | Links: 6</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 4,
      icon: <Activity className="w-4 h-4" />,
      title: 'Monitoring',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">2,000</div>
                <div className="text-sm text-muted-foreground">Packets</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">1.0 MB</div>
                <div className="text-sm text-muted-foreground">Bytes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">15ms</div>
                <div className="text-sm text-muted-foreground">Latency</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 5,
      icon: <Shield className="w-4 h-4" />,
      title: 'Security',
      content: (
        <div className="space-y-4">
          <Alert variant="success">
            <AlertTitle>Security Status</AlertTitle>
            <AlertDescription>All security policies are active and monitoring traffic.</AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 6,
      icon: <Settings className="w-4 h-4" />,
      title: 'Settings',
      content: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>OpenFlow Version</span>
                  <span className="text-muted-foreground">1.3</span>
                </div>
                <div className="flex justify-between">
                  <span>Controller Port</span>
                  <span className="text-muted-foreground">6633</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const currentPageData = pages.find(p => p.id === currentPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SDN Dashboard</h1>
        <Button onClick={() => setStatus('info')}>Refresh</Button>
      </div>

      {status && (
        <Alert variant={status}>
          <AlertTitle>System Status</AlertTitle>
          <AlertDescription>SDN network is operational and all services are running.</AlertDescription>
        </Alert>
      )}

      {/* Pagination Navigation */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
            />
          </PaginationItem>
          
          {pages.map((page) => (
            <PaginationItem key={page.id}>
              <PaginationLink
                href="#"
                isActive={currentPage === page.id}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(page.id);
                }}
                className="flex items-center space-x-2"
              >
                {page.icon}
                <span className="hidden sm:inline">{page.title}</span>
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < pages.length) setCurrentPage(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Current Page Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {currentPageData?.icon}
            <span>{currentPageData?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPageData?.content}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Network className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-lg font-bold">4</div>
            <div className="text-sm text-muted-foreground">Nodes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-lg font-bold">6</div>
            <div className="text-sm text-muted-foreground">Flows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-lg font-bold">15ms</div>
            <div className="text-sm text-muted-foreground">Latency</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-lg font-bold">Active</div>
            <div className="text-sm text-muted-foreground">Security</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}