'use server';

import clientPromise from '@/lib/mongodb';
import { Collection } from 'mongodb';
import type { Server, Tunnel } from '@/lib/types';


export async function getDb() {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'tunnel_vision_db';
    return client.db(dbName);
}

export async function getServersCollection(): Promise<Collection<Server>> {
    const db = await getDb();
    return db.collection<Server>('servers');
}

export async function getTunnelsCollection(): Promise<Collection<Tunnel>> {
    const db = await getDb();
    return db.collection<Tunnel>('tunnels');
}
