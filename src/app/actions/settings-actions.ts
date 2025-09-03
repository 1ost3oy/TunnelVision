
'use server';

import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

import { getServers } from './server-actions';
import { getTunnels } from './tunnels/core';
import { getServersCollection, getTunnelsCollection } from './db';

const envFilePath = path.resolve(process.cwd(), '.env');

async function readEnvFile(): Promise<Map<string, string>> {
    try {
        const content = await fs.readFile(envFilePath, 'utf-8');
        const map = new Map<string, string>();
        content.split('\n').forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key) {
                    map.set(key.trim(), valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
                }
            }
        });
        return map;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return new Map<string, string>();
        }
        throw error;
    }
}

async function writeEnvFile(envMap: Map<string, string>): Promise<void> {
    const content = Array.from(envMap.entries())
        .map(([key, value]) => `${key}="${value}"`)
        .join('\n');
    await fs.writeFile(envFilePath, content + '\n', 'utf-8');
}


export async function getSettings(): Promise<{ [key: string]: string }> {
    const envMap = await readEnvFile();
    return {
        mongodbUri: envMap.get('MONGODB_URI') || '',
        apiKey: envMap.get('API_SECRET_KEY') || '',
        geminiApiKey: envMap.get('GEMINI_API_KEY') || '',
    };
}


export async function updateSettings(settings: { 
    mongodbUri: string; 
    apiKey: string; 
    geminiApiKey: string 
}): Promise<{ success: boolean; message?: string }> {
    if (!settings.apiKey || settings.apiKey.length < 16) {
        return { success: false, message: 'API Key must be at least 16 characters long.' };
    }
     if (!settings.mongodbUri) {
        return { success: false, message: 'MongoDB URI cannot be empty.' };
    }
    
    try {
        const envMap = await readEnvFile();
        envMap.set('MONGODB_URI', settings.mongodbUri);
        envMap.set('API_SECRET_KEY', settings.apiKey);
        envMap.set('GEMINI_API_KEY', settings.geminiApiKey);
        await writeEnvFile(envMap);
        
        // This is a server-side environment variable, so we update the running process
        process.env.MONGODB_URI = settings.mongodbUri;
        process.env.API_SECRET_KEY = settings.apiKey;
        process.env.GEMINI_API_KEY = settings.geminiApiKey;
        
        revalidatePath('/'); // Revalidate to reflect changes if needed anywhere
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update settings:', error);
        return { success: false, message: 'Failed to write to the environment file.' };
    }
}


export async function exportSettings(): Promise<string> {
    const servers = await getServers();
    const tunnels = await getTunnels();
    const exportedServers = servers.map(({ _id, ...s }) => ({...s, id: _id.toHexString()}));
    const exportedTunnels = tunnels.map(({ _id, ...t }) => ({...t, id: _id.toHexString()}));
    return JSON.stringify({ servers: exportedServers, tunnels: exportedTunnels }, null, 2);
}

export async function importSettings(jsonContent: string): Promise<{ success: boolean; message?: string }> {
  try {
    const data = JSON.parse(jsonContent);

    if (!data || typeof data !== 'object' || !('servers' in data) || !('tunnels' in data) || !Array.isArray(data.servers) || !Array.isArray(data.tunnels)) {
      throw new Error('Invalid JSON structure. The file must contain "servers" and "tunnels" arrays.');
    }
    
    const serversCollection = await getServersCollection();
    const tunnelsCollection = await getTunnelsCollection();

    await serversCollection.deleteMany({});
    await tunnelsCollection.deleteMany({});

    if (data.servers.length > 0) {
        const serversToInsert = data.servers.map(({ id, ...s }: any) => ({
            ...s,
            _id: ObjectId.isValid(id) ? new ObjectId(id) : new ObjectId(),
        }));
        await serversCollection.insertMany(serversToInsert);
    }
    if (data.tunnels.length > 0) {
        const tunnelsToInsert = data.tunnels.map(({ id, ...t }: any) => ({
            ...t,
            _id: ObjectId.isValid(id) ? new ObjectId(id) : new ObjectId(),
        }));
        await tunnelsCollection.insertMany(tunnelsToInsert);
    }

    revalidatePath('/');
    return { success: true };

  } catch (e: any) {
    let message = 'An unexpected error occurred during import.';
    if (e instanceof SyntaxError) {
        message = 'The provided file is not valid JSON.';
    } else if (e instanceof Error) {
        message = e.message;
    }
    return { success: false, message };
  }
}
