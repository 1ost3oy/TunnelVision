'use client';

import { useState } from 'react';
import {
  IconImport,
  IconExport,
  IconAddServer,
  IconEditServer,
  IconCleanup,
  IconDelete,
  IconPing
} from '@/components/common/abstract-icons';
import { AnimatedArrows } from '@/components/common/icons';
import { PingStatus } from './ui-helpers';
import { InlineAIChat } from '@/components/common/inline-ai-chat';

import type { Server, Tunnel } from '@/lib/types';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Network } from 'lucide-react';

type ConfirmDialogProps = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => Promise<void> | void;
  variant?: 'destructive' | 'default';
  children: React.ReactNode;
};

function ConfirmDialog({ title, description, actionLabel, onConfirm, variant = 'destructive', children }: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button variant={variant} onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ServerItemProps = {
  server: Server;
  pingState: { isPinging: boolean; latency?: number };
  tunnelIps: string[];
  isSelected: boolean;
  isDisabled: boolean;
  originalIndex: number;
  serversLength: number;
  isPending: boolean;
  onSelectServer: (server: Server, checked: boolean) => void;
  onPingServer: (server: Server) => void;
  onMoveServer: (index: number, direction: 'up' | 'down') => void;
  onEditServer: (server: Server) => void;
  onCleanupServer: (id: string) => void;
  onDeleteServer: (id: string) => void;
};

function ServerItem({
  server,
  pingState,
  tunnelIps,
  isSelected,
  isDisabled,
  originalIndex,
  serversLength,
  isPending,
  onSelectServer,
  onPingServer,
  onMoveServer,
  onEditServer,
  onCleanupServer,
  onDeleteServer,
}: ServerItemProps) {
  return (
    <div key={server.id} className="flex items-center gap-2">
      <Checkbox
        id={`server-sheet-${server.id}`}
        checked={isSelected}
        onCheckedChange={(checked) => onSelectServer(server, !!checked)}
        disabled={isDisabled}
      />
      <Label htmlFor={`server-sheet-${server.id}`} className="flex-1 cursor-pointer">
        <Card className="hover:bg-card/80 transition-colors">
          <CardHeader className="flex flex-col items-start space-y-0 pb-2 p-4">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">{server.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {server.username}@{server.ipAddress}:{server.sshPort || 22}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <PingStatus latency={pingState.latency} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    onPingServer(server);
                  }}
                  disabled={pingState.isPinging}
                >
                  {pingState.isPinging ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <IconPing className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    onEditServer(server);
                  }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <IconEditServer className="h-6 w-6" />
                  )}
                </Button>
                <ConfirmDialog
                  title="Are you absolutely sure?"
                  description={`This will attempt to delete all tunnels, interfaces, and configurations created by this tool on the server "${server.name}". This action is irreversible.`}
                  actionLabel="Cleanup Server"
                  onConfirm={() => onCleanupServer(server.id)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 h-9 w-9"
                    type="button"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <IconCleanup className="h-6 w-6" />
                    )}
                  </Button>
                </ConfirmDialog>
                <ConfirmDialog
                  title="Are you sure?"
                  description={`This action cannot be undone. This will permanently delete the server "${server.name}" and any associated tunnels from this application's list.`}
                  actionLabel="Delete"
                  onConfirm={() => onDeleteServer(server.id)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                    type="button"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <IconDelete className="h-6 w-6" />
                    )}
                  </Button>
                </ConfirmDialog>
              </div>
            </div>
            {tunnelIps.length > 0 && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground pt-1'>
                <Network className='h-3 w-3'/>
                {tunnelIps.join(', ')}
              </div>
            )}
          </CardHeader>
        </Card>
      </Label>
      <div className="flex items-center">
        <AnimatedArrows 
          className="w-12 h-12" 
          onUpClick={() => originalIndex > 0 && onMoveServer(originalIndex, 'up')}
          onDownClick={() => originalIndex < serversLength - 1 && onMoveServer(originalIndex, 'down')}
        />
      </div>

    </div>
  );
}


type ActionState = {
  [id: string]: {
    isPinging?: boolean;
    latency?: number | null;
  };
};

export function ServerListTab({
  servers,
  tunnels,
  pingStates,
  filteredServers,
  selectedServers,
  filter,
  isPending,
  setFilter,
  onSelectServer,
  onPingServer,
  onMoveServer,
  onDeleteServer,
  onCleanupServer,
  onAddServer,
  onEditServer,
  onExport,
  onImportClick,
  selectionLimit,
  isSelectionLimited,
}: {
  servers: Server[];
  tunnels: Tunnel[];
  pingStates: ActionState;
  filteredServers: Server[];
  selectedServers: Server[];
  filter: string;
  isPending: boolean;
  setFilter: (value: string) => void;
  onSelectServer: (server: Server, checked: boolean) => void;
  onPingServer: (server: Server) => void;
  onMoveServer: (index: number, direction: 'up' | 'down') => void;
  onDeleteServer: (id: string) => void;
  onCleanupServer: (id: string) => void;
  onAddServer: () => void;
  onEditServer: (server: Server) => void;
  onExport: () => void;
  onImportClick: () => void;
  selectionLimit: number;
  isSelectionLimited: boolean;
}) {

  const getTunnelIpsForServer = (serverId: string) => {
    return tunnels
      .filter(t => t.server1Id === serverId || t.server2Id === serverId)
      .map(t => (t.server1Id === serverId ? t.tunnelIp1 : t.tunnelIp2));
  };


  return (
    <Card>
        <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50"><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path stroke="#dd0df4" d="M39.583 20.833V6.25m-29.166 0v29.167zM25 14.583V43.75zm14.583 14.584V43.75z"/><path stroke="#09e6d4" d="M10.417 35.417a4.166 4.166 0 1 0 0 8.332a4.166 4.166 0 0 0 0-8.332M25 6.25a4.167 4.167 0 1 0 0 8.333a4.167 4.167 0 0 0 0-8.333m14.583 14.583a4.167 4.167 0 1 0 0 8.334a4.167 4.167 0 0 0 0-8.334"/></g></svg>
                Server Management
             </CardTitle>
             <p className="text-sm text-muted-foreground pt-2">
                Add, remove, and select your servers. ({selectedServers.length}
                {isSelectionLimited ? `/${selectionLimit}` : ''} selected)
            </p>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                    <Input
                        placeholder="Filter servers..."
                        value={filter}
                        onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
                        className="flex-grow"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onImportClick}
                        disabled={isPending}
                        className="flex-grow-0"
                        >
                        <IconImport className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onExport}
                        disabled={isPending}
                        className="flex-grow-0"
                        >
                        <IconExport className="h-6 w-6" />
                    </Button>
                    <Button onClick={onAddServer} size="icon" className="flex-grow-0" disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <IconAddServer className="h-6 w-6" />
                        )}
                    </Button>
                    <InlineAIChat 
                        servers={servers}
                        context="Server Management: Help with server configuration, troubleshooting, and optimization"
                    />
                </div>
            </div>
            <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                    {filteredServers.length > 0 ? (
                    filteredServers.map((server) => {
                        const pingState = {
                        isPinging: pingStates[server.id]?.isPinging ?? false,
                        latency: pingStates[server.id]?.latency ?? undefined,
                        };
                        const originalIndex = servers.findIndex((s) => s.id === server.id);
                        const tunnelIps = getTunnelIpsForServer(server.id);
                        const isSelected = selectedServers.some((s) => s.id === server.id);
                        const isDisabled = isSelectionLimited &&
                            selectedServers.length >= selectionLimit &&
                            !isSelected;

                        return (
                            <ServerItem
                                key={server.id}
                                server={server}
                                pingState={pingState}
                                tunnelIps={tunnelIps}
                                isSelected={isSelected}
                                isDisabled={isDisabled}
                                originalIndex={originalIndex}
                                serversLength={servers.length}
                                isPending={isPending}
                                onSelectServer={onSelectServer}
                                onPingServer={onPingServer}
                                onMoveServer={onMoveServer}
                                onEditServer={onEditServer}
                                onCleanupServer={onCleanupServer}
                                onDeleteServer={onDeleteServer}
                            />
                        );
                    })
                    ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No servers found.</p>
                        <p className="text-sm">Click "Add Server" to get started.</p>
                    </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
  );
}
