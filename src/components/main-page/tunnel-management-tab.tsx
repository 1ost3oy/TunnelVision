'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SingleTunnelTab } from './single-tunnel-tab';
import { CombinedTunnelTab } from './combined-tunnel-tab';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InlineAIChat } from '@/components/common/inline-ai-chat';
import type { Server, LogEntry } from '@/lib/types';

type TunnelManagementTabProps = {
  selectedServers: Server[];
  setSelectedServers: (servers: Server[]) => void;
  setLogs: (logs: LogEntry[]) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  logs: LogEntry[];
  onMoveServer: (index: number, direction: 'up' | 'down') => void;
};

export function TunnelManagementTab({
  selectedServers,
  setSelectedServers,
  setLogs,
  isPending,
  startTransition,
  logs,
  onMoveServer
}: TunnelManagementTabProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState('single');

  const pages = [
    {
      id: 'tunnels',
      title: 'Tunnel Creation',
      content: (
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Tunnel</TabsTrigger>
            <TabsTrigger value="combined">Combined Tunnel</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="mt-4">
            <SingleTunnelTab
              selectedServers={selectedServers}
              setSelectedServers={setSelectedServers}
              setLogs={setLogs}
              isPending={isPending}
              startTransition={startTransition}
              logs={logs}
            />
          </TabsContent>
          <TabsContent value="combined" className="mt-4">
            <CombinedTunnelTab
              selectedServers={selectedServers}
              setLogs={setLogs}
              isPending={isPending}
              startTransition={startTransition}
              onMoveServer={onMoveServer}
            />
          </TabsContent>
        </Tabs>
      )
    }
  ];

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50">
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path stroke="#dd0df4" d="M9.375 40.625a7.375 7.375 0 0 1 0-10.417L14.583 25A7.375 7.375 0 0 1 25 25a7.375 7.375 0 0 1 0 10.417l-5.208 5.208a7.375 7.375 0 0 1-10.417 0m27.083-16.667l5.209-5.208a7.375 7.375 0 0 0 0-10.417v0a7.375 7.375 0 0 0-10.417 0l-5.208 5.209a7.375 7.375 0 0 0 0 10.416v0a7.375 7.375 0 0 0 10.416 0"/>
                <path stroke="#09e6d4" d="m20.833 29.167l8.334-8.334"/>
              </g>
            </svg>
            {pages[currentPage].title}
          </CardTitle>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentPage + 1} / {pages.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pages.length <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pages.length <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <InlineAIChat 
              servers={selectedServers}
              logs={logs}
              context="Tunnel Management: Help with tunnel creation, configuration, and troubleshooting"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {pages[currentPage].content}
      </CardContent>
    </Card>
  );
}