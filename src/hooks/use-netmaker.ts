'use client';

import { useState } from 'react';
import type { Server, LogEntry } from '@/lib/types';
import { createMeshNetwork } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function useNetmaker(
  selectedServers: Server[],
  startTransition: React.TransitionStartFunction,
  setLogs: (logs: LogEntry[]) => void
) {
  const [brokerId, setBrokerId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateNetwork = () => {
    if (!brokerId) {
      toast({ 
        variant: 'destructive', 
        title: 'Broker Not Selected', 
        description: 'Please select one server to act as the broker.' 
      });
      return;
    }

    const broker = selectedServers.find(s => s.id === brokerId);
    const clients = selectedServers.filter(s => s.id !== brokerId);

    if (!broker || clients.length === 0) {
      toast({ 
        variant: 'destructive', 
        title: 'Invalid Selection', 
        description: 'You need at least one broker and one client server.' 
      });
      return;
    }

    startTransition(async () => {
      try {
        setLogs([]);
        const result = await createMeshNetwork(broker, clients);
        if (result?.logs) {
          setLogs(result.logs);
        }
        if (result?.success) {
          toast({
            title: 'Mesh Network Created',
            description: 'The virtual network was configured successfully.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create the mesh network. Check logs for details.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: 'An unexpected error occurred while creating the mesh network.',
        });
      }
    });
  };

  return {
    brokerId,
    setBrokerId,
    handleCreateNetwork,
  };
}