import { NextRequest, NextResponse } from 'next/server';
import { analyzeCompetitorUpdate } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  try {
    const { diffText } = await request.json();

    if (!diffText) {
      return NextResponse.json(
        { error: 'diffText required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompetitorUpdate(diffText);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
