import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    deviceId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { deviceId } = params;

  const history = [
    {
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      status: 'online',
      message: 'Dispositivo iniciou operação.',
    },
    {
      timestamp: new Date(Date.now() - 1800 * 1000).toISOString(),
      status: 'warning',
      message: 'Temperatura acima do ideal.',
    },
    {
      timestamp: new Date(Date.now() - 600 * 1000).toISOString(),
      status: 'online',
      message: 'Temperatura normalizada.',
    },
  ];

  return NextResponse.json(
    {
      deviceId,
      events: history,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
