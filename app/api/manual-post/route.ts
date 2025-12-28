import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Call the cron endpoint internally
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const cronSecret = process.env.CRON_SECRET;

    const response = await fetch(`${baseUrl}/api/cron`, {
      method: 'GET',
      headers: cronSecret ? {
        'Authorization': `Bearer ${cronSecret}`
      } : {},
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to trigger post',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
