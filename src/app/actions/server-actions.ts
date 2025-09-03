'use server';

import { revalidatePath } from 'next/cache';
import { NodeSSH } from 'node-ssh';
import { ObjectId } from 'mongodb';

import type { Server, LogEntry } from '@/lib/types';
import { serverSchema } from "@/lib/schemas";
import { getServersCollection, getTunnelsCollection } from './db';
import { connectWithKeyManagement } from './ssh';


// Server Actions
export async function getServers(): Promise<Server[]> {
  const serversCollection = await getServersCollection();
  const servers = await serversCollection.find({}).sort({ order: 1, name: 1 }).toArray();
  return servers as Server[];
}

export async function addServer(formData: FormData) {
  const newServerData = {
    name: formData.get('name'),
    ipAddress: formData.get('ipAddress'),
    username: formData.get('username'),
    sshPort: formData.get('sshPort'),
    password: formData.get('password'),
    sshKey: formData.get('sshKey'),
  };

  const validatedFields = serverSchema.safeParse(newServerData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const serversCollection = await getServersCollection();

  const newServer = {
    name: validatedFields.data.name,
    ipAddress: validatedFields.data.ipAddress,
    username: validatedFields.data.username,
    sshPort: validatedFields.data.sshPort,
    password: validatedFields.data.password || '',
    sshKey: validatedFields.data.sshKey || '',
    sshKeyConfigured: false,
  };

  await serversCollection.insertOne({
    ...newServer,
    _id: new ObjectId(),
    id: new ObjectId().toString()
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateServer(formData: FormData, serverId: string) {
    if (!ObjectId.isValid(serverId)) {
        return { errors: { _form: ['Invalid Server ID.'] } };
    }
    const updatedServerData = {
        name: formData.get('name'),
        ipAddress: formData.get('ipAddress'),
        username: formData.get('username'),
        sshPort: formData.get('sshPort'),
        password: formData.get('password'),
        sshKey: formData.get('sshKey'),
    };

    const validatedFields = serverSchema.safeParse(updatedServerData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const serversCollection = await getServersCollection();
    
    const result = await serversCollection.updateOne(
        { _id: new ObjectId(serverId) },
        { $set: {
            ...validatedFields.data,
            password: validatedFields.data.password || '',
            sshKey: validatedFields.data.sshKey || '',
        } }
    );
    
    if(result.matchedCount === 0) {
       return { errors: { _form: ['Server not found.'] } }
    }

    revalidatePath('/');
    return { success: true };
}

export async function updateServers(updatedServers: Server[]): Promise<void> {
    const serversCollection = await getServersCollection();
    const bulkOps = updatedServers.map((server, index) => ({
        updateOne: {
            filter: { _id: new ObjectId(server.id) },
            update: { $set: { order: index } }
        }
    }));
    if (bulkOps.length > 0) {
        await serversCollection.bulkWrite(bulkOps);
    }
    revalidatePath('/');
}

export async function deleteServer(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    
    const serversCollection = await getServersCollection();
    const tunnelsCollection = await getTunnelsCollection();
    
    await serversCollection.deleteOne({ _id: new ObjectId(id) });
    
    await tunnelsCollection.deleteMany({
      $or: [{ server1Id: id }, { server2Id: id }]
    });

    revalidatePath('/');
}

export async function pingServer(ipAddress: string): Promise<{ latency: number | null }> {
  try {
    const checkHostUrl = `https://check-host.net/check-ping?host=${ipAddress}&node=ir1.node.check-host.net`;
    const checkResponse = await fetch(checkHostUrl, { headers: { 'Accept': 'application/json' } });
    if (!checkResponse.ok) {
      throw new Error(`check-host.net initial request failed with status ${checkResponse.status}`);
    }
    const checkData = await checkResponse.json();
    if (checkData.ok !== 1) {
      throw new Error(`check-host.net returned an error: ${checkData.error}`);
    }
    
    const requestId = checkData.request_id;
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const resultUrl = `https://check-host.net/check-result/${requestId}`;
    const resultResponse = await fetch(resultUrl, { headers: { 'Accept': 'application/json' } });
     if (!resultResponse.ok) {
      throw new Error(`check-host.net result request failed with status ${resultResponse.status}`);
    }
    const resultData = await resultResponse.json();
    
    const pingResults = resultData['ir1.node.check-host.net'];
    if (!pingResults) {
      return { latency: null };
    }
    
    const successfulPings = pingResults[0].filter((res: any) => res[0] === 'OK').map((res: any) => res[1]);
    
    if (successfulPings.length === 0) {
      return { latency: null };
    }
    
    const avgLatency = successfulPings.reduce((a: number, b: number) => a + b, 0) / successfulPings.length;
    return { latency: Math.round(avgLatency * 1000) };
    
  } catch (error) {
    console.error(`Ping failed for ${ipAddress}:`, error);
    return { latency: null };
  }
}

export async function cleanupServer(serverId: string): Promise<{ success: boolean; message?: string, logs: LogEntry[] }> {
    if (!ObjectId.isValid(serverId)) {
        return { success: false, message: 'Invalid Server ID.', logs: [{type: 'error', message: 'Invalid Server ID.'}] };
    }
    const serversCollection = await getServersCollection();
    const server = await serversCollection.findOne({ _id: new ObjectId(serverId) });
    const logs: LogEntry[] = [];
    const log = (entry: LogEntry) => {
        console.log(`[${entry.type}] ${entry.message}`);
        logs.push(entry);
    };

    if (!server) {
        return { success: false, message: 'Server not found.', logs: [{type: 'error', message: 'Server not found in database.'}] };
    }

    let ssh: NodeSSH | null = null;

    try {
        log({ type: 'info', message: `Connecting to server ${server.name} (${server.ipAddress}) to begin cleanup...` });
        ssh = await connectWithKeyManagement(server, log);
        
        // اجرای همه دستورات در یک اسکریپت واحد برای سرعت بیشتر
        const cleanupScript = `
#!/bin/bash
set -e

# Stop and disable services
systemctl stop 'wg-quick@*' 'openvpn@*' ipsec v2ray 2>/dev/null || true
systemctl disable 'wg-quick@*' 'openvpn@*' ipsec v2ray 2>/dev/null || true

# Remove configurations
rm -rf /etc/wireguard/* /etc/openvpn/* /usr/local/etc/v2ray/* 2>/dev/null || true
rm -f /etc/ipsec.conf /etc/ipsec.secrets /etc/network/interfaces.d/tun* 2>/dev/null || true

# Delete tunnel interfaces
for iface in $(ip -o link show | awk -F': ' '{print $2}' | grep -E '^tun|^gre|^ipip|^sit|^vti' 2>/dev/null || true); do
    ip link delete "$iface" 2>/dev/null || true
done

# Reload systemd
systemctl daemon-reload 2>/dev/null || true

echo "Cleanup completed successfully"
`;

        log({ type: 'info', message: 'Executing optimized cleanup script...' });
        const result = await ssh.execCommand(cleanupScript);
        
        if (result.code === 0) {
            log({ type: 'success', message: 'All cleanup operations completed successfully.' });
        } else {
            log({ type: 'warning', message: `Cleanup completed with warnings: ${result.stderr || 'Unknown error'}` });
        }
        
        // حذف تونل‌های مرتبط از دیتابیس
        const tunnelsCollection = await getTunnelsCollection();
        const { deletedCount } = await tunnelsCollection.deleteMany({ 
            $or: [{ server1Id: serverId }, { server2Id: serverId }] 
        });

        if (deletedCount > 0) {
            log({ type: 'success', message: `${deletedCount} tunnel(s) removed from database.` });
        }


        log({ type: 'success', message: `Server ${server.name} has been cleaned up successfully.` });
        revalidatePath('/');
        return { success: true, logs };

    } catch (e: any) {
        log({ type: 'error', message: `An error occurred: ${e.message}` });
        return { success: false, message: e.message || 'An unexpected error occurred.', logs };
    } finally {
        if (ssh?.isConnected()) {
            ssh.dispose();
        }
    }
}
