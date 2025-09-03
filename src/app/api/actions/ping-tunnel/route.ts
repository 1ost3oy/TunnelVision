import {NextRequest, NextResponse} from 'next/server';
import {withApiKey} from '../../auth';
import {pingTunnel} from '@/app/actions/tunnels/core';
import { getTunnelsCollection } from '@/app/actions/db';
import { z } from 'zod';
import { ObjectId } from 'mongodb';


const pingTunnelSchema = z.object({
    tunnelId: z.string().refine(id => ObjectId.isValid(id), { message: "Invalid Tunnel ID" }),
});


export const POST = withApiKey(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validation = pingTunnelSchema.safeParse(body);

        if (!validation.success) {
            return new Response(JSON.stringify({ errors: validation.error.flatten().fieldErrors }), { status: 400 });
        }

        const { tunnelId } = validation.data;
        
        const tunnelsCollection = await getTunnelsCollection();
        const tunnel = await tunnelsCollection.findOne({_id: new ObjectId(tunnelId)});

        if (!tunnel) {
            return new Response(JSON.stringify({ error: 'Tunnel not found' }), { status: 404 });
        }

        const result = await pingTunnel({...tunnel, id: tunnel._id.toHexString()});

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('API POST /actions/ping-tunnel failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to ping tunnel', details: error.message }), { status: 500 });
    }
});
