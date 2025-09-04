'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TerminalOutput } from './terminal-output';
import { Terminal, ChevronUp } from 'lucide-react';
import type { LogEntry } from '@/lib/types';

type FloatingLogsProps = {
  logs: LogEntry[];
  isPending: boolean;
};

export function FloatingLogs({ logs, isPending }: FloatingLogsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="shadow-lg bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Live Logs
            {logs.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {logs.length}
              </span>
            )}
            <ChevronUp className="w-4 h-4 ml-2" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] min-h-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Live Terminal Output
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100%-60px)] overflow-hidden">
            <TerminalOutput logs={logs} isPending={isPending} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}