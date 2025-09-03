'use server';

import { revalidatePath } from 'next/cache';
import { NodeSSH } from 'node-ssh';
import { ObjectId } from 'mongodb';

import type { Server, Tunnel } from '@/lib/types';
import { getServersCollection, getTunnelsCollection } from '../db';
import { connectWithKeyManagement, getSshKeys } from '../ssh';


export async function saveTunnelConfig(tunnel: Tunnel): Promise<{ success: boolean; message?: string }> {
    const serversCollection = await getServersCollection();
    if (!ObjectId.isValid(tunnel.server1Id) || !ObjectId.isValid(tunnel.server2Id)) {
        return { success: false, message: 'Invalid server ID in tunnel data.' };
    }
    const server1 = await serversCollection.findOne({ _id: new ObjectId(tunnel.server1Id) });
    const server2 = await serversCollection.findOne({ _id: new ObjectId(tunnel.server2Id) });

    if (!server1 || !server2) {
        return { success: false, message: 'Source or destination server not found.' };
    }

    let ssh1: NodeSSH | null = null;
    let ssh2: NodeSSH | null = null;


    try {
        ssh1 = await connectWithKeyManagement(server1);
        ssh2 = await connectWithKeyManagement(server2);
        
        const { tunnelName, tunnelIp1, tunnelIp2, type, id } = tunnel;
        
        const run = async (ssh: NodeSSH, cmd: string) => {
            const result = await ssh.execCommand(cmd);
            if (result.code !== 0) {
                throw new Error(`Failed to run '${cmd}' on server: ${result.stderr}`);
            }
            return result.stdout;
        };

        switch (type) {
            case 'GRE':
            case 'IPIP':
            case 'SIT':
            case 'VTI':
                const mode = type.toLowerCase();
                const configPathS1 = `/etc/network/interfaces.d/${tunnelName}`;
                const configPathS2 = `/etc/network/interfaces.d/${tunnelName}`;

                const baseConfig = (local: string, remote: string, address: string, key?: number) => 
                    `auto ${tunnelName}\niface ${tunnelName} inet tunnel\nmode ${mode}\nlocal ${local}\nremote ${remote}\naddress ${address}\nnetmask 255.255.255.252\nttl 255\n` +
                    (key ? `ikey ${key}\nokey ${key}\n` : '') +
                    `up ip link set dev ${tunnelName} up`;
                
                const vtiKey = type === 'VTI' ? Math.floor(Math.random() * 100000) : undefined;
                
                const configS1 = baseConfig(server1.ipAddress, server2.ipAddress, tunnelIp1, vtiKey);
                const configS2 = baseConfig(server2.ipAddress, server1.ipAddress, tunnelIp2, vtiKey);
                
                await run(ssh1, `echo -e "${configS1}" | sudo tee ${configPathS1}`);
                await run(ssh2, `echo -e "${configS2}" | sudo tee ${configPathS2}`);
                break;
            
            case 'OpenVPN':
            case 'WireGuard':
                const serviceNameWG = type === 'OpenVPN' ? `openvpn@${tunnelName}` : `wg-quick@${tunnelName}`;
                await run(ssh1, `sudo systemctl enable ${serviceNameWG}`);
                await run(ssh2, `sudo systemctl enable ${serviceNameWG}`);
                break;
            
            case 'IPsec':
                await run(ssh1, `sudo systemctl enable ipsec`);
                await run(ssh2, `sudo systemctl enable ipsec`);
                break;

            case 'Reverse Tunnel (via SSH)':
                const serviceNameR = `reverse-tunnel-${server1.name.replace(/\s/g, '_')}.service`;
                const servicePath = `/etc/systemd/system/${serviceNameR}`;
                
                const { privateKey } = await getSshKeys();
                // Important: The user running the service on server2 needs the key.
                const remoteKeyPath = `/home/${server2.username}/.ssh/reverse_tunnel_key_${tunnel.id}`;

                await run(ssh2, `mkdir -p /home/${server2.username}/.ssh && chmod 700 /home/${server2.username}/.ssh`);
                
                // Write the private key content directly
                await run(ssh2, `echo '${privateKey.replace(/'/g, "'\\''")}' > ${remoteKeyPath} && chmod 600 ${remoteKeyPath}`);


                const sshCommand = `/usr/bin/ssh -o "ServerAliveInterval=60" -o "ExitOnForwardFailure=yes" -o "StrictHostKeyChecking=no" -i ${remoteKeyPath} -w any:any ${server1.username}@${server1.ipAddress} 'true'`;

                const serviceFileContent = `
[Unit]
Description=Reverse SSH tunnel to ${server1.name}
Wants=network-online.target
After=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=${server2.username}
ExecStart=${sshCommand}
Restart=always
RestartSec=15

[Install]
WantedBy=multi-user.target
`;
                
                await run(ssh2, `echo '${serviceFileContent.replace(/'/g, "'\\''")}' | sudo tee ${servicePath}`);
                await run(ssh2, `sudo systemctl daemon-reload`);
                await run(ssh2, `sudo systemctl enable ${serviceNameR}`);
                await run(ssh2, `sudo systemctl restart ${serviceNameR}`);
                
                await new Promise(r => setTimeout(r, 2000));
                
                const configureInterface = async(ssh: NodeSSH, ip: string, serverName: string) => {
                    const findTunCmd = "ip -o tuntap | awk '{print $1; exit}'";
                    let tunDevice = '';
                    for (let i = 0; i < 5; i++) {
                        tunDevice = (await run(ssh, findTunCmd)).trim();
                        if (tunDevice) break;
                        await new Promise(r => setTimeout(r, 1000));
                    }

                    if(tunDevice) {
                        await run(ssh, `ip addr add ${ip}/30 dev ${tunDevice}`);
                        await run(ssh, `ip link set ${tunDevice} up`);
                    } else {
                        throw new Error(`Could not find tun device to configure on ${serverName}.`);
                    }
                };

                await configureInterface(ssh1, tunnelIp1, server1.name);
                await configureInterface(ssh2, tunnelIp2, server2.name);
                
                break;
            
            case 'V2Ray (WS+TLS)':
                 await run(ssh1, `sudo systemctl enable v2ray`);
                 await run(ssh2, `sudo systemctl enable v2ray`);
                 await run(ssh2, `sudo systemctl enable nginx`);
                 break;
                
            default:
                return { success: false, message: `Saving configuration for ${type} is not implemented.` };
        }
       
        const tunnelsCollection = await getTunnelsCollection();
        await tunnelsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isSaved: true } }
        );
        revalidatePath('/');

        return { success: true };

    } catch (e: any) {
        console.error('Failed to save tunnel config:', e);
        return { success: false, message: e.message || 'An unexpected error occurred.' };
    } finally {
        if (ssh1?.isConnected()) ssh1.dispose();
        if (ssh2?.isConnected()) ssh2.dispose();
    }
}
