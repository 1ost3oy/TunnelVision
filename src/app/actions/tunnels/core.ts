'use server';

import { revalidatePath } from 'next/cache';
import { NodeSSH } from 'node-ssh';
import { ObjectId } from 'mongodb';

import type { Server, Tunnel } from '@/lib/types';
import { getServersCollection, getTunnelsCollection } from '../db';
import { connectWithKeyManagement } from '../ssh';

// Tunnel Actions
export async function getTunnels(): Promise<Tunnel[]> {
    const tunnelsCollection = await getTunnelsCollection();
    const tunnels = await tunnelsCollection.find({}).sort({ createdAt: -1 }).toArray();
    return tunnels as Tunnel[];
}

export async function deleteTunnel(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const tunnelsCollection = await getTunnelsCollection();
    await tunnelsCollection.deleteOne({ _id: new ObjectId(id) });
    revalidatePath('/');
}

export async function pingTunnel(tunnel: Tunnel): Promise<{ latency: number | null }> {
  const serversCollection = await getServersCollection();
  if (!ObjectId.isValid(tunnel.server1Id)) return { latency: null };
  const server1 = await serversCollection.findOne({ _id: new ObjectId(tunnel.server1Id) });

  if (!server1) {
    console.error(`Server with ID ${tunnel.server1Id} not found for tunnel ping.`);
    return { latency: null };
  }
  
  let ssh: NodeSSH | null = null;
  try {
    ssh = await connectWithKeyManagement(server1);
    
    const result = await ssh.execCommand(`ping -c 1 -W 3 ${tunnel.tunnelIp2}`);
    
    if (result.code !== 0) {
        console.error(`Tunnel ping failed from ${server1.ipAddress} to ${tunnel.tunnelIp2}:`, result.stderr);
        return { latency: null };
    }

    const match = result.stdout.match(/time=([\d.]+) ms/);
    if (match && match[1]) {
        return { latency: parseFloat(match[1]) };
    }

    return { latency: null };

  } catch (error) {
    console.error(`Tunnel ping failed for tunnel ${tunnel.id}:`, error);
    return { latency: null };
  } finally {
      if(ssh?.isConnected()) {
          ssh.dispose();
      }
  }
}
