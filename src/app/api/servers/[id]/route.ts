import {NextRequest, NextResponse} from 'next/server';
import { ObjectId } from 'mongodb';
import {withApiKey} from '../../auth';
import { getServersCollection } from '@/app/actions/db';
import { updateServer, deleteServer } from '@/app/actions/server-actions';
import { serverSchema } from '@/lib/schemas';


export const GET = withApiKey(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: 'Invalid Server ID' }), { status: 400 });
        }
        const serversCollection = await getServersCollection();
        const server = await serversCollection.findOne({ _id: new ObjectId(id) });

        if (!server) {
            return new Response(JSON.stringify({ error: 'Server not found' }), { status: 404 });
        }
        
        const { _id, ...s } = server;

        return NextResponse.json({ ...s, id: _id.toHexString() });
    } catch (error: any) {
        console.error(`API GET /servers/${params.id} failed:`, error);
        return new Response(JSON.stringify({ error: 'Failed to fetch server', details: error.message }), { status: 500 });
    }
});


export const PUT = withApiKey(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        const body = await req.json();

        const validatedFields = serverSchema.safeParse(body);

        if (!validatedFields.success) {
            return new Response(JSON.stringify({ errors: validatedFields.error.flatten().fieldErrors }), { status: 400 });
        }
        
        const formData = new FormData();
        Object.entries(validatedFields.data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        const result = await updateServer(formData, id);

        if (result?.errors) {
            return new Response(JSON.stringify({ errors: result.errors }), { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Server updated successfully' });

    } catch (error: any) {
        console.error(`API PUT /servers/${params.id} failed:`, error);
        return new Response(JSON.stringify({ error: 'Failed to update server', details: error.message }), { status: 500 });
    }
});

export const DELETE = withApiKey(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: 'Invalid Server ID' }), { status: 400 });
        }
        
        await deleteServer(id);
        
        return NextResponse.json({ success: true, message: 'Server deleted successfully' });
    } catch (error: any) {
        console.error(`API DELETE /servers/${params.id} failed:`, error);
        return new Response(JSON.stringify({ error: 'Failed to delete server', details: error.message }), { status: 500 });
    }
});
