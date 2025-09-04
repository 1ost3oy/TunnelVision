import { NextRequest, NextResponse } from 'next/server';
import { analyzeSystem } from '@/ai/flows/system-analysis-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await analyzeSystem(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze system' },
      { status: 500 }
    );
  }
}