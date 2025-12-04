import { act, render, screen, waitFor } from '@testing-library/react';

import { clearAuthToken, setAuthToken } from '@/shared/http';

import { RealtimeSensorChart } from './RealtimeSensorChart';

describe('RealtimeSensorChart', () => {
  class MockEventSource implements EventSource {
    static instances: MockEventSource[] = [];
    url: string;
    withCredentials = false;
    readyState = 0;
    onopen: ((this: EventSource, ev: Event) => unknown) | null = null;
    onmessage: ((this: EventSource, ev: MessageEvent<unknown>) => unknown) | null = null;
    onerror: ((this: EventSource, ev: Event) => unknown) | null = null;
    close = jest.fn();
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = () => true;

    constructor(url: string) {
      this.url = url;
      MockEventSource.instances.push(this);
    }

    emitOpen() {
      this.onopen?.(new Event('open'));
    }

    emitMessage(data: unknown) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.onmessage?.({ data: payload } as MessageEvent);
    }

    emitError() {
      this.onerror?.(new Event('error'));
    }
  }

  const fetchMock = jest.fn();
  const token = 'token-de-teste';

  beforeEach(() => {
    (global as unknown as { EventSource: typeof EventSource }).EventSource = MockEventSource as unknown as typeof EventSource;
    (global as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
    MockEventSource.instances = [];
    fetchMock.mockReset();
    setAuthToken(token);
  });

  afterEach(() => {
    clearAuthToken();
    jest.clearAllMocks();
  });

  it('carrega o histórico inicial e exibe status', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 2,
        historyUrl: 'http://api.example.com/api/devices/device-123/history',
        payload: [
          { timestamp: 1764872209, value: { temperature: 31.3, humidity: 67 } },
          { timestamp: 1764872214, value: { temperature: 31.4, humidity: 68 } },
        ],
      }),
    });

    render(
      <RealtimeSensorChart deviceId="device-123" apiBaseUrl="http://api.example.com" maxPoints={10} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Histórico carregado/i)).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        `http://api.example.com/api/devices/device-123/history?token=${token}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText('31.4°C')[0]).toBeInTheDocument();
      expect(screen.getAllByText('68%')[0]).toBeInTheDocument();
    });
  });

  it('processa eventos SSE e atualiza a leitura mais recente', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    render(
      <RealtimeSensorChart deviceId="abc" apiBaseUrl="http://localhost:3000" maxPoints={2} />,
    );

    const source = await waitFor(() => MockEventSource.instances[0]);
    expect(source.url).toBe(`http://localhost:3000/api/devices/abc/updates?token=${token}`);
    await act(async () => {
      source.emitOpen();
      source.emitMessage({ timestamp: 1764872209, value: { temperature: 25.7, humidity: 61 } });
    });

    await waitFor(() => {
      expect(screen.getAllByText('25.7°C')[0]).toBeInTheDocument();
      expect(screen.getAllByText('61%')[0]).toBeInTheDocument();
      expect(screen.getByText(/Transmitindo em tempo real/i)).toBeInTheDocument();
    });
  });

  it('aceita eventos SSE com payload aninhado e mantém atualizações', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    render(
      <RealtimeSensorChart deviceId="nested" apiBaseUrl="http://localhost:3000" maxPoints={3} />,
    );

    const source = await waitFor(() => MockEventSource.instances[0]);

    await act(async () => {
      source.emitOpen();
      source.emitMessage({ payload: { timestamp: 1764872234, value: { temperature: 26.1, humidity: 59 } } });
      source.emitMessage({
        payload: { timestamp: 1764872239, value: { temperature: 26.2, humidity: 60 } },
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText('26.2°C')[0]).toBeInTheDocument();
      expect(screen.getAllByText('60%')[0]).toBeInTheDocument();
      expect(screen.getByText(/Transmitindo em tempo real/i)).toBeInTheDocument();
    });
  });
});
