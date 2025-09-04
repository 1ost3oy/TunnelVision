'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TunnelList } from './tunnel-list';
import { Network, ChevronUp } from 'lucide-react';
import type { Server, Tunnel } from '@/lib/types';

type FloatingTunnelsProps = {
  tunnels: Tunnel[];
  servers: Server[];
  onDelete: (id: string) => void;
  onPing: (tunnel: Tunnel) => void;
  onSave: (tunnel: Tunnel) => void;
};

export function FloatingTunnels({ tunnels, servers, onDelete, onPing, onSave }: FloatingTunnelsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="shadow-lg bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
          >
            <Network className="w-4 h-4 mr-2" />
            Active Tunnels
            {tunnels.length > 0 && (
              <span className="ml-2 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs">
                {tunnels.length}
              </span>
            )}
            <ChevronUp className="w-4 h-4 ml-2" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[500px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Active Tunnels
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <TunnelList
              tunnels={tunnels}
              servers={servers}
              onDelete={onDelete}
              onPing={onPing}
              onSave={onSave}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}