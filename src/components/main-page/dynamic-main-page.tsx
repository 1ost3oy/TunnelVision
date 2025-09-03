
'use client';

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Server, Tunnel } from "@/lib/types";
import { ObjectId } from "mongodb";

// Helper type for serialized data, ensuring it's a plain object.
type Plain<T> = T extends ObjectId ? string : T extends Date ? string : T extends object ? {[K in keyof T]: Plain<T[K]>} : T;
type PlainServer = Plain<Omit<Server, '_id'>> & { id: string };
type PlainTunnel = Plain<Omit<Tunnel, '_id'>> & { id: string };


const DynamicMainPage = dynamic(
  () => import('@/components/main-page/main-page').then((mod) => mod.MainPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[500px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[500px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    ),
  }
);

// Sanitize string values to prevent XSS
function sanitizeString(str: string): string {
    return str.replace(/[<>"'&]/g, (match) => {
        const entities: { [key: string]: string } = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
        };
        return entities[match] || match;
    });
}

// Sanitize server data
function sanitizeServer(server: PlainServer): PlainServer {
    return {
        ...server,
        name: sanitizeString(server.name),
        ipAddress: sanitizeString(server.ipAddress),
        username: sanitizeString(server.username)
    };
}

// Sanitize tunnel data
function sanitizeTunnel(tunnel: PlainTunnel): PlainTunnel {
    return {
        ...tunnel,
        tunnelIp1: sanitizeString(tunnel.tunnelIp1 || ''),
        tunnelIp2: sanitizeString(tunnel.tunnelIp2 || '')
    };
}

export function DynamicMainPageLoader({ 
    initialServers, 
    initialTunnels 
}: { 
    initialServers: PlainServer[], 
    initialTunnels: PlainTunnel[] 
}) {
    const sanitizedServers = initialServers.map(sanitizeServer);
    const sanitizedTunnels = initialTunnels.map(sanitizeTunnel);
    
    return <DynamicMainPage initialServers={sanitizedServers} initialTunnels={sanitizedTunnels} />;
}
