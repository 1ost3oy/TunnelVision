'use server';

import { NodeSSH } from 'node-ssh';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

import type { Server, LogEntry } from '@/lib/types';
import { getServersCollection } from './db';

const SSH_KEY_PATH = path.join(process.cwd(), 'ssh_keys.json');

interface SshKeys {
    privateKey: string;
    publicKey: string;
}

async function generateSshKeyPair(): Promise<SshKeys> {
    try {
        const keyPath = `/tmp/tunnelvision_key_${Date.now()}`;
        
        // Generate SSH key pair
        execSync(`ssh-keygen -t rsa -b 2048 -f ${keyPath} -N ""`, { stdio: 'pipe' });
        
        const privateKey = await fs.readFile(keyPath, 'utf-8');
        const publicKey = await fs.readFile(`${keyPath}.pub`, 'utf-8');
        
        // Clean up temporary files
        await fs.unlink(keyPath).catch(() => {});
        await fs.unlink(`${keyPath}.pub`).catch(() => {});
        
        return { privateKey, publicKey };
    } catch (error) {
        // Fallback: generate using Node.js crypto
        const { generateKeyPairSync } = crypto;
        const { privateKey, publicKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            publicKeyEncoding: { type: 'spki', format: 'pem' }
        });
        
        // Convert to SSH format
        const sshPublicKey = `ssh-rsa ${Buffer.from(publicKey).toString('base64')} tunnelvision@auto-generated`;
        
        return {
            privateKey,
            publicKey: sshPublicKey
        };
    }
}

export async function getSshKeys(): Promise<SshKeys> {
    try {
        const data = await fs.readFile(SSH_KEY_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log("SSH key file not found, generating new key pair...");
            const newKeys = await generateSshKeyPair();
            await fs.writeFile(SSH_KEY_PATH, JSON.stringify(newKeys, null, 2));
            console.log("New SSH key pair generated and saved.");
            return newKeys;
        }
        throw error;
    }
}

export async function connectWithKeyManagement(server: Server, log?: (entry: LogEntry) => void): Promise<NodeSSH> {
    const ssh = new NodeSSH();
    const keys = await getSshKeys();
    let connectionOptions: any = {
        host: server.ipAddress,
        port: server.sshPort || 22,
        username: server.username,
        readyTimeout: 60000,
    };

    const connectAndSetup = async (options: any, needsKeySetup: boolean = false) => {
        await ssh.connect(options);
        log?.({ type: 'success', message: `Successfully connected to server ${server.name}.` });

        if (needsKeySetup) {
            log?.({ type: 'info', message: 'Setting up SSH key authentication for future connections...' });
            try {
                const authorizedKeysPath = `~/.ssh/authorized_keys`;
                await ssh.execCommand(`mkdir -p ~/.ssh && chmod 700 ~/.ssh`);
                const tempKeyFile = `/tmp/pubkey_${crypto.randomBytes(8).toString('hex')}`;
                await ssh.execCommand(`echo '${keys.publicKey}' > ${tempKeyFile}`);
                await ssh.execCommand(`cat ${tempKeyFile} >> ${authorizedKeysPath} && rm ${tempKeyFile} && chmod 600 ${authorizedKeysPath}`);
                log?.({ type: 'success', message: 'SSH public key added to authorized_keys.' });

                const serversCollection = await getServersCollection();
                await serversCollection.updateOne(
                    { _id: new ObjectId(server.id) },
                    { $set: { sshKeyConfigured: true } }
                );
                server.sshKeyConfigured = true;

            } catch (setupError: any) {
                 log?.({ type: 'warning', message: `Failed to set up SSH key automatically: ${setupError.message}` });
            }
        }
    };
    
    if (server.sshKeyConfigured) {
        try {
            log?.({ type: 'info', message: `Attempting key-based authentication for ${server.name}...` });
            connectionOptions.privateKey = keys.privateKey;
            await connectAndSetup(connectionOptions);
            return ssh;
        } catch (keyError: any) {
             log?.({ type: 'warning', message: `Key-based authentication failed for ${server.name}. Falling back to other methods.` });
            if(ssh.isConnected()) ssh.dispose();
        }
    }

    if (server.sshKey) {
        try {
            log?.({ type: 'info', message: `Attempting connection with server-specific SSH key for ${server.name}...` });
            connectionOptions.privateKey = server.sshKey;
            await connectAndSetup(connectionOptions, true);
            return ssh;
        } catch (specificKeyError: any) {
             log?.({ type: 'warning', message: `Server-specific key authentication failed for ${server.name}. Falling back to password.` });
             if(ssh.isConnected()) ssh.dispose();
        }
    }

    if (server.password) {
        try {
            log?.({ type: 'info', message: `Attempting password authentication for ${server.name}...` });
            connectionOptions.privateKey = undefined;
            connectionOptions.password = server.password;
            await connectAndSetup(connectionOptions, true);
            return ssh;
        } catch (passwordError: any) {
             log?.({ type: 'error', message: `Password authentication failed for ${server.name}: ${passwordError.message}` });
             if(ssh.isConnected()) ssh.dispose();
            throw passwordError;
        }
    }
    
     try {
        log?.({ type: 'info', message: `Final attempt: Trying shared key authentication for ${server.name}...` });
        connectionOptions = {
            host: server.ipAddress,
            port: server.sshPort || 22,
            username: server.username,
            readyTimeout: 60000,
            privateKey: keys.privateKey,
        };
        await connectAndSetup(connectionOptions);
        return ssh;
    } catch (finalKeyError: any) {
         log?.({ type: 'error', message: `All authentication methods have failed for ${server.name}. Please check credentials and server SSH configuration.` });
         if(ssh.isConnected()) ssh.dispose();
        throw finalKeyError;
    }
}