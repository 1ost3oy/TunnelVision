'use server';

import { revalidatePath } from 'next/cache';
import { NodeSSH } from 'node-ssh';
import { ObjectId } from 'mongodb';

import type { Server, TunnelType, TunnelCreationResult, LogEntry, Tunnel } from '@/lib/types';
import { getTunnelsCollection } from '../db';
import { connectWithKeyManagement } from '../ssh';
import { execSync } from 'child_process';

function generateKeys() {
    const privateKey = execSync('wg genkey', { encoding: 'utf8' }).trim();
    const publicKey = execSync(`echo '${privateKey}' | wg pubkey`, { encoding: 'utf8' }).trim();
    return { privateKey, publicKey };
}

async function generateSimpleNetmakerConfig(input: any) {
    const brokerKeys = generateKeys();
    const brokerIp = '10.20.0.1';
    
    const clientConfigs = input.clients.map((client: any, index: number) => {
        const clientKeys = generateKeys();
        const clientIp = `10.20.0.${index + 2}`;
        
        const configFile = `[Interface]\nPrivateKey = ${clientKeys.privateKey}\nAddress = ${clientIp}/24\n\n[Peer]\nPublicKey = ${brokerKeys.publicKey}\nEndpoint = ${input.broker.ipAddress}:${input.listenPort}\nAllowedIPs = 10.20.0.0/24\nPersistentKeepalive = 25`;
        
        return {
            serverId: client.id,
            configFile,
            keys: clientKeys,
            address: clientIp
        };
    });
    
    const brokerPeers = clientConfigs.map(c => `[Peer]\nPublicKey = ${c.keys.publicKey}\nAllowedIPs = ${c.address}/32`).join('\n\n');
    const brokerConfig = {
        serverId: input.broker.id,
        configFile: `[Interface]\nPrivateKey = ${brokerKeys.privateKey}\nAddress = ${brokerIp}/24\nListenPort = ${input.listenPort}\n\n${brokerPeers}`,
        keys: brokerKeys,
        address: brokerIp
    };
    
    return { brokerConfig, clientConfigs };
}

async function executeCommand(ssh: NodeSSH, command: string, serverName: string, log: (entry: LogEntry) => void): Promise<string> {
    log({ type: 'command', message: `[${serverName}] $ ${command}` });
    const result = await ssh.execCommand(command);
    if (result.code !== 0) {
        log({ type: 'error', message: `Stderr on ${serverName}: ${result.stderr}`});
        throw new Error(`Command failed on ${serverName}: ${command}`);
    }
    log({ type: 'success', message: `[${serverName}] Command executed successfully.` });
    return result.stdout;
}


export async function createMeshNetwork(
    broker: Server,
    clients: Server[]
): Promise<TunnelCreationResult> {
    const logs: LogEntry[] = [];
    const log = (entry: LogEntry) => {
        console.log(`[${entry.type}] ${entry.message}`);
        logs.push(entry);
    };

    const sshConnections: { [key: string]: NodeSSH } = {};

    try {
        log({ type: 'info', message: 'Starting Netmaker mesh network creation...' });

        // 1. Generate all configs (fallback implementation)
        log({ type: 'info', message: 'Generating WireGuard configurations...' });
        const networkConfig = await generateSimpleNetmakerConfig({
            broker: { id: broker.id, name: broker.name, ipAddress: broker.ipAddress },
            clients: clients.map(c => ({ id: c.id, name: c.name, ipAddress: c.ipAddress })),
            networkBaseIp: '10.20.0.0',
            listenPort: 51820,
        });
        log({ type: 'success', message: 'WireGuard configurations generated.' });

        // 2. Connect to all servers
        const allServers = [broker, ...clients];
        for (const server of allServers) {
            log({ type: 'info', message: `Connecting to ${server.name}...` });
            sshConnections[server.id] = await connectWithKeyManagement(server, log);
            log({ type: 'success', message: `Connected to ${server.name}.` });
        }

        // 3. Install WireGuard on all servers
        for (const server of allServers) {
            log({ type: 'info', message: `Checking dependencies on ${server.name}...` });
            const ssh = sshConnections[server.id];
            await executeCommand(ssh, 'apt-get update', server.name, log);
            await executeCommand(ssh, 'apt-get install -y wireguard-tools', server.name, log);
            log({ type: 'success', message: `WireGuard is ready on ${server.name}.` });
        }
        
        const tunnelName = "nm0"; // Static name for the Netmaker interface

        // 4. Configure Broker
        log({ type: 'info', message: `Configuring broker server: ${broker.name}...` });
        const brokerSsh = sshConnections[broker.id];
        await executeCommand(brokerSsh, `echo "${networkConfig.brokerConfig.configFile}" > /etc/wireguard/${tunnelName}.conf`, broker.name, log);
        await executeCommand(brokerSsh, `wg-quick up ${tunnelName}`, broker.name, log);
        await executeCommand(brokerSsh, `systemctl enable wg-quick@${tunnelName}`, broker.name, log);
        log({ type: 'success', message: `Broker ${broker.name} configured and tunnel is up.` });

        // 5. Configure Clients
        for (const clientConfig of networkConfig.clientConfigs) {
            const clientServer = clients.find(c => c.id === clientConfig.serverId);
            if (!clientServer) {
                log({type: 'error', message: `Configuration generated for an unknown client ID: ${clientConfig.serverId}`});
                continue;
            }
            log({ type: 'info', message: `Configuring client server: ${clientServer.name}...` });
            const clientSsh = sshConnections[clientServer.id];
            await executeCommand(clientSsh, `echo "${clientConfig.configFile}" > /etc/wireguard/${tunnelName}.conf`, clientServer.name, log);
            await executeCommand(clientSsh, `wg-quick up ${tunnelName}`, clientServer.name, log);
            await executeCommand(clientSsh, `systemctl enable wg-quick@${tunnelName}`, clientServer.name, log);
            log({ type: 'success', message: `Client ${clientServer.name} configured and tunnel is up.` });
        }
        
        // 6. Save tunnels to DB for visualization (each client to broker)
        const tunnelsCollection = await getTunnelsCollection();
        const tunnelDocs: Tunnel[] = networkConfig.clientConfigs.map(clientConfig => ({
            _id: new ObjectId(),
            id: new ObjectId().toString(),
            server1Id: clientConfig.serverId,
            server2Id: broker.id,
            type: 'WireGuard', // Representing as WG tunnels
            createdAt: new Date().toISOString(),
            isSaved: true,
            tunnelName: `${tunnelName}-${clientConfig.serverId.substring(0, 4)}`, // Unique-ish name for display
            tunnelIp1: clientConfig.address,
            tunnelIp2: networkConfig.brokerConfig.address,
        }));
        
        if (tunnelDocs.length > 0) {
            await tunnelsCollection.insertMany(tunnelDocs);
            log({ type: 'info', message: `Saved ${tunnelDocs.length} client-broker tunnel configurations to the database.` });
        }


        log({ type: 'success', message: 'Netmaker mesh network created successfully!' });
        revalidatePath('/');
        return { success: true, logs };

    } catch (e: any) {
        log({ type: 'error', message: `Mesh creation failed: ${e.message}` });
        return { success: false, logs };
    } finally {
        for (const ssh of Object.values(sshConnections)) {
            if (ssh.isConnected()) {
                ssh.dispose();
            }
        }
    }
}
