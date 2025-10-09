import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    deviceId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { deviceId } = params;

  const overview = {
    deviceId,
    status: 'online',
    metrics: {
      temperature: 22.5,
      humidity: 45,
      lastUpdated: new Date().toISOString(),
    },
  };

  return NextResponse.json(overview, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
