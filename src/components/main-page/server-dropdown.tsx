'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ServerListTab } from './server-list-tab';
import { ChevronDown, Server } from 'lucide-react';
import type { Server as ServerType, Tunnel } from '@/lib/types';

type ServerDropdownProps = {
  servers: ServerType[];
  tunnels: Tunnel[];
  pingStates: any;
  filteredServers: ServerType[];
  selectedServers: ServerType[];
  filter: string;
  isPending: boolean;
  setFilter: (value: string) => void;
  onSelectServer: (server: ServerType, checked: boolean) => void;
  onPingServer: (server: ServerType) => void;
  onMoveServer: (index: number, direction: 'up' | 'down') => void;
  onDeleteServer: (id: string) => void;
  onCleanupServer: (id: string) => void;
  onAddServer: () => void;
  onEditServer: (server: ServerType) => void;
  onExport: () => void;
  onImportClick: () => void;
  selectionLimit: number;
  isSelectionLimited: boolean;
};

export function ServerDropdown(props: ServerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>Server Management ({props.selectedServers.length} selected)</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[600px] sm:w-[700px]">
        <SheetHeader>
          <SheetTitle>Server Management</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ServerListTab {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}