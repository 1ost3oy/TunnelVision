import { NodeSSH } from "node-ssh";
import type { Server } from '@/lib/types';
import { getSettings, updateSettings } from "../settings-actions";

export class SshManager {
    private ssh: NodeSSH;
    private static instances = new Map<string, SshManager>();

    private constructor(private server: Server) {
        this.ssh = new NodeSSH();
    }

    public static async getInstance(server: Server): Promise<SshManager> {
        const key = `${server.username}@${server.ipAddress}:${server.sshPort || 22}`;
        if (!SshManager.instances.has(key)) {
            const instance = new SshManager(server);
            await instance.connect();
            SshManager.instances.set(key, instance);
        }
        return SshManager.instances.get(key)!;
    }

    private async connect(): Promise<void> {
        const { ipAddress, sshPort, username } = this.server;
        console.log(`Connecting to ${username}@${ipAddress}:${sshPort || 22}`);

        const settings = await getSettings();
        const storedKey = (settings as any).sshKeys?.[this.server.id];

        if (storedKey) {
            try {
                await this.ssh.connect({
                    host: ipAddress,
                    port: sshPort || 22,
                    username,
                    privateKey: storedKey,
                });
                console.log("SSH connection successful with stored key");
                return;
            } catch (error) {
                console.error("Failed to connect with stored key, falling back to password", error);
            }
        }

        if (this.server.password) {
            try {
                await this.ssh.connect({
                    host: ipAddress,
                    port: sshPort || 22,
                    username,
                    password: this.server.password,
                });
                console.log("SSH connection successful with password");
                await this.generateAndStoreSshKey();
                return;
            } catch (error) {
                console.error("Failed to connect with password", error);
                throw new Error("SSH connection failed with both stored key and password");
            }
        }

        throw new Error("No password or stored key available for SSH connection");
    }

    private async generateAndStoreSshKey(): Promise<void> {
        try {
            // Generate SSH key pair using ssh-keygen command
            const keyGenResult = await this.ssh.execCommand('ssh-keygen -t rsa -b 2048 -f ~/.ssh/temp_key -N ""');
            const privateKeyResult = await this.ssh.execCommand('cat ~/.ssh/temp_key');
            const publicKeyResult = await this.ssh.execCommand('cat ~/.ssh/temp_key.pub');
            
            if (privateKeyResult.code === 0 && publicKeyResult.code === 0) {
                await this.ssh.execCommand(`echo "${publicKeyResult.stdout}" >> ~/.ssh/authorized_keys`);
                await this.ssh.execCommand('rm ~/.ssh/temp_key ~/.ssh/temp_key.pub');
                
                const settings = await getSettings();
                const currentSshKeys = (settings as any).sshKeys || {};
                const updatedSettings = {
                    ...settings,
                    sshKeys: {
                        ...currentSshKeys,
                        [this.server.id]: privateKeyResult.stdout
                    }
                };
                await updateSettings(updatedSettings as any);
                console.log("New SSH key pair generated and stored successfully");
            }
        } catch (error) {
            console.error("Failed to generate and store SSH key pair", error);
        }
    }

    public async executeCommand(command: string): Promise<string> {
        console.log(`Executing command: ${command}`);
        const result = await this.ssh.execCommand(command);
        if (result.stderr) {
            console.error(`Command execution error: ${result.stderr}`);
            throw new Error(result.stderr);
        }
        return result.stdout;
    }

    public dispose(): void {
        this.ssh.dispose();
        const key = `${this.server.username}@${this.server.ipAddress}:${this.server.sshPort || 22}`;
        SshManager.instances.delete(key);
        console.log("SSH connection disposed");
    }
}
