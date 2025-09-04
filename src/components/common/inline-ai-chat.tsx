'use client';

import { useState } from 'react';
import { Button } from '@/components/starwind/button';
import { Input } from '@/components/starwind/input';
import { Bot, Send, X } from 'lucide-react';
import type { Server, Tunnel, LogEntry } from '@/lib/types';

type InlineAIChatProps = {
  servers?: Server[];
  tunnels?: Tunnel[];
  logs?: LogEntry[];
  context?: string;
};

export function InlineAIChat({ servers = [], tunnels = [], logs = [], context }: InlineAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${context ? `Context: ${context}\n` : ''}${input}`,
          systemContext: {
            servers: servers.map(s => ({ id: s.id, name: s.name, ipAddress: s.ipAddress, username: s.username })),
            tunnels: tunnels.map(t => ({ id: t.id, name: t.name || `${t.server1Name} ↔ ${t.server2Name}`, type: t.type, status: t.status || 'unknown' })),
            logs: logs.slice(-5).map(l => ({ type: l.type, message: l.message }))
          }
        })
      });
      const result = await res.json();
      setResponse(result.response);
    } catch (error) {
      setResponse('خطا در ارتباط با AI');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 px-2 text-xs"
      >
        <Bot className="w-3 h-3 mr-1" />
        AI
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-3 bg-background/95 backdrop-blur-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      {response && (
        <div className="text-sm p-2 bg-muted rounded text-right">
          {response}
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="سوال بپرسید..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
          className="text-sm h-8"
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="sm">
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}