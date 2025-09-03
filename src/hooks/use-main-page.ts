'use client';

import { useState, useTransition, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import type { Server, LogEntry, Tunnel } from '@/lib/types';
import {
  updateServers,
  deleteServer,
  pingServer,
  deleteTunnel,
  saveTunnelConfig,
  exportSettings,
  importSettings,
  cleanupServer,
  pingTunnel,
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type PlainServer = Omit<Server, '_id' | 'sshKeyConfigured'> & {
  id: string;
  sshKeyConfigured?: boolean;
};
type PlainTunnel = Omit<Tunnel, '_id'> & {
  id: string;
};

export function useMainPage(initialServers: PlainServer[], initialTunnels: PlainTunnel[]) {
  const [servers, setServers] = useState<Server[]>(initialServers.map(s => ({ ...s, _id: { toHexString: () => s.id } })));
  const [tunnels, setTunnels] = useState<Tunnel[]>(initialTunnels.map(t => ({ ...t, _id: { toHexString: () => t.id } })));
  const [selectedServers, setSelectedServers] = useState<Server[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serverFormOpen, setServerFormOpen] = useState(false);
  const [serverToEdit, setServerToEdit] = useState<Server | undefined>(undefined);
  const [filter, setFilter] = useState('');
  const [pingStates, setPingStates] = useState<Record<string, { isPinging: boolean; latency?: number }>>({});
  const [activeTab, setActiveTab] = useState('single');

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectionLimit = useMemo(() => {
    if (activeTab === 'combined') return 3;
    if (activeTab === 'single') return 2;
    return 100;
  }, [activeTab]);

  const isSelectionLimited = useMemo(() => {
    return activeTab === 'combined' || activeTab === 'single';
  }, [activeTab]);

  const handleSelectServer = (server: Server, isSelected: boolean) => {
    setSelectedServers((prev) => {
      const newSelection = isSelected
        ? [...prev, server]
        : prev.filter((s) => s.id !== server.id);

      if (isSelectionLimited && newSelection.length > selectionLimit) {
        toast({
          variant: 'destructive',
          title: 'Selection Limit Reached',
          description: `You can only select ${Number(selectionLimit)} server(s) for this operation.`,
        });
        return prev;
      }
      return newSelection;
    });
  };

  const handlePingServer = (server: Server) => {
    setPingStates((prev) => ({
      ...prev,
      [server.id]: { isPinging: true, latency: undefined },
    }));
    startTransition(async () => {
      const { latency } = await pingServer(server.ipAddress);
      setPingStates((prev) => ({
        ...prev,
        [server.id]: { isPinging: false, latency },
      }));
    });
  };

  const handlePingTunnel = useCallback((tunnel: Tunnel) => {
    setTunnels(prevTunnels => prevTunnels.map(t => 
      t.id === tunnel.id ? { ...t, latency: undefined, isPinging: true } : t
    ));
    startTransition(async () => {
      const { latency } = await pingTunnel(tunnel);
      setTunnels(prevTunnels => prevTunnels.map(t => 
        t.id === tunnel.id ? { ...t, latency, isPinging: false } : t
      ));
    });
  }, [startTransition]);

  const handleSaveTunnel = async (tunnel: Tunnel) => {
    startTransition(async () => {
      const result = await saveTunnelConfig(tunnel);
      if (result.success) {
        toast({
          title: 'Configuration Saved!',
          description: 'The tunnel will now persist after reboots.',
        });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: String(result.message || 'Save failed').replace(/[<>"'&]/g, ''),
        });
      }
    });
  };

  const handleExport = () => {
    startTransition(async () => {
      try {
        const settingsJson = await exportSettings();
        const blob = new Blob([settingsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tunnelvision_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
          title: 'Export Successful',
          description: 'Your settings have been downloaded.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: 'Could not export settings.',
        });
      }
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        startTransition(async () => {
          const result = await importSettings(content);
          if (result.success) {
            toast({
              title: 'Import Successful',
              description: 'Your settings have been restored.',
            });
            router.refresh();
          } else {
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: String(result.message || 'Import failed').replace(/[<>"'&]/g, ''),
            });
          }
        });
      }
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'Error reading file' });
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredServers = useMemo(() => {
    const sanitizedFilter = filter.replace(/[<>"'&]/g, '');
    return servers.filter(
      (server) =>
        server.name.toLowerCase().includes(sanitizedFilter.toLowerCase()) ||
        server.ipAddress.includes(sanitizedFilter) ||
        server.username.toLowerCase().includes(sanitizedFilter.toLowerCase())
    );
  }, [servers, filter]);

  const moveServer = (index: number, direction: 'up' | 'down') => {
    const newServers = [...servers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newServers.length) {
      [newServers[index], newServers[newIndex]] = [
        newServers[newIndex],
        newServers[index],
      ];
      setServers(newServers);
      startTransition(async () => {
        await updateServers(newServers);
      });
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      await deleteServer(id);
      setSelectedServers((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: 'Server Deleted',
        description: 'The server has been removed.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'An error occurred while deleting the server.',
      });
    }
  };

  const handleCleanupServer = async (id: string) => {
    if (!id) {
      toast({
        variant: 'destructive',
        title: 'Invalid Server',
        description: 'Server ID is missing.',
      });
      return;
    }
    
    try {
      setLogs([]);
      const result = await cleanupServer(id);
      setLogs(result.logs);
      
      if (result.success) {
        toast({
          title: 'Server Cleanup Successful',
          description: 'The server has been cleaned of all tunnel configurations.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Cleanup Failed',
          description: String(result.message || 'An error occurred during cleanup. Check logs.').replace(/[<>"'&]/g, ''),
        });
      }
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cleanup Error',
        description: 'An unexpected error occurred during cleanup.',
      });
      console.error('Cleanup error:', error);
    }
  };

  const handleDeleteTunnel = (id: string) => {
    startTransition(async () => {
      await deleteTunnel(id);
      toast({
        title: 'Tunnel Deleted',
        description: 'The tunnel has been removed from the list.',
      });
      router.refresh();
    });
  };

  const handleOpenAddServerSheet = () => {
    setServerToEdit(undefined);
    setServerFormOpen(true);
  };

  const handleOpenEditServerSheet = (server: Server) => {
    setServerToEdit(server);
    setServerFormOpen(true);
  };

  useEffect(() => {
    if (activeTab !== 'single' && activeTab !== 'combined' && activeTab !== 'netmaker' && activeTab !== 'servers') {
      setSelectedServers([]);
    }
  }, [activeTab]);

  useEffect(() => {
    setServers(initialServers.map(s => ({ ...s, _id: { toHexString: () => s.id } })));
    setTunnels(initialTunnels.map(t => ({ ...t, _id: { toHexString: () => t.id } })));
    const newSelected = selectedServers.filter((ss) =>
      initialServers.some((is) => is.id === ss.id)
    );
    if (newSelected.length !== selectedServers.length) {
      setSelectedServers(newSelected);
    }
  }, [initialServers, initialTunnels]);

  useEffect(() => {
    const interval = setInterval(() => {
      tunnels.forEach(tunnel => {
        if (!tunnel.isPinging) {
          handlePingTunnel(tunnel);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [tunnels, handlePingTunnel]);

  return {
    servers,
    tunnels,
    selectedServers,
    logs,
    serverFormOpen,
    serverToEdit,
    filter,
    pingStates,
    activeTab,
    isPending,
    fileInputRef,
    selectionLimit,
    isSelectionLimited,
    filteredServers,
    setFilter,
    setActiveTab,
    setServerFormOpen,
    setLogs,
    setSelectedServers,
    handleSelectServer,
    handlePingServer,
    handlePingTunnel,
    handleSaveTunnel,
    handleExport,
    handleImportClick,
    handleImport,
    moveServer,
    handleDeleteServer,
    handleCleanupServer,
    handleDeleteTunnel,
    handleOpenAddServerSheet,
    handleOpenEditServerSheet,
    router,
  };
}