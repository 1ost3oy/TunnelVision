import {NextRequest, NextResponse} from 'next/server';
import {withApiKey} from '../auth';
import {getServers, addServer} from '@/app/actions/server-actions';
import {serverSchema} from '@/lib/schemas';

export const GET = withApiKey(async (req: NextRequest) => {
  try {
    const servers = await getServers();
    const plainServers = servers.map(({ _id, ...s }) => ({ ...s, id: _id.toHexString() }));
    return NextResponse.json(plainServers);
  } catch (error) {
    console.error('API GET /servers failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch servers' }), { status: 500 });
  }
});

export const POST = withApiKey(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validatedFields = serverSchema.safeParse(body);

        if (!validatedFields.success) {
            return new Response(JSON.stringify({ errors: validatedFields.error.flatten().fieldErrors }), { status: 400 });
        }
        
        const formData = new FormData();
        Object.entries(validatedFields.data).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        const result = await addServer(formData);

        if (result?.errors) {
            return new Response(JSON.stringify({ errors: result.errors }), { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Server added successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('API POST /servers failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to add server', details: error.message }), { status: 500 });
    }
});
