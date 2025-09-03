'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  PlusCircle, Network, Wifi, Loader2, Pencil, Trash2, ArrowUp, ArrowDown, FileUp, FileDown, ShieldX, Settings, Copy, Check, Eye, EyeOff
} from 'lucide-react';
import { PingStatus } from '../main-page/ui-helpers';

import type { Server, Tunnel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/starwind/tooltip';
import { Card, CardHeader, CardTitle } from '@/components/starwind/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/starwind/dialog";
import { Button } from '@/components/starwind/button';
import { Input } from '@/components/starwind/input';
import { Checkbox } from '@/components/starwind/checkbox';
import { Label } from '@/components/starwind/label';
import { ScrollArea } from '@/components/ui/scroll-area';


type ActionState = {
  [id: string]: {
    isPinging?: boolean;
    latency?: number | null;
  };
};

function SettingsDialog({ setSheetOpen }: { setSheetOpen: (open: boolean) => void }) {
    const [apiKey, setApiKey] = useState('');
    const [isPending, startTransition] = useTransition();
    const [hasCopied, setHasCopied] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Placeholder: Load API key from localStorage or default
        const savedKey = localStorage.getItem('apiKey') || '';
        setApiKey(savedKey);
    }, []);

    const handleSave = () => {
        startTransition(async () => {
            // Placeholder: Save API key to localStorage
            localStorage.setItem('apiKey', apiKey);
            toast({ title: 'API Key Updated', description: 'Your new API key has been saved.' });
        });
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    }

    const handleGenerateNewKey = () => {
        const newKey = 'secret_' + Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
        setApiKey(newKey);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-grow">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Application Settings</DialogTitle>
                    <DialogDescription>Manage your application-wide settings here, like the API Key.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">API Secret Key</Label>
                        <div className="flex items-center gap-2">
                            <Input id="api-key" type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCopyToClipboard}>
                                {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleGenerateNewKey}>Generate New Key</Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin mr-2" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ServerListSheet({
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
  setSheetOpen,
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
  setSheetOpen: (open: boolean) => void;
}) {

  const getTunnelIpsForServer = (serverId: string) => {
    return tunnels
      .filter(t => t.server1Id === serverId || t.server2Id === serverId)
      .map(t => (t.server1Id === serverId ? t.tunnelIp1 : t.tunnelIp2));
  };


  return (
    <>
      <div className="px-6 pb-4 border-b">
        <p className="text-sm text-muted-foreground mb-4">
          Add, remove, and select your servers. ({selectedServers.length}
          {isSelectionLimited ? `/${selectionLimit}` : ''} selected)
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Input
            placeholder="Filter servers..."
            value={filter}
            onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
            className="flex-grow"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onImportClick}
              disabled={isPending}
              className="flex-grow"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isPending}
              className="flex-grow"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <SettingsDialog setSheetOpen={setSheetOpen} />
            <Button onClick={onAddServer} size="sm" className="flex-grow">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Server
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-4">
            {filteredServers.length > 0 ? (
              filteredServers.map((server, index) => {
                const pingState = pingStates[server.id] || {
                  isPinging: false,
                  latency: undefined,
                };
                const originalIndex = servers.findIndex(
                  (s) => s.id === server.id
                );
                const tunnelIps = getTunnelIpsForServer(server.id);

                return (
                  <div key={server.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`server-sheet-${server.id}`}
                      checked={selectedServers.some((s) => s.id === server.id)}
                      onCheckedChange={(checked) => onSelectServer(server, !!checked)}
                      disabled={
                        isSelectionLimited &&
                        selectedServers.length >= selectionLimit &&
                        !selectedServers.some((s) => s.id === server.id)
                      }
                    />
                    <Label
                      htmlFor={`server-sheet-${server.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className="hover:bg-card/80 transition-colors">
                        <CardHeader className="flex flex-col items-start space-y-0 pb-2 p-4">
                           <div className="flex flex-row items-center justify-between w-full">
                                <div className="flex-1">
                                    <CardTitle className="text-sm font-medium">
                                    {server.name}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                    {server.username}@{server.ipAddress}:{server.sshPort || 22}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PingStatus latency={pingState.latency} />
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPingServer(server);
                                    }}
                                    disabled={pingState.isPinging}
                                    >
                                    {pingState.isPinging ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wifi className="h-4 w-4" />
                                    )}
                                    </Button>
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
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMoveServer(originalIndex, 'up')}
                        disabled={originalIndex === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMoveServer(originalIndex, 'down')}
                        disabled={originalIndex === servers.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditServer(server)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                       <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-500 hover:text-amber-500 h-8 w-8"
                          >
                            <ShieldX className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              This will attempt to delete all tunnels, interfaces, and configurations created by this tool on the server "{server.name}". This action is irreversible.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => onCleanupServer(server.id)}
                            >
                              Cleanup Server
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will
                              permanently delete the server "{server.name}" and
                              any associated tunnels from this application's list.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                               <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => onDeleteServer(server.id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
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
    </>
  );
}
