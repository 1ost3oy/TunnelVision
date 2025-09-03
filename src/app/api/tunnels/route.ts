import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import { ObjectId } from 'mongodb';
import {withApiKey} from '../auth';
import {getTunnels} from '@/app/actions/tunnels/core';
import {createTunnel} from '@/app/actions/tunnels/creation';
import {getServersCollection} from '@/app/actions/db';
import { tunnelTypes } from '@/lib/types';


export const GET = withApiKey(async (req: NextRequest) => {
  try {
    const tunnels = await getTunnels();
    const plainTunnels = tunnels.map(({ _id, ...t }) => ({ ...t, id: _id.toHexString() }));
    return NextResponse.json(plainTunnels);
  } catch (error) {
    console.error('API GET /tunnels failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tunnels' }), { status: 500 });
  }
});


const createTunnelSchema = z.object({
    server1Id: z.string().refine(id => ObjectId.isValid(id), { message: "Invalid Server 1 ID" }),
    server2Id: z.string().refine(id => ObjectId.isValid(id), { message: "Invalid Server 2 ID" }),
    tunnelType: z.enum(tunnelTypes),
    domain: z.string().optional(),
});


export const POST = withApiKey(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validation = createTunnelSchema.safeParse(body);

        if (!validation.success) {
            return new Response(JSON.stringify({ errors: validation.error.flatten().fieldErrors }), { status: 400 });
        }
        
        const { server1Id, server2Id, tunnelType, domain } = validation.data;

        const serversCollection = await getServersCollection();
        const server1 = await serversCollection.findOne({ _id: new ObjectId(server1Id) });
        const server2 = await serversCollection.findOne({ _id: new ObjectId(server2Id) });

        if (!server1 || !server2) {
            return new Response(JSON.stringify({ error: 'One or both servers not found' }), { status: 404 });
        }
        
        const { _id: s1_id, ...s1_rest} = server1;
        const { _id: s2_id, ...s2_rest} = server2;

        const result = await createTunnel(
            {...s1_rest, id: s1_id.toHexString(), _id: s1_id },
            {...s2_rest, id: s2_id.toHexString(), _id: s2_id },
            tunnelType,
            domain
        );

        return NextResponse.json(result, { status: result.success ? 201 : 500 });

    } catch (error: any) {
        console.error('API POST /tunnels failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to create tunnel', details: error.message }), { status: 500 });
    }
});
