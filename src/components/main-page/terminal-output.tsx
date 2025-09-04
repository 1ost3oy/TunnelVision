
'use client';

import {
  IconLogs,
  IconClipboard,
  IconInProgress,
  IconWarning,
  IconError,
  IconCheck
} from '@/components/common/abstract-icons';

import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Progress } from '@/components/starwind/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { LogEntry } from '@/lib/types';

const logTypeConfig = {
  success: { Icon: IconCheck, color: 'text-green-400' },
  error: { Icon: IconError, color: 'text-red-400' },
  warning: { Icon: IconWarning, color: 'text-yellow-400' },
  command: { Icon: null, color: 'text-accent' },
  info: { Icon: IconInProgress, color: 'text-muted-foreground' }
};

export function TerminalOutput({
  logs,
  isPending,
}: {
  logs: LogEntry[];
  isPending: boolean;
}) {
  const getProgressValue = () => {
    if (!isPending) return logs.length > 0 ? 100 : 0;
    return Math.min((logs.length * 20), 80);
  };
  const { toast } = useToast();
  const copyToClipboard = () => {
    const logText = logs
      .map((log) => `[${log.type.toUpperCase()}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(logText);
    toast({ title: 'Copied to clipboard!' });
  };

  const renderIcon = (log: LogEntry, color: string) => {
    if (log.type === 'command') {
      return <span className={`mt-1 h-4 w-4 flex-shrink-0 font-bold ${color}`}>$</span>;
    }
    const config = logTypeConfig[log.type as keyof typeof logTypeConfig] || logTypeConfig.info;
    const { Icon } = config;
    return Icon ? <Icon className={`mt-1 h-4 w-4 flex-shrink-0 ${color}`} /> : null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-2">
              {/* Animated Log Stream */}
              <div className="flex items-center space-x-1">
                <div className="w-1 h-4 bg-green-500 animate-pulse" style={{animationDelay: '0s'}}></div>
                <div className="w-1 h-6 bg-blue-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-3 bg-yellow-500 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="w-1 h-5 bg-purple-500 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <div className="w-1 h-2 bg-red-500 animate-pulse" style={{animationDelay: '0.8s'}}></div>
              </div>
              {/* Flowing Data Effect */}
              <div className="relative overflow-hidden w-8 h-6">
                <div className="absolute w-2 h-0.5 bg-primary rounded-full animate-flow-data"></div>
                <div className="absolute w-2 h-0.5 bg-secondary rounded-full animate-flow-data-delay"></div>
                <div className="absolute w-2 h-0.5 bg-accent rounded-full animate-flow-data-delay2"></div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            disabled={logs.length === 0}
          >
            <IconClipboard className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Real-time output from the server operations.
        </CardDescription>
        {(isPending || logs.length > 0) && (
          <div className="mt-2">
            <Progress value={getProgressValue()} className="w-full" />
            <div className="text-xs text-muted-foreground mt-1">
              {isPending ? 'Processing...' : 'Complete'} ({logs.length} operations)
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Bar Animation as Background Layer */}
          <div className="absolute inset-0 opacity-30 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-move-right"></div>
            </div>
          </div>
        <ScrollArea className="h-[calc(100vh-300px)] min-h-[300px] w-full rounded-md border bg-black/50 p-4 font-mono text-sm relative z-10">
          {isPending && logs.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <IconInProgress className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {logs.map((log, index) => {
            const config = logTypeConfig[log.type as keyof typeof logTypeConfig] || logTypeConfig.info;
            const { color } = config;

            return (
              <div
                key={index}
                className={`flex items-start gap-3 mb-2 animate-in fade-in`}
              >
                {renderIcon(log, color)}
                <p className={`flex-grow break-all ${color}`}>{log.message}</p>
              </div>
            );
          })}
          {logs.length === 0 && !isPending && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Logs will appear here once an operation begins.</p>
            </div>
          )}
        </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

    
