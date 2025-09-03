import {NextRequest} from 'next/server';

export function withApiKey(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    const authHeader = req.headers.get('Authorization');
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiKey || apiKey === "change-me-to-a-secure-secret-key") {
      console.error('API_SECRET_KEY is not set or is using the default insecure value in the environment variables.');
      return new Response(JSON.stringify({ error: 'Server configuration error. API key is not properly configured.' }), { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    return handler(req, ...args);
  };
}
