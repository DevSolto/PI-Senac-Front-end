import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    deviceId: string;
    alertId: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const { deviceId, alertId } = params;
  const payload = await request.json().catch(() => ({}));

  const resolvedAlert = {
    id: alertId,
    deviceId,
    resolvedAt: new Date().toISOString(),
    status: 'resolved',
    notes: payload.notes ?? null,
  };

  return NextResponse.json(resolvedAlert, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
