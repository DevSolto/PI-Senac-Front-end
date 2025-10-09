import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    deviceId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { deviceId } = params;

  const alerts = [
    {
      id: 'alert-1',
      deviceId,
      type: 'temperature',
      severity: 'high',
      createdAt: new Date(Date.now() - 300 * 1000).toISOString(),
      status: 'open',
    },
    {
      id: 'alert-2',
      deviceId,
      type: 'battery',
      severity: 'medium',
      createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
      status: 'acknowledged',
    },
  ];

  return NextResponse.json(
    {
      deviceId,
      alerts,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function POST(request: Request, { params }: RouteParams) {
  const { deviceId } = params;
  const payload = await request.json().catch(() => ({}));

  const newAlert = {
    id: `alert-${Date.now()}`,
    deviceId,
    createdAt: new Date().toISOString(),
    status: 'open',
    ...payload,
  };

  return NextResponse.json(newAlert, {
    status: 201,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
