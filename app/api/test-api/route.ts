import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'API test successful',
      timestamp: new Date().toISOString(),
      server: 'Next.js API',
      status: 'OK'
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
