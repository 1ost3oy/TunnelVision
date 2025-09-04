import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/ai/flows/chat-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await chatWithAI(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}