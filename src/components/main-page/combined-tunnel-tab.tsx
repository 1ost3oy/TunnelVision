'use client';

import { useState, useTransition, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';

import type { Server, TunnelType, LogEntry } from '@/lib/types';
import { tunnelTypes } from '@/lib/types';
import { createCombinedTunnel } from '@/app/actions';
import { suggestTunnel } from '@/ai/flows/suggest-tunnel-flow';
import { suggestServerOrder } from '@/ai/flows/suggest-server-order-flow';
import { useToast } from '@/hooks/use-toast';
import { 
    IconCombinedTunnel,
    IconBrain,
    IconContext
} from '@/components/common/abstract-icons';
import { AnimatedArrows } from '@/components/common/icons';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { Loader2, ArrowRightLeft, Network } from 'lucide-react';

type CombinedTunnelTabProps = {
    selectedServers: Server[];
    setLogs: Dispatch<SetStateAction<LogEntry[]>>;
    isPending: boolean;
    startTransition: React.TransitionStartFunction;
    onMoveServer: (index: number, direction: 'up' | 'down') => void;
}

export function CombinedTunnelTab({ selectedServers, setLogs, isPending, startTransition, onMoveServer }: CombinedTunnelTabProps) {
    const [combinedTunnelType1, setCombinedTunnelType1] = useState<TunnelType>(tunnelTypes[0]);
    const [combinedTunnelType2, setCombinedTunnelType2] = useState<TunnelType>(tunnelTypes[0]);
    const [domain, setDomain] = useState('');
    const [aiContext, setAiContext] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isSuggestingOrder, setIsSuggestingOrder] = useState(false);
    const { toast } = useToast();
    const router = useRouter();


    const handleSuggestServerOrder = async () => {
        if (!aiContext) {
            toast({
                variant: 'destructive',
                title: 'Context Required',
                description: 'Please describe your needs for the AI to suggest server order.',
            });
            return;
        }
        if (selectedServers.length !== 3) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select exactly three servers first.',
            });
            return;
        }
        
        setIsSuggestingOrder(true);
        try {
            const result = await suggestServerOrder({ 
                servers: selectedServers.map(s => ({id: s.id, name: s.name, ipAddress: s.ipAddress})),
                context: aiContext 
            });
            
            // Reorder servers based on AI suggestion
            const newOrder = result.orderedServerIds.map(id => selectedServers.find(s => s.id === id)!).filter(Boolean);
            if (newOrder.length === 3) {
                // Apply the new order
                newOrder.forEach((server, index) => {
                    const currentIndex = selectedServers.findIndex(s => s.id === server.id);
                    if (currentIndex !== index) {
                        onMoveServer(currentIndex, index < currentIndex ? 'up' : 'down');
                    }
                });
                
                toast({
                    title: 'Server Order Suggested!',
                    description: result.reason,
                });
            }
        } catch (error) {
            console.error("Server order suggestion failed:", error);
            toast({
                variant: 'destructive',
                title: 'Suggestion Failed',
                description: 'Could not suggest server order. Please try again.',
            });
        } finally {
            setIsSuggestingOrder(false);
        }
    };

    const handleSuggestTunnelTypes = async () => {
        if (!aiContext) {
            toast({
                variant: 'destructive',
                title: 'Context Required',
                description: 'Please describe your needs for the AI to make a suggestion.',
            });
            return;
        }
        setIsSuggesting(true);
        try {
            const result = await suggestTunnel({ context: aiContext });
            const suggestedType = result.tunnelType as TunnelType;

            if (tunnelTypes.includes(suggestedType)) {
                 setCombinedTunnelType1(suggestedType);
                 setCombinedTunnelType2(suggestedType);
                 toast({
                    title: 'AI Suggestion Applied!',
                    description: (
                        <div>
                            <p className="font-bold">{suggestedType}</p>
                            <p className="text-sm text-muted-foreground">{result.reason}</p>
                        </div>
                    ),
                 })
            } else {
                 throw new Error(`AI returned an invalid tunnel type: ${suggestedType}`);
            }

        } catch (error) {
            console.error("AI suggestion failed:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                context: aiContext,
                timestamp: new Date().toISOString()
            });
            toast({
                variant: 'destructive',
                title: 'Suggestion Failed',
                description: 'The AI could not provide a suggestion. Please try again.',
            })
        } finally {
            setIsSuggesting(false);
        }
    }

    const [isCreating, setIsCreating] = useState(false);

    const handleCreateCombinedTunnel = () => {
        if (selectedServers.length !== 3) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please select exactly three servers.',
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
                
                liveLog({ type: 'info', message: 'Starting combined tunnel creation...' });
                
                const result = await createCombinedTunnel(
                    selectedServers[0],
                    selectedServers[1],
                    selectedServers[2],
                    combinedTunnelType1,
                    combinedTunnelType2,
                    domain
                );
                
                // Update logs after completion
                setLogs(result.logs);
                
                if (result.success) {
                    liveLog({ type: 'success', message: 'Combined tunnel creation completed successfully!' });
                    toast({
                        title: 'Combined Tunnel Created',
                        description: 'The tunnel chain was configured successfully.',
                    });
                    router.refresh();
                } else {
                    liveLog({ type: 'error', message: 'Combined tunnel creation failed!' });
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Failed to create combined tunnel. Check logs for details.',
                    });
                }
            } catch (error) {
                console.error('Combined tunnel creation error:', error);
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


    return (
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 50 50"><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path stroke="#dd0df4" d="M9.375 40.625a7.375 7.375 0 0 1 0-10.417L14.583 25A7.375 7.375 0 0 1 25 25a7.375 7.375 0 0 1 0 10.417l-5.208 5.208a7.375 7.375 0 0 1-10.417 0m27.083-16.667l5.209-5.208a7.375 7.375 0 0 0 0-10.417v0a7.375 7.375 0 0 0-10.417 0l-5.208 5.209a7.375 7.375 0 0 0 0 10.416v0a7.375 7.375 0 0 0 10.416 0"/><path stroke="#09e6d4" d="m20.833 29.167l8.334-8.334"/></g></svg>
                Combined Tunnels
            </CardTitle>
            <CardDescription>
                Chain multiple tunnels together for enhanced security and
                routing. Select 3 servers: Source, Intermediate, and
                Destination.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {selectedServers.length === 3 ? (
                <div className="space-y-2">
                    {selectedServers.map((server, index) => (
                        <div key={server.id} className="flex items-center gap-2">
                            <Card className="flex-1">
                                <CardHeader className="p-3">
                                    <CardDescription>
                                        {index === 0 ? 'Source' : index === 1 ? 'Intermediate' : 'Destination'}
                                    </CardDescription>
                                    <CardTitle className="text-base">
                                        {server.name}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                            <div className="flex items-center">
                                <AnimatedArrows className="w-12 h-12 cursor-pointer" onClick={() => {
                                    const serverIndex = selectedServers.findIndex(s => s.id === server.id);
                                    if (index > 0) onMoveServer(serverIndex, 'up');
                                    if (index < selectedServers.length - 1) onMoveServer(serverIndex, 'down');
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Alert>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50"><g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path stroke="#02ee9d" d="M6.25 12.5v25L25 25z"/><path stroke="#00fffc" d="M43.75 25L25 37.5v-25z"/></g></svg>
                    <AlertTitle>Waiting for Server Selection</AlertTitle>
                </div>
                <AlertDescription>
                    Please open the <strong>Server Management</strong>{' '}
                    panel and select three servers to begin.
                </AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <div className='flex items-center gap-2'>
                    <IconContext className='h-4 w-4' />
                    <Label htmlFor="ai-context">Context / Needs</Label>
                </div>
                <Textarea
                id="ai-context"
                placeholder="e.g., I need a secure and fast connection from my server in Iran to a server in Germany for gaming."
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                />
                <div className="flex gap-2">
                    <Button
                    onClick={handleSuggestTunnelTypes}
                    disabled={isSuggesting || isPending}
                    variant="outline"
                    size="sm"
                    >
                    {isSuggesting ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <IconBrain className="mr-2" />
                    )}
                    <span>Suggest Types</span>
                    </Button>
                    <Button
                    onClick={handleSuggestServerOrder}
                    disabled={isSuggestingOrder || isPending || selectedServers.length !== 3}
                    variant="outline"
                    size="sm"
                    >
                    {isSuggestingOrder ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <IconBrain className="mr-2" />
                    )}
                    <span>Suggest Order</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="combined-tunnel-type-1">
                    Source → Intermediate
                </Label>
                <Select
                    value={combinedTunnelType1}
                    onValueChange={(value: TunnelType) =>
                    setCombinedTunnelType1(value)
                    }
                >
                    <SelectTrigger
                    id="combined-tunnel-type-1"
                    className="w-full"
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
                <div className="space-y-2">
                <Label htmlFor="combined-tunnel-type-2">
                    Intermediate → Destination
                </Label>
                <Select
                    value={combinedTunnelType2}
                    onValueChange={(value: TunnelType) =>
                    setCombinedTunnelType2(value)
                    }
                >
                    <SelectTrigger
                    id="combined-tunnel-type-2"
                    className="w-full"
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
            </div>
            {(combinedTunnelType1 === 'V2Ray (WS+TLS)' || combinedTunnelType2 === 'V2Ray (WS+TLS)') && (
                <div className="space-y-2">
                    <Label htmlFor="domain">Domain Name (for V2Ray)</Label>
                    <Input
                        id="domain"
                        placeholder="e.g., example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    />
                </div>
            )}
            <Button
                onClick={handleCreateCombinedTunnel}
                disabled={isCreating || selectedServers.length !== 3}
                className="w-full"
            >
                {isCreating ? (
                <Loader2 className="animate-spin" />
                ) : (
                <IconCombinedTunnel />
                )}
                <span>{isCreating ? 'Creating...' : 'Create Combined Tunnel'}</span>
            </Button>
            </CardContent>
        </Card>
    );
}
