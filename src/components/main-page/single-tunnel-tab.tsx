
'use client';

import { useState, useTransition, useMemo, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';

import type { Server, TunnelType, LogEntry } from '@/lib/types';
import { tunnelTypes } from '@/lib/types';
import { createTunnel } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Steps } from './ui-helpers';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  IconCreateButton,
  IconSwap,
  IconSelectServer,
  IconConfigureTunnel,
  IconCreateTunnel,
  IconDone,
  IconTunnelConfiguration,
  IconWaitingForSelection,
  IconSource,
  IconDestination,
  IconRequired,
} from '@/components/common/abstract-icons';

import { Loader2 } from 'lucide-react';

const stepIcons = {
  1: IconSelectServer,
  2: IconConfigureTunnel,
  3: IconCreateTunnel,
  4: IconDone,
};


type SingleTunnelTabProps = {
    selectedServers: Server[];
    setSelectedServers: Dispatch<SetStateAction<Server[]>>;
    setLogs: Dispatch<SetStateAction<LogEntry[]>>;
    logs: LogEntry[];
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
}


export function SingleTunnelTab({ selectedServers, setSelectedServers, logs, setLogs, isPending, startTransition }: SingleTunnelTabProps) {
  const [tunnelType, setTunnelType] = useState<TunnelType>(tunnelTypes[0]);
  const [v2rayDomain, setV2rayDomain] = useState('');
  const { toast } = useToast();
  const router = useRouter();


  const handleSwapServers = () => {
    setSelectedServers((prev) => {
      if (prev.length === 2) {
        return [prev[1], prev[0]];
      }
      return prev;
    });
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTunnel = () => {
    if (selectedServers.length !== 2) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select exactly two servers.',
      });
      return;
    }
    if (tunnelType === 'V2Ray (WS+TLS)' && !v2rayDomain) {
      toast({
        variant: 'destructive',
        title: 'Domain Required',
        description: 'Please enter a domain name for the V2Ray tunnel.',
      });
      return;
    }
    
    setIsCreating(true);
    
    // Clear logs and start live logging
    setLogs([]);
    
    // Use setTimeout to avoid blocking UI
    setTimeout(async () => {
      try {
        // Create a live log function that updates state immediately
        const liveLog = (entry: LogEntry) => {
          setLogs(prev => [...prev, entry]);
        };
        
        liveLog({ type: 'info', message: 'Starting tunnel creation...' });
        
        const result = await createTunnel(
          selectedServers[0],
          selectedServers[1],
          tunnelType,
          v2rayDomain
        );
        
        // Update logs after completion
        setLogs(result.logs);
        
        if (result.success) {
          liveLog({ type: 'success', message: 'Tunnel creation completed successfully!' });
          toast({
            title: 'Tunnel Created',
            description: 'The tunnel was configured successfully.',
          });
          router.refresh();
        } else {
          liveLog({ type: 'error', message: 'Tunnel creation failed!' });
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create tunnel. Check logs for details.',
          });
        }
      } catch (error) {
        console.error('Tunnel creation error:', error);
        setLogs(prev => [...prev, { type: 'error', message: `Error: ${error}` }]);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred.',
        });
      } finally {
        setIsCreating(false);
      }
    }, 100);
  };
  
  const currentStep = useMemo(() => {
    if (logs.length > 0) {
      if (isPending) return 3;
      const lastLog = logs[logs.length - 1];
      if (
        lastLog.type === 'success' &&
        (lastLog.message.includes('completed successfully') || lastLog.message.includes('cleaned up successfully'))
      )
        return 4;
      return 3;
    }
    if (selectedServers.length < 2) return 1;
    return 2;
  }, [selectedServers.length, logs, isPending]);



  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconConfigureTunnel className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <CardTitle className="text-xl">Process</CardTitle>
          </div>
          <CardDescription>
            Follow the steps to create a new tunnel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Steps currentStep={currentStep} icons={stepIcons} />
        </CardContent>
      </Card>
      <Card
        className={cn(
          selectedServers.length !== 2 &&
            'opacity-50 pointer-events-none'
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconTunnelConfiguration className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            </div>
            <CardTitle className="text-xl">
              Tunnel Configuration
            </CardTitle>
          </div>
          <CardDescription>
            Select two servers from the Server Management panel to
            create a tunnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServers.length === 2 ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <Card>
                <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                          <IconSource className="h-5 w-5" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></div>
                        </div>
                        <CardDescription>Source</CardDescription>
                    </div>
                  <CardTitle className="text-base">
                    {selectedServers[0].name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedServers[0].ipAddress}
                  </p>
                </CardHeader>
              </Card>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapServers}
              >
                <IconSwap className="h-4 w-4" />
              </Button>
              <Card>
                <CardHeader className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                        <div className="relative">
                          <IconDestination className="h-5 w-5" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                        </div>
                        <CardDescription>
                            Destination
                        </CardDescription>
                    </div>
                  <CardTitle className="text-base">
                    {selectedServers[1].name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedServers[1].ipAddress}
                  </p>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <Alert>
              <IconWaitingForSelection className="h-4 w-4" />
              <AlertTitle>Waiting for Server Selection</AlertTitle>
              <AlertDescription>
                Please open the <strong>Server Management</strong>{' '}
                panel and select two servers to begin.
              </AlertDescription>
            </Alert>
          )}

          {tunnelType === 'V2Ray (WS+TLS)' && (
            <div className="space-y-2 animate-in fade-in">
              <div className='flex items-center gap-2'>
                <IconRequired className='h-4 w-4' />
                <Label htmlFor="v2ray-domain">
                  Domain (pointed to Server 2)
                </Label>
              </div>
              <Input
                id="v2ray-domain"
                placeholder="mydomain.com"
                value={v2rayDomain}
                onChange={(e) => setV2rayDomain(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 50 50"><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path stroke="#09e6d4" d="M25 20.833v12.5M29.167 12.5h-8.334a2.083 2.083 0 0 1-2.083-2.083V8.333a2.083 2.083 0 0 1 2.083-2.083h8.334a2.083 2.083 0 0 1 2.083 2.083v2.084a2.083 2.083 0 0 1-2.083 2.083M18.75 20.833h12.5z"/><path stroke="#dd0df4" d="M37.5 8.333a2.083 2.083 0 0 1 2.083 2.084v31.25A2.083 2.083 0 0 1 37.5 43.75h-25a2.083 2.083 0 0 1-2.083-2.083v-31.25A2.083 2.083 0 0 1 12.5 8.333"/></g></svg>
                <Label htmlFor="tunnel-type">Tunnel Type</Label>
              </div>
              <Select
                value={tunnelType}
                onValueChange={(value: TunnelType) => setTunnelType(value)}
              >
                <SelectTrigger
                  id="tunnel-type"
                  className="w-full mt-1"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {tunnelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateTunnel}
              disabled={isCreating || selectedServers.length !== 2}
              size="lg"
            >
              {isCreating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <IconCreateButton />
              )}
              <span>{isCreating ? 'Creating...' : 'Create Tunnel'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
