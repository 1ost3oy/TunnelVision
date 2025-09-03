
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Loader2, CheckCircle2, Clock
} from 'lucide-react';
import {
    IconActiveTunnel,
    IconDelete,
    IconSave,
    IconPing
} from '@/components/common/abstract-icons';
import { cn } from '@/lib/utils';
import type { Server, Tunnel } from '@/lib/types';

import { PingStatus } from './ui-helpers';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/starwind/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/starwind/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';


type ActionState = {
  [id: string]: {
    isPinging?: boolean;
    latency?: number | null;
    isSaving?: boolean;
  };
};

export function TunnelList({
  tunnels,
  servers,
  onDelete,
  onSave,
  onPing,
}: {
  tunnels: Tunnel[];
  servers: Server[];
  onDelete: (id: string) => void;
  onSave: (tunnel: Tunnel) => void;
  onPing: (tunnel: Tunnel) => void;
}) {
  const getServerById = (id: string) => servers.find((s) => s.id === id);
  const getServerName = (id: string) =>
    getServerById(id)?.name || 'Unknown Server';
  const [actionStates, setActionStates] = useState<ActionState>({});

  const handleSaveTunnel = async (tunnel: Tunnel) => {
    setActionStates((prev) => ({
      ...prev,
      [tunnel.id]: { ...prev[tunnel.id], isSaving: true },
    }));
    await onSave(tunnel);
    setActionStates((prev) => ({
      ...prev,
      [tunnel.id]: { ...prev[tunnel.id], isSaving: false },
    }));
  };

  const getSaveDisabled = (tunnel: Tunnel, state: any) => {
    const isReverseSsh = tunnel.type === 'Reverse Tunnel (via SSH)';
    const server2 = getServerById(tunnel.server2Id);
    const canSaveReverseSsh = isReverseSsh && server2 && !!server2.sshKeyConfigured;
    
    if (state.isSaving || tunnel.isSaved) return true;
    if (isReverseSsh && !canSaveReverseSsh) return true;
    return false;
  };

  const getTooltipText = (tunnel: Tunnel) => {
    if (tunnel.isSaved) {
      return "This tunnel's configuration is saved and will persist on reboot.";
    }
    
    const isReverseSsh = tunnel.type === 'Reverse Tunnel (via SSH)';
    const server2 = getServerById(tunnel.server2Id);
    const canSaveReverseSsh = isReverseSsh && server2 && !!server2.sshKeyConfigured;
    
    if (isReverseSsh && !canSaveReverseSsh) {
      return 'Reverse SSH tunnels require the destination server (Server 1) to have key-based authentication configured to be saveable.';
    }
    
    return 'Save tunnel configuration to persist on reboot.';
  };

  if (tunnels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2">
              {/* Inactive Tunnel Network */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-gray-500 rounded-full animate-pulse-inactive"></div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-gray-500 to-gray-400 animate-pulse-slow"></div>
                <div className="w-3 h-3 border-2 border-gray-400 rounded-full animate-pulse-inactive"></div>
              </div>
              {/* Inactive Status Indicator */}
              <div className="relative">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-slow"></div>
              </div>
            </div>
          </div>
          <CardDescription>
            List of currently configured tunnels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-10">
            <p>No active tunnels.</p>
            <p className="text-sm">Create a tunnel to see it listed here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2">
            {/* Animated Tunnel Network */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-green-500 rounded-full animate-pulse-node"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 animate-pulse"></div>
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full animate-pulse-node-delay"></div>
            </div>
            {/* Connection Status Indicator */}
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <CardDescription>List of currently configured tunnels.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
            <TooltipProvider>
              <div className="space-y-2 pr-4">
                {tunnels.map((tunnel) => {
                  const state = actionStates[tunnel.id] || {};
                  const saveDisabled = getSaveDisabled(tunnel, state);

                  const SaveButton = (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleSaveTunnel(tunnel)}
                      disabled={saveDisabled}
                    >
                      {state.isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : tunnel.isSaved ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <IconSave className="h-4 w-4" />
                      )}
                    </Button>
                  );

                  return (
                    <Card
                      key={tunnel.id}
                      className={cn(tunnel.isSaved && 'border-green-500/50')}
                    >
                      <CardContent className="p-3 flex justify-between items-center">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{getServerName(tunnel.server1Id)}</span>
                            <span>&harr;</span>
                            <span>{getServerName(tunnel.server2Id)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ({tunnel.type} / {tunnel.tunnelName})
                            {tunnel.domain && ` / ${tunnel.domain}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(tunnel.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          <div className="flex items-center gap-1 w-28">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onPing(tunnel)}
                              disabled={tunnel.isPinging}
                            >
                              {tunnel.isPinging ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <IconPing className="h-4 w-4" />
                              )}
                            </Button>
                            <PingStatus latency={tunnel.latency} />
                          </div>

                          <Tooltip>
                             <TooltipTrigger asChild>
                              {saveDisabled && !state.isSaving && !tunnel.isSaved ? (
                                <span>{SaveButton}</span>
                              ) : (
                                SaveButton
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getTooltipText(tunnel)}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-8 w-8"
                              >
                                <IconDelete className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Delete this tunnel?
                                </DialogTitle>
                                <DialogDescription>
                                  This will not remove the tunnel from the
                                  servers, but it will remove it from this list.
                                  This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                   <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button variant="destructive"
                                  onClick={() => onDelete(tunnel.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TooltipProvider>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

