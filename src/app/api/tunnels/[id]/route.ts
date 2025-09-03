import {NextRequest, NextResponse} from 'next/server';
import { ObjectId } from 'mongodb';
import {withApiKey} from '../../auth';
import { getTunnelsCollection } from '@/app/actions/db';
import { deleteTunnel, saveTunnelConfig } from '@/app/actions';


export const GET = withApiKey(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: 'Invalid Tunnel ID' }), { status: 400 });
        }
        const tunnelsCollection = await getTunnelsCollection();
        const tunnel = await tunnelsCollection.findOne({ _id: new ObjectId(id) });

        if (!tunnel) {
            return new Response(JSON.stringify({ error: 'Tunnel not found' }), { status: 404 });
        }
        
        const { _id, ...t } = tunnel;

        return NextResponse.json({ ...t, id: _id.toHexString() });
    } catch (error: any) {
        console.error(`API GET /tunnels/${params.id} failed:`, error);
        return new Response(JSON.stringify({ error: 'Failed to fetch tunnel', details: error.message }), { status: 500 });
    }
});

export const DELETE = withApiKey(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: 'Invalid Tunnel ID' }), { status: 400 });
        }
        
        await deleteTunnel(id);
        
        return NextResponse.json({ success: true, message: 'Tunnel deleted successfully' });
    } catch (error: any) {
        console.error(`API DELETE /tunnels/${params.id} failed:`, error);
        return new Response(JSON.stringify({ error: 'Failed to delete tunnel', details: error.message }), { status: 500 });
    }
});

export const POST = withApiKey(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        const { action } = await req.json();

        if (action !== 'save') {
            return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
        }
        
        if (!ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: 'Invalid Tunnel ID' }), { status: 400 });
        }

        const tunnelsCollection = await getTunnelsCollection();
        const tunnel = await tunnelsCollection.findOne({ _id: new ObjectId(id) });

        if (!tunnel) {
            return new Response(JSON.stringify({ error: 'Tunnel not found' }), { status: 404 });
        }
        
        const result = await saveTunnelConfig({...tunnel, id: tunnel._id.toHexString()});

        return NextResponse.json(result);

    } catch (error: any) {
        console.error(`API POST /tunnels/${params.id} failed:`, error);
        return new Response(JSON.stringify({ error: 'Failed to save tunnel config', details: error.message }), { status: 500 });
    }
});
