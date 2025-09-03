import {NextRequest, NextResponse} from 'next/server';
import {withApiKey} from '../../auth';
import {pingServer} from '@/app/actions/server-actions';
import { z } from 'zod';


const pingServerSchema = z.object({
    ipAddress: z.string().ip({ version: 'v4', message: "Invalid IP address" }),
});


export const POST = withApiKey(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const validation = pingServerSchema.safeParse(body);

        if (!validation.success) {
            return new Response(JSON.stringify({ errors: validation.error.flatten().fieldErrors }), { status: 400 });
        }

        const { ipAddress } = validation.data;
        const result = await pingServer(ipAddress);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('API POST /actions/ping-server failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to ping server', details: error.message }), { status: 500 });
    }
});
