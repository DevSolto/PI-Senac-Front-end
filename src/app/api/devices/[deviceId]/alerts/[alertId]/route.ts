import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    deviceId: string;
    alertId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { deviceId, alertId } = params;

  const alert = {
    id: alertId,
    deviceId,
    type: 'temperature',
    severity: 'high',
    status: 'open',
    description: 'Temperatura excedeu o limite.',
    createdAt: new Date(Date.now() - 300 * 1000).toISOString(),
  };

  return NextResponse.json(alert, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { deviceId, alertId } = params;
  const payload = await request.json().catch(() => ({}));

  const updatedAlert = {
    id: alertId,
    deviceId,
    updatedAt: new Date().toISOString(),
    ...payload,
  };

  return NextResponse.json(updatedAlert, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
