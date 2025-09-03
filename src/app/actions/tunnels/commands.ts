'use server';

import { NodeSSH } from 'node-ssh';
import type { LogEntry } from '@/lib/types';
import type { CommandOptions, CommandResult } from './types';

export async function getTunnelCommands(options: CommandOptions): Promise<CommandResult> {
    const { tunnelType, server1, server2, ssh1, ssh2, tunnelName, tunnelIp1, tunnelIp2, domain, log } = options;

    let commandsS1: string[] = [];
    let commandsS2: string[] = [];
    const extraLogs: LogEntry[] = [];
    const localLog = (entry: LogEntry) => extraLogs.push(entry);


    switch (tunnelType) {
        case 'GRE':
            // Check for existing tunnel
            const greCheckS1 = await ssh1.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
            const greCheckS2 = await ssh2.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
            
            if (greCheckS1.code === 0) {
                localLog({type: 'warning', message: `GRE tunnel ${tunnelName} already exists on ${server1.name}. Removing...`});
                await ssh1.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
            }
            if (greCheckS2.code === 0) {
                localLog({type: 'warning', message: `GRE tunnel ${tunnelName} already exists on ${server2.name}. Removing...`});
                await ssh2.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
            }
            
            commandsS1.push(`ip tunnel add ${tunnelName} mode gre remote ${server2.ipAddress} local ${server1.ipAddress} ttl 255`);
            commandsS1.push(`ip addr add ${tunnelIp1}/30 dev ${tunnelName}`);
            commandsS1.push(`ip link set ${tunnelName} up`);

            commandsS2.push(`ip tunnel add ${tunnelName} mode gre remote ${server1.ipAddress} local ${server2.ipAddress} ttl 255`);
            commandsS2.push(`ip addr add ${tunnelIp2}/30 dev ${tunnelName}`);
            commandsS2.push(`ip link set ${tunnelName} up`);
            break;
        case 'IPIP':
            // Check for existing tunnel
            const ipipCheckS1 = await ssh1.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
            const ipipCheckS2 = await ssh2.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
            
            if (ipipCheckS1.code === 0) {
                localLog({type: 'warning', message: `IPIP tunnel ${tunnelName} already exists on ${server1.name}. Removing...`});
                await ssh1.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
            }
            if (ipipCheckS2.code === 0) {
                localLog({type: 'warning', message: `IPIP tunnel ${tunnelName} already exists on ${server2.name}. Removing...`});
                await ssh2.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
            }
            
            commandsS1.push(`ip tunnel add ${tunnelName} mode ipip remote ${server2.ipAddress} local ${server1.ipAddress} ttl 255`);
            commandsS1.push(`ip addr add ${tunnelIp1}/30 dev ${tunnelName}`);
            commandsS1.push(`ip link set ${tunnelName} up`);

            commandsS2.push(`ip tunnel add ${tunnelName} mode ipip remote ${server1.ipAddress} local ${server2.ipAddress} ttl 255`);
            commandsS2.push(`ip addr add ${tunnelIp2}/30 dev ${tunnelName}`);
            commandsS2.push(`ip link set ${tunnelName} up`);
            break;
        case 'SIT':
             // Check for existing tunnel
             const sitCheckS1 = await ssh1.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
             const sitCheckS2 = await ssh2.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
             
             if (sitCheckS1.code === 0) {
                 localLog({type: 'warning', message: `SIT tunnel ${tunnelName} already exists on ${server1.name}. Removing...`});
                 await ssh1.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
             }
             if (sitCheckS2.code === 0) {
                 localLog({type: 'warning', message: `SIT tunnel ${tunnelName} already exists on ${server2.name}. Removing...`});
                 await ssh2.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
             }
             
             commandsS1.push(`ip tunnel add ${tunnelName} mode sit remote ${server2.ipAddress} local ${server1.ipAddress} ttl 255`);
             commandsS1.push(`ip addr add ${tunnelIp1}/30 dev ${tunnelName}`);
             commandsS1.push(`ip link set ${tunnelName} up`);
 
             commandsS2.push(`ip tunnel add ${tunnelName} mode sit remote ${server1.ipAddress} local ${server2.ipAddress} ttl 255`);
             commandsS2.push(`ip addr add ${tunnelIp2}/30 dev ${tunnelName}`);
             commandsS2.push(`ip link set ${tunnelName} up`);
             break;
        case 'VTI':
             // Check for existing tunnel
             const vtiCheckS1 = await ssh1.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
             const vtiCheckS2 = await ssh2.execCommand(`ip link show ${tunnelName} 2>/dev/null`);
             
             if (vtiCheckS1.code === 0) {
                 localLog({type: 'warning', message: `VTI tunnel ${tunnelName} already exists on ${server1.name}. Removing...`});
                 await ssh1.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
             }
             if (vtiCheckS2.code === 0) {
                 localLog({type: 'warning', message: `VTI tunnel ${tunnelName} already exists on ${server2.name}. Removing...`});
                 await ssh2.execCommand(`ip link delete ${tunnelName} 2>/dev/null || true`);
             }
             
             const vtiKey = Math.floor(Math.random() * 100000);
             localLog({ type: 'info', message: `Using VTI key: ${vtiKey}` });
             commandsS1.push(`ip tunnel add ${tunnelName} mode vti remote ${server2.ipAddress} local ${server1.ipAddress} key ${vtiKey}`);
             commandsS1.push(`ip addr add ${tunnelIp1}/30 dev ${tunnelName}`);
             commandsS1.push(`ip link set ${tunnelName} up`);

             commandsS2.push(`ip tunnel add ${tunnelName} mode vti remote ${server1.ipAddress} local ${server2.ipAddress} key ${vtiKey}`);
             commandsS2.push(`ip addr add ${tunnelIp2}/30 dev ${tunnelName}`);
             commandsS2.push(`ip link set ${tunnelName} up`);
             break;
        case 'WireGuard':
            localLog({type: 'info', message: 'Generating WireGuard keys...'});
            
            // Check if config already exists
            const wgCheckS1 = await ssh1.execCommand(`test -f /etc/wireguard/${tunnelName}.conf`);
            const wgCheckS2 = await ssh2.execCommand(`test -f /etc/wireguard/${tunnelName}.conf`);
            
            if (wgCheckS1.code === 0 || wgCheckS2.code === 0) {
                localLog({type: 'warning', message: `WireGuard config ${tunnelName} already exists. Removing old config...`});
                await ssh1.execCommand(`wg-quick down ${tunnelName} 2>/dev/null || true`);
                await ssh2.execCommand(`wg-quick down ${tunnelName} 2>/dev/null || true`);
                await ssh1.execCommand(`rm -f /etc/wireguard/${tunnelName}.conf`);
                await ssh2.execCommand(`rm -f /etc/wireguard/${tunnelName}.conf`);
            }
            
            const s1_keys_res = await ssh1.execCommand('umask 077 && wg genkey | tee privatekey | wg pubkey > publickey && cat privatekey && cat publickey');
            const s2_keys_res = await ssh2.execCommand('umask 077 && wg genkey | tee privatekey | wg pubkey > publickey && cat privatekey && cat publickey');

            if(s1_keys_res.code !== 0 || s2_keys_res.code !== 0) throw new Error(`Failed to generate WireGuard keys: ${s1_keys_res.stderr} ${s2_keys_res.stderr}`);
            
            const [s1_priv, s1_pub] = s1_keys_res.stdout.split('\n');
            const [s2_priv, s2_pub] = s2_keys_res.stdout.split('\n');
            localLog({type: 'success', message: 'WireGuard keys generated.'});
            
            const randomPort = () => Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
            const s1_port = randomPort();
            const s2_port = randomPort();
            localLog({type: 'info', message: `Using port ${s1_port} for ${server1.name} and port ${s2_port} for ${server2.name}`});
            
            const wg_s1_config = `[Interface]\nPrivateKey = ${s1_priv}\nAddress = ${tunnelIp1}/24\nListenPort = ${s1_port}\n\n[Peer]\nPublicKey = ${s2_pub}\nEndpoint = ${server2.ipAddress}:${s2_port}\nAllowedIPs = ${tunnelIp2}/32\nPersistentKeepalive = 25`;
            const wg_s2_config = `[Interface]\nPrivateKey = ${s2_priv}\nAddress = ${tunnelIp2}/24\nListenPort = ${s2_port}\n\n[Peer]\nPublicKey = ${s1_pub}\nEndpoint = ${server1.ipAddress}:${s1_port}\nAllowedIPs = ${tunnelIp1}/32\nPersistentKeepalive = 25`;

            commandsS1.push(`echo "${wg_s1_config}" > /etc/wireguard/${tunnelName}.conf`);
            commandsS1.push(`wg-quick up ${tunnelName}`);

            commandsS2.push(`echo "${wg_s2_config}" > /etc/wireguard/${tunnelName}.conf`);
            commandsS2.push(`wg-quick up ${tunnelName}`);

            break;
        case 'OpenVPN':
            localLog({type: 'info', message: 'Checking for existing OpenVPN config...'});
            
            // Check and stop existing OpenVPN service
            const ovpnCheckS1 = await ssh1.execCommand(`test -f /etc/openvpn/${tunnelName}.conf`);
            const ovpnCheckS2 = await ssh2.execCommand(`test -f /etc/openvpn/${tunnelName}.conf`);
            
            if (ovpnCheckS1.code === 0 || ovpnCheckS2.code === 0) {
                localLog({type: 'warning', message: `OpenVPN config ${tunnelName} already exists. Stopping old service...`});
                await ssh1.execCommand(`systemctl stop openvpn@${tunnelName} 2>/dev/null || true`);
                await ssh2.execCommand(`systemctl stop openvpn@${tunnelName} 2>/dev/null || true`);
                await ssh1.execCommand(`rm -f /etc/openvpn/${tunnelName}.conf`);
                await ssh2.execCommand(`rm -f /etc/openvpn/${tunnelName}.conf`);
            }
            
            localLog({type: 'info', message: 'Generating OpenVPN static key...'});
            const keyRes = await ssh1.execCommand('openvpn --genkey --secret static.key && cat static.key');
            if (keyRes.code !== 0) throw new Error(`Failed to generate OpenVPN key: ${keyRes.stderr}`);
            const staticKey = keyRes.stdout;
            localLog({type: 'success', message: 'OpenVPN static key generated.'});
            
            const ovpn_port = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
            localLog({type: 'info', message: `Using port ${ovpn_port} for OpenVPN connection.`});
            
            localLog({type: 'info', message: `Copying key to ${server2.name}...`});
            await ssh2.execCommand(`echo "${staticKey}" > /etc/openvpn/static.key`);
            localLog({type: 'success', message: `Key copied to ${server2.name}.`});

            const s1_config = `dev ${tunnelName}\nifconfig ${tunnelIp1} ${tunnelIp2}\nremote ${server2.ipAddress}\nsecret /etc/openvpn/static.key\nport ${ovpn_port}\nproto udp\nkeepalive 10 60\nping-timer-rem\npersist-tun\npersist-key\nverb 3`;
            const s2_config = `dev ${tunnelName}\nifconfig ${tunnelIp2} ${tunnelIp1}\nremote ${server1.ipAddress}\nsecret /etc/openvpn/static.key\nport ${ovpn_port}\nproto udp\nkeepalive 10 60\nping-timer-rem\npersist-tun\npersist-key\nverb 3`;

            commandsS1.push(`echo "${s1_config}" > /etc/openvpn/${tunnelName}.conf`);
            commandsS1.push(`systemctl start openvpn@${tunnelName}`);
            
            commandsS2.push(`echo "${s2_config}" > /etc/openvpn/${tunnelName}.conf`);
            commandsS2.push(`systemctl start openvpn@${tunnelName}`);
            break;
        case 'Reverse Tunnel (via SSH)':
            localLog({type: 'info', message: 'Configuring SSH Reverse Tunnel...'});
            for (const [ssh, server] of [[ssh1, server1], [ssh2, server2]] as const) {
                 if (!ssh) continue;
                 localLog({type: 'info', message: `Checking for PermitTunnel on ${server.name}`});
                 const checkCmd = `grep -q "^\\s*PermitTunnel\\s*yes" /etc/ssh/sshd_config`;
                 const checkRes = await ssh.execCommand(checkCmd);
                 if (checkRes.code !== 0) {
                     localLog({type: 'warning', message: `PermitTunnel not enabled on ${server.name}. Attempting to enable.`});
                     const enableCmd = `echo 'PermitTunnel yes' | sudo tee -a /etc/ssh/sshd_config && sudo systemctl restart sshd`;
                     log({type: 'command', message: `[${server.name}] ${enableCmd}`});
                     const enableRes = await ssh.execCommand(enableCmd);
                     if(enableRes.code !== 0) {
                         throw new Error(`Failed to enable PermitTunnel on ${server.name}: ${enableRes.stderr}`);
                     }
                     localLog({type: 'success', message: `PermitTunnel enabled and sshd restarted on ${server.name}`});
                 } else {
                     localLog({type: 'success', message: `PermitTunnel is already enabled on ${server.name}`});
                 }
            }
            
            localLog({type: 'info', message: `Establishing tunnel from ${server2.name} to ${server1.name}`});
            const anyTun = 'any'; 
            const sshTunnelCmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -f -w ${anyTun}:${anyTun} ${server1.username}@${server1.ipAddress} 'true'`;
            log({type: 'command', message: `[${server2.name}] ${sshTunnelCmd}`});
            const sshTunnelRes = await ssh2.execCommand(sshTunnelCmd);
            if(sshTunnelRes.code !== 0 && !sshTunnelRes.stderr.includes("already exists")) {
                 throw new Error(`Failed to establish SSH tunnel from ${server2.name}: ${sshTunnelRes.stderr}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            localLog({type: 'success', message: `SSH tunnel process initiated on ${server2.name}.`});
            
            const findTunS1 = await ssh1.execCommand("ip -o tuntap | awk '{print $1}'");
            const findTunS2 = await ssh2.execCommand("ip -o tuntap | awk '{print $1}'");
            const tunDeviceS1 = findTunS1.stdout.split('\n').filter(Boolean).pop();
            const tunDeviceS2 = findTunS2.stdout.split('\n').filter(Boolean).pop();

            if (!tunDeviceS1 || !tunDeviceS2) {
                throw new Error("Could not determine tunnel device name after SSH tunnel creation.");
            }

            localLog({type: 'info', message: `Found tunnel device ${tunDeviceS1} on ${server1.name}`});
            localLog({type: 'info', message: `Found tunnel device ${tunDeviceS2} on ${server2.name}`});

            commandsS1.push(`ip addr add ${tunnelIp1}/30 dev ${tunDeviceS1}`);
            commandsS1.push(`ip link set ${tunDeviceS1} up`);

            commandsS2.push(`ip addr add ${tunnelIp2}/30 dev ${tunDeviceS2}`);
            commandsS2.push(`ip link set ${tunDeviceS2} up`);

            break;
        case 'IPsec':
            localLog({ type: 'info', message: 'Configuring IPsec tunnel using strongSwan...' });
            
            const connName = `conn-${tunnelName}`;
            
            // Check for existing connection
            const ipsecCheckS1 = await ssh1.execCommand(`ipsec status | grep -q "${connName}"`);
            const ipsecCheckS2 = await ssh2.execCommand(`ipsec status | grep -q "${connName}"`);
            
            if (ipsecCheckS1.code === 0 || ipsecCheckS2.code === 0) {
                localLog({type: 'warning', message: `IPsec connection ${connName} already exists. Stopping old connection...`});
                await ssh1.execCommand(`ipsec down ${connName} 2>/dev/null || true`);
                await ssh2.execCommand(`ipsec down ${connName} 2>/dev/null || true`);
            }
            
            localLog({ type: 'info', message: 'Generating Pre-Shared Key (PSK)...' });
            const pskRes = await ssh1.execCommand('openssl rand -base64 32');
            if (pskRes.code !== 0) throw new Error('Failed to generate PSK.');
            const psk = pskRes.stdout.trim();
            localLog({ type: 'success', message: 'PSK generated successfully.' });

            const ipsecConfigS1 = `
config setup
    charondebug="all"
    uniqueids=yes
    strictcrlpolicy=no

conn %default
    ikelifetime=60m
    keylife=20m
    rekeymargin=3m
    keyingtries=1
    keyexchange=ikev2
    authby=secret
    
conn ${connName}
    left=%defaultroute
    leftid=${server1.ipAddress}
    leftsubnet=${tunnelIp1}/32
    right=${server2.ipAddress}
    rightid=${server2.ipAddress}
    rightsubnet=${tunnelIp2}/32
    auto=start
`;

            const ipsecConfigS2 = `
config setup
    charondebug="all"
    uniqueids=yes
    strictcrlpolicy=no

conn %default
    ikelifetime=60m
    keylife=20m
    rekeymargin=3m
    keyingtries=1
    keyexchange=ikev2
    authby=secret
    
conn ${connName}
    left=%defaultroute
    leftid=${server2.ipAddress}
    leftsubnet=${tunnelIp2}/32
    right=${server1.ipAddress}
    rightid=${server1.ipAddress}
    rightsubnet=${tunnelIp1}/32
    auto=start
`;
            const ipsecSecrets = `${server1.ipAddress} ${server2.ipAddress} : PSK "${psk}"`;

            commandsS1.push(`echo "${ipsecConfigS1}" > /etc/ipsec.conf`);
            commandsS1.push(`echo "${ipsecSecrets}" > /etc/ipsec.secrets`);
            commandsS1.push('ipsec restart');
            commandsS1.push(`ipsec up ${connName}`);

            commandsS2.push(`echo "${ipsecConfigS2}" > /etc/ipsec.conf`);
            commandsS2.push(`echo "${ipsecSecrets}" > /etc/ipsec.secrets`);
            commandsS2.push('ipsec restart');
            commandsS2.push(`ipsec up ${connName}`);
            
            break;
        case 'V2Ray (WS+TLS)':
            if (!domain) {
              throw new Error("Domain name is required for V2Ray (WS+TLS) tunnels.");
            }
            localLog({ type: 'success', message: `Using domain: ${domain}` });

            const runCommand = async (ssh: NodeSSH, serverName: string, command: string, ignoreErrors = false) => {
                log({ type: 'command', message: `[${serverName}] $ ${command}` });
                const result = await ssh.execCommand(command);
                if (result.code !== 0 && !ignoreErrors) {
                    log({ type: 'error', message: `Stderr: ${result.stderr}`});
                    throw new Error(`Command failed on ${serverName}: ${command}`);
                }
                if(result.stdout) localLog({ type: 'success', message: result.stdout });
                return result;
            };

            // Check if V2Ray is already installed
            const v2rayCheckS2 = await ssh2.execCommand('which v2ray');
            if (v2rayCheckS2.code !== 0) {
                localLog({ type: 'info', message: `[${server2.name}] Installing V2Ray...` });
                await runCommand(ssh2, server2.name, 'bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)');
                localLog({ type: 'success', message: `[${server2.name}] V2Ray installed.` });
            } else {
                localLog({ type: 'info', message: `[${server2.name}] V2Ray already installed.` });
            }
            
            localLog({ type: 'info', message: `[${server2.name}] Setting up SSL certificate for ${domain}...` });
            
            // Check if certificate already exists
            const certCheck = await ssh2.execCommand(`test -f /etc/letsencrypt/live/${domain}/fullchain.pem`);
            let certPath = `/etc/letsencrypt/live/${domain}`;
            
            if (certCheck.code !== 0) {
                localLog({ type: 'info', message: `[${server2.name}] Creating self-signed certificate...` });
                await runCommand(ssh2, server2.name, `mkdir -p /etc/ssl/certs/${domain}`);
                await runCommand(ssh2, server2.name, `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/certs/${domain}/privkey.pem -out /etc/ssl/certs/${domain}/fullchain.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=${domain}"`);
                certPath = `/etc/ssl/certs/${domain}`;
                localLog({ type: 'success', message: `[${server2.name}] Self-signed certificate created.` });
            } else {
                localLog({ type: 'info', message: `[${server2.name}] Using existing certificate.` });
            }
            
            localLog({ type: 'info', message: `[${server2.name}] Setting up nginx SSL config...` });
            const sslNginxConfig = `server {
    listen 80;
    server_name ${domain};
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain};
    
    ssl_certificate ${certPath}/fullchain.pem;
    ssl_certificate_key ${certPath}/privkey.pem;
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}`;
            await runCommand(ssh2, server2.name, `echo '${sslNginxConfig}' > /etc/nginx/sites-available/default`);
            await runCommand(ssh2, server2.name, 'systemctl restart nginx');
            localLog({ type: 'success', message: `[${server2.name}] SSL certificate obtained and Nginx configured by Certbot.` });
            
            const v2rayPath = "/v2raypath";
            const v2rayPort = 10000;
            const v2rayUUID = (await ssh1.execCommand('cat /proc/sys/kernel/random/uuid')).stdout.trim();
            localLog({ type: 'info', message: `[${server2.name}] Generated V2Ray UUID: ${v2rayUUID}` });

            localLog({ type: 'info', message: `[${server2.name}] Configuring V2Ray...` });
            const v2rayConfigS2 = `
{
  "inbounds": [{
    "port": ${v2rayPort},
    "listen":"127.0.0.1",
    "protocol": "vmess",
    "settings": {
      "clients": [
        {
          "id": "${v2rayUUID}",
          "alterId": 0
        }
      ]
    },
    "streamSettings": {
      "network": "ws",
      "wsSettings": {
        "path": "${v2rayPath}"
      }
    }
  }],
  "outbounds": [{
    "protocol": "freedom",
    "settings": {}
  }]
}`;
            await runCommand(ssh2, server2.name, `echo '${v2rayConfigS2}' > /usr/local/etc/v2ray/config.json`);
            
            localLog({ type: 'info', message: `[${server2.name}] Adding V2Ray proxy location to Nginx...` });
            const nginxConfPath = `/etc/nginx/sites-available/default`;
            
            const nginxV2rayLocationBlock = `
    location ${v2rayPath} {
      if ($http_upgrade != "websocket") {
        return 404;
      }
      proxy_redirect off;
      proxy_pass http://127.0.0.1:${v2rayPort};
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $http_host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
`;

            const sedCommand = `sed -i '/^\\s*server\\s*{/,$ {/}/i \\${nginxV2rayLocationBlock.split('\n').join('\\n')}}' ${nginxConfPath}`;

            // Remove any existing v2raypath locations to prevent duplicates
            await runCommand(ssh2, server2.name, `sed -i '/location.*\/v2raypath/,/^[[:space:]]*}/d' ${nginxConfPath}`, true);
            
            const nginxResult = await ssh2.execCommand(`cat ${nginxConfPath}`);
            if (nginxResult.code !== 0) {
              throw new Error(`Failed to read Nginx config on ${server2.name}: ${nginxResult.stderr}`);
            }
            let nginxConf = nginxResult.stdout;
            
            // Find the HTTPS server block and add location there
            const httpsServerMatch = nginxConf.match(/(server\s*{[^}]*listen\s+443[^}]*)(})/);
            if (httpsServerMatch) {
                const beforeClosing = httpsServerMatch[1];
                const newServerBlock = beforeClosing + nginxV2rayLocationBlock + '\n    }';
                nginxConf = nginxConf.replace(httpsServerMatch[0], newServerBlock);
            } else {
                // Fallback: add to the end of first server block
                const lastBracketIndex = nginxConf.lastIndexOf('}');
                nginxConf = nginxConf.slice(0, lastBracketIndex) + nginxV2rayLocationBlock + nginxConf.slice(lastBracketIndex);
            }

            await runCommand(ssh2, server2.name, `echo '${nginxConf.replace(/'/g, "'\\''")}' > ${nginxConfPath}`);
            localLog({ type: 'success', message: `[${server2.name}] V2Ray location block added to Nginx config.` });


            localLog({ type: 'info', message: `[${server2.name}] Restarting services...` });
            await runCommand(ssh2, server2.name, 'systemctl enable v2ray && systemctl restart v2ray');
            await runCommand(ssh2, server2.name, 'nginx -t');
            await runCommand(ssh2, server2.name, 'systemctl restart nginx');
            localLog({ type: 'success', message: `[${server2.name}] V2Ray and Nginx configured and started.` });

            // Check if V2Ray is already installed on client
            const v2rayCheckS1 = await ssh1.execCommand('which v2ray');
            if (v2rayCheckS1.code !== 0) {
                localLog({ type: 'info', message: `[${server1.name}] Installing V2Ray...` });
                await runCommand(ssh1, server1.name, 'bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)');
            } else {
                localLog({ type: 'info', message: `[${server1.name}] V2Ray already installed.` });
            }
            
            localLog({ type: 'info', message: `[${server1.name}] Configuring V2Ray...` });
            const v2rayConfigS1 = `
{
  "inbounds": [{
    "port": 1080,
    "protocol": "socks",
    "settings": {
      "auth": "noauth"
    }
  }],
  "outbounds": [{
    "protocol": "vmess",
    "settings": {
      "vnext": [
        {
          "address": "${domain}",
          "port": 443,
          "users": [
            {
              "id": "${v2rayUUID}",
              "alterId": 0
            }
          ]
        }
      ]
    },
    "streamSettings": {
      "network": "ws",
      "security": "tls",
      "wsSettings": {
        "path": "${v2rayPath}"
      }
    }
  }]
}`;
            await runCommand(ssh1, server1.name, `echo '${v2rayConfigS1}' > /usr/local/etc/v2ray/config.json`);
            
            localLog({ type: 'info', message: `[${server1.name}] Restarting V2Ray...` });
            await runCommand(ssh1, server1.name, 'systemctl enable v2ray && systemctl restart v2ray');
            localLog({ type: 'success', message: `[${server1.name}] V2Ray client configured and started.` });

            localLog({ type: 'warning', message: `V2Ray setup complete. Use SOCKS5 proxy on ${server1.ipAddress}:1080 to route traffic through the tunnel.` });

            break;
        default:
            localLog({ type: 'error', message: `Tunnel type "${tunnelType}" is not yet implemented.` });
            throw new Error(`Tunnel type "${tunnelType}" is not yet implemented.`);
    }

    return { commandsS1, commandsS2, extraLogs };
}
