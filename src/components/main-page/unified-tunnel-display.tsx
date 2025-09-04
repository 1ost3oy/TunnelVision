'use client';

import { TunnelList } from './tunnel-list';
import type { Server, Tunnel } from '@/lib/types';

type UnifiedTunnelDisplayProps = {
  tunnels: Tunnel[];
  servers: Server[];
  onDelete: (id: string) => void;
  onPing: (tunnel: Tunnel) => void;
  onSave: (tunnel: Tunnel) => void;
};

export function UnifiedTunnelDisplay({ tunnels, servers, onDelete, onPing, onSave }: UnifiedTunnelDisplayProps) {
  return (
    <TunnelList
      tunnels={tunnels}
      servers={servers}
      onDelete={onDelete}
      onPing={onPing}
      onSave={onSave}
    />
  );
}