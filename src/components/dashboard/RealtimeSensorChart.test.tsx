import { act, render, screen, waitFor } from '@testing-library/react';

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

  beforeEach(() => {
    (global as unknown as { EventSource: typeof EventSource }).EventSource = MockEventSource as unknown as typeof EventSource;
    (global as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
    MockEventSource.instances = [];
    fetchMock.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('carrega o histórico inicial e exibe status', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { timestamp: '2024-02-01T10:00:00Z', temperature: 21.5, humidity: 55 },
        { timestamp: '2024-02-01T10:05:00Z', temperature: 22, humidity: 56 },
      ],
    });

    render(
      <RealtimeSensorChart deviceId="device-123" apiBaseUrl="http://api.example.com" maxPoints={10} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Histórico carregado/i)).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith('http://api.example.com/devices/device-123/history');
    });

    expect(screen.getByText('22.0°C')).toBeInTheDocument();
    expect(screen.getByText('56%')).toBeInTheDocument();
  });

  it('processa eventos SSE e atualiza a leitura mais recente', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    render(
      <RealtimeSensorChart deviceId="abc" apiBaseUrl="http://localhost:3000" maxPoints={2} />,
    );

    const source = await waitFor(() => MockEventSource.instances[0]);
    await act(async () => {
      source.emitOpen();
      source.emitMessage({ timestamp: '2024-03-01T12:00:00Z', temperature: 25.7, humidity: 61 });
    });

    await waitFor(() => {
      expect(screen.getAllByText('25.7°C')[0]).toBeInTheDocument();
      expect(screen.getAllByText('61%')[0]).toBeInTheDocument();
      expect(screen.getByText(/Transmitindo em tempo real/i)).toBeInTheDocument();
    });
  });
});
