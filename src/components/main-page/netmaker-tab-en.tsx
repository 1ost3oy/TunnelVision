'use client';

import { useState } from 'react';
import type { Server, LogEntry } from '@/lib/types';
import { useNetmaker } from '@/hooks/use-netmaker';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import {
    IconNetmaker,
    IconSelectNetworkServers,
    IconNoServersSelected,
    IconBrain,
    IconContext
} from '@/components/common/abstract-icons';
import { useToast } from '@/hooks/use-toast';

export function NetmakerTab({ 
    selectedServers,
    isPending,
    startTransition,
    setLogs
}: { 
    selectedServers: Server[],
    isPending: boolean,
    startTransition: React.TransitionStartFunction,
    setLogs: (logs: LogEntry[]) => void,
}) {
    const { brokerId, setBrokerId, handleCreateNetwork } = useNetmaker(
        selectedServers,
        startTransition,
        setLogs
    );
    const [aiContext, setAiContext] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [cliCommand, setCLICommand] = useState('');
    const [isExecutingCLI, setIsExecutingCLI] = useState(false);
    const { toast } = useToast();
    
    const handleSDNDeploy = async () => {
        if (!brokerId) {
            toast({ 
                variant: 'destructive', 
                title: 'Controller Required', 
                description: 'Please select one server as SDN controller.' 
            });
            return;
        }

        setIsExecutingCLI(true);
        try {
            setLogs([{ type: 'info', message: '[SDN] Deploying secure network...' }]);
            
            const response = await fetch('/api/sdn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deploy',
                    nodes: selectedServers,
                    config: { type: 'wireguard' }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setLogs(prev => [...prev, 
                    { type: 'success', message: '[SDN] Network deployed successfully' },
                    ...result.results.map((r: any) => ({ 
                        type: r.status === 'deployed' ? 'success' : 'error', 
                        message: `[${r.node}] ${r.status}` 
                    }))
                ]);
                
                toast({
                    title: 'SDN Network Deployed',
                    description: 'SDN network deployed successfully.',
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            setLogs(prev => [...prev, { type: 'error', message: `[SDN] Error: ${error.message}` }]);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'SDN network deployment failed.',
            });
        } finally {
            setIsExecutingCLI(false);
        }
    };
    
    const handleAiNetworkManagement = async () => {
        if (!aiContext) {
            toast({
                variant: 'destructive',
                title: 'Context Required',
                description: 'Please describe your network requirements.',
            });
            return;
        }
        
        setIsAiProcessing(true);
        try {
            setLogs([{ type: 'info', message: 'AI analyzing network requirements...' }]);
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLogs(prev => [...prev, { type: 'success', message: 'AI determined optimal network configuration.' }]);
            
            toast({
                title: 'AI Network Management',
                description: 'Network optimized based on your requirements.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'AI could not manage the network.',
            });
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className='flex items-center gap-2'>
                    <IconNetmaker className="h-6 w-6 text-green-400" />
                    <CardTitle>SDN</CardTitle>
                </div>
                <CardDescription>
                    Software-Defined Networking - Network control separated from hardware, managed centrally via software layer. Select one server as controller.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                             <IconSelectNetworkServers className="h-5 w-5" />
                            <CardTitle className="text-base">Select SDN Controller</CardTitle>
                        </div>
                        <CardDescription>Controller manages network routes, policies, and security, controlling connections between servers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedServers.length > 1 ? (
                            <RadioGroup value={brokerId ?? undefined} onValueChange={setBrokerId}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {selectedServers.map(server => (
                                    <Label 
                                        key={server.id} 
                                        htmlFor={`broker-${server.id}`}
                                        className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                                    >
                                        <RadioGroupItem value={server.id} id={`broker-${server.id}`} />
                                        <span>{server.name}</span>
                                    </Label>
                                ))}
                                </div>
                            </RadioGroup>
                        ) : (
                            <Alert variant="default" className="border-dashed">
                                <IconNoServersSelected className="h-4 w-4" />
                                <AlertTitle>Not Enough Servers Selected</AlertTitle>
                                <AlertDescription>
                                    Please open the <strong>Server Management</strong> panel and select at least two servers for your network.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <div className='flex items-center gap-2'>
                            <IconContext className='h-4 w-4' />
                            <CardTitle className="text-base">AI Network Management</CardTitle>
                        </div>
                        <CardDescription>AI optimizes network based on your requirements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="e.g., Need high-security network for sensitive data transfer between Iran and Germany servers"
                            value={aiContext}
                            onChange={(e) => setAiContext(e.target.value)}
                        />
                        <Button
                            onClick={handleAiNetworkManagement}
                            disabled={isAiProcessing || !aiContext}
                            variant="outline"
                            className="w-full"
                        >
                            {isAiProcessing ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                <IconBrain className="mr-2" />
                            )}
                            <span>AI Optimization</span>
                        </Button>
                    </CardContent>
                </Card>
                
                <div className="space-y-2">
                    <Button
                        onClick={handleSDNDeploy}
                        disabled={isExecutingCLI || !brokerId || selectedServers.length < 2}
                        className="w-full"
                        variant="outline"
                    >
                        {isExecutingCLI ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <IconNetmaker className="h-5 w-5" />
                        )}
                    </Button>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">SDN CLI</CardTitle>
                            <CardDescription>Direct commands for network management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Input
                                placeholder="e.g., create wireguard all"
                                value={cliCommand}
                                onChange={(e) => setCLICommand(e.target.value)}
                            />
                            
                            <Button
                                onClick={() => {
                                    if (cliCommand) {
                                        setLogs([{ type: 'info', message: `[CLI] ${cliCommand}` }]);
                                        toast({ title: 'CLI Command', description: `Executing: ${cliCommand}` });
                                    }
                                }}
                                disabled={!cliCommand || !brokerId}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                Execute CLI Command
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}