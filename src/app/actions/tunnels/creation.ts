'use server';

import { revalidatePath } from 'next/cache';
import { NodeSSH } from 'node-ssh';
import { ObjectId } from 'mongodb';

import type { Server, TunnelType, TunnelCreationResult, LogEntry, Tunnel } from '@/lib/types';
import { getTunnelsCollection } from '../db';
import { connectWithKeyManagement } from '../ssh';
import { getTunnelCommands } from './commands';

export async function createCombinedTunnel(
    server1: Server,
    server2: Server,
    server3: Server,
    tunnelType1: TunnelType,
    tunnelType2: TunnelType,
    domain?: string
): Promise<TunnelCreationResult> {
    const combinedLogs: LogEntry[] = [];
    const log = (entry: LogEntry) => {
        console.log(`[${entry.type}] ${entry.message}`);
        combinedLogs.push(entry);
    };

    log({ type: 'info', message: `Starting combined tunnel creation: ${server1.name} -> ${server2.name} -> ${server3.name}` });

    log({ type: 'info', message: `--- Creating Tunnel 1: ${server1.name} to ${server2.name} (${tunnelType1}) ---` });
    const result1 = await createTunnel(server1, server2, tunnelType1, domain);
    combinedLogs.push(...result1.logs);

    if (!result1.success) {
        log({ type: 'error', message: 'Failed to create the first tunnel. Aborting combined tunnel creation.' });
        return { success: false, logs: combinedLogs };
    }
    log({ type: 'success', message: `--- Tunnel 1 (${server1.name} -> ${server2.name}) created successfully. ---` });


    log({ type: 'info', message: `--- Creating Tunnel 2: ${server2.name} to ${server3.name} (${tunnelType2}) ---` });
    const result2 = await createTunnel(server2, server3, tunnelType2, domain);
    combinedLogs.push(...result2.logs);

    if (!result2.success) {
        log({ type: 'error', message: 'Failed to create the second tunnel. The first tunnel was created, but the chain is incomplete.' });
        return { success: false, logs: combinedLogs };
    }
    log({ type: 'success', message: `--- Tunnel 2 (${server2.name} -> ${server3.name}) created successfully. ---` });

    log({ type: 'success', message: 'Combined tunnel creation process completed successfully!' });
    revalidatePath('/');
    return { success: true, logs: combinedLogs };
}

export async function createTunnel(
  server1: Server,
  server2: Server,
  tunnelType: TunnelType,
  domain?: string
): Promise<TunnelCreationResult> {
  const logs: LogEntry[] = [];
  const log = (entry: LogEntry) => {
    console.log(`[${entry.type}] ${entry.message}`);
    logs.push(entry);
  };
  
  let ssh1: NodeSSH | null = null;
  let ssh2: NodeSSH | null = null;

  const tunnelName = `tun${Math.floor(Math.random() * 1000)}`;
  const randomOctet = () => Math.floor(Math.random() * 253) + 1;
  const subnet = randomOctet();
  const tunnelIp1 = `10.0.${subnet}.1`;
  const tunnelIp2 = `10.0.${subnet}.2`;

  try {
    log({ type: 'info', message: 'Starting tunnel creation process...' });
    log({ type: 'info', message: `Tunnel type: ${tunnelType}` });
    log({ type: 'info', message: `Server 1: ${server1.name} (${server1.ipAddress})` });
    log({ type: 'info', message: `Server 2: ${server2.name} (${server2.ipAddress})` });
    
    log({ type: 'info', message: `Using tunnel name: ${tunnelName}` });
    log({ type: 'success', message: `Server 1 Tunnel IP: ${tunnelIp1}` });
    log({ type: 'success', message: `Server 2 Tunnel IP: ${tunnelIp2}` });

    log({ type: 'info', message: `Connecting to ${server1.name}...` });
    ssh1 = await connectWithKeyManagement(server1, log);
    log({ type: 'success', message: `Connected to ${server1.name}` });
    
    log({ type: 'info', message: `Connecting to ${server2.name}...` });
    ssh2 = await connectWithKeyManagement(server2, log);
    log({ type: 'success', message: `Connected to ${server2.name}` });
    
    log({ type: 'info', message: `Selected tunnel type: ${tunnelType}` });

    const depsMap: Partial<Record<TunnelType, string[]>> = {
      'WireGuard': ['wireguard-tools'],
      'OpenVPN': ['openvpn'],
      'IPsec': ['strongswan'],
      'V2Ray (WS+TLS)': ['curl', 'nginx', 'certbot', 'python3-certbot-nginx']
    }

    const requiredDeps = depsMap[tunnelType] || [];
    
    if (requiredDeps.length > 0) {
      log({ type: 'info', message: 'Checking and installing dependencies...' });

      const serversToProcess = [
        { ssh: ssh1, server: server1, deps: requiredDeps },
        { ssh: ssh2, server: server2, deps: requiredDeps },
      ];
      
      // Special handling for V2Ray: server1 (client) only needs curl.
      if (tunnelType === 'V2Ray (WS+TLS)') {
          serversToProcess[0].deps = ['curl']; 
      }

      for (const { ssh, server, deps } of serversToProcess) {
        if (!ssh) continue;
        let needsUpdate = false;
        const depsToInstall = [];

        for (const dep of deps) {
          log({ type: 'command', message: `[${server.name}] Checking for ${dep}...` });
          const checkResult = await ssh.execCommand(`dpkg -s ${dep}`);
          if (checkResult.code !== 0) {
            log({ type: 'warning', message: `Dependency '${dep}' not found on ${server.name}. It will be installed.` });
            depsToInstall.push(dep);
            needsUpdate = true;
          } else {
            log({ type: 'success', message: `Dependency '${dep}' is already installed on ${server.name}.` });
          }
        }
        
        if (depsToInstall.length > 0) {
          if (needsUpdate) {
            log({ type: 'command', message: `[${server.name}] Running apt-get update...` });
            const updateResult = await ssh.execCommand('apt-get update');
            if (updateResult.code !== 0) {
                throw new Error(`Failed to run apt-get update on ${server.name}: ${updateResult.stderr}`);
            }
            log({ type: 'success', message: `[${server.name}] Package list updated.` });
          }

          const installCmd = `apt-get install -y ${depsToInstall.join(' ')}`;
          log({ type: 'command', message: `[${server.name}] ${installCmd}` });
          const installResult = await ssh.execCommand(installCmd);
          if (installResult.code !== 0) {
              throw new Error(`Failed to install dependencies on ${server.name}: ${installResult.stderr}`);
          }
          log({ type: 'success', message: `[${server.name}] Dependencies installed successfully.` });
        }
      }
    }
    
    log({ type: 'info', message: 'Generating tunnel commands...' });
    const { commandsS1, commandsS2, extraLogs } = await getTunnelCommands({
      tunnelType,
      server1,
      server2,
      ssh1,
      ssh2,
      tunnelName,
      tunnelIp1,
      tunnelIp2,
      domain,
      log,
    });
    logs.push(...extraLogs);
    log({ type: 'success', message: 'Tunnel commands generated successfully' });
    

    if (tunnelType !== 'V2Ray (WS+TLS)') {
        log({ type: 'info', message: `Configuring tunnel on ${server1.name}...` });
        for(const cmd of commandsS1) {
            log({ type: 'command', message: `[${server1.name}] ${cmd}` });
            const result = await ssh1.execCommand(cmd);
            if (result.code !== 0) {
                log({ type: 'error', message: `Stderr: ${result.stderr}`});
                throw new Error(`Command failed on ${server1.name}: ${cmd}`);
            }
             log({ type: 'success', message: result.stdout || `Command executed successfully.` });
        }
        log({ type: 'success', message: `Tunnel configured on ${server1.name}.` });

        log({ type: 'info', message: `Configuring tunnel on ${server2.name}...` });
        for(const cmd of commandsS2) {
            log({ type: 'command', message: `[${server2.name}] ${cmd}` });
            const result = await ssh2.execCommand(cmd);
            if (result.code !== 0) {
                log({ type: 'error', message: `Stderr: ${result.stderr}`});
                throw new Error(`Command failed on ${server2.name}: ${cmd}`);
            }
            log({ type: 'success', message: result.stdout || `Command executed successfully.` });
        }
        log({ type: 'success', message: `Tunnel configured on ${server2.name}.` });
    }

    const tunnelsCollection = await getTunnelsCollection();
    log({ type: 'info', message: 'Saving tunnel configuration...' });
    const newTunnelData = {
        server1Id: server1.id,
        server2Id: server2.id,
        type: tunnelType,
        createdAt: new Date().toISOString(),
        isSaved: false,
        tunnelName,
        tunnelIp1,
        tunnelIp2,
        domain: tunnelType === 'V2Ray (WS+TLS)' ? domain : undefined,
    };
    const { insertedId } = await tunnelsCollection.insertOne({
        ...newTunnelData,
        _id: new ObjectId(),
        id: new ObjectId().toString()
    });
    log({ type: 'success', message: 'Tunnel configuration saved.' });

    log({ type: 'success', message: 'Tunnel creation process completed successfully!' });
    revalidatePath('/');
    return { success: true, logs };

  } catch (e: any) {
    log({ type: 'error', message: `Error: ${e.message || 'An unexpected error occurred during tunnel creation.'}` });
    log({ type: 'error', message: `Stack: ${e.stack || 'No stack trace available'}` });
    log({ type: 'error', message: 'Tunnel creation process failed. Please review the logs.' });
    return { success: false, logs };
  } finally {
    try {
      if (ssh1?.isConnected()) {
          log({ type: 'info', message: `Disconnecting from ${server1.name}...` });
          ssh1.dispose();
      }
      if (ssh2?.isConnected()) {
          log({ type: 'info', message: `Disconnecting from ${server2.name}...` });
          ssh2.dispose();
      }
    } catch (cleanupError: any) {
      log({ type: 'warning', message: `Cleanup error: ${cleanupError.message}` });
    }
    revalidatePath('/');
  }
}

    