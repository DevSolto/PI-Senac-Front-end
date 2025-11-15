import '@testing-library/jest-dom';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { loadEnv } = require('./load-env');

loadEnv({ mode: process.env.NODE_ENV });

const env = process.env as Record<string, string | undefined>;
const fallbackApiUrl = env.VITE_API_URL ?? env.API_URL ?? 'http://localhost:3000';

(globalThis as typeof globalThis & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ = {
  ...env,
  VITE_API_URL: env.VITE_API_URL ?? fallbackApiUrl,
  API_URL: env.API_URL ?? fallbackApiUrl,
};

global.ResizeObserver = class ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback([
      {
        target,
        contentRect: {
          width: 800,
          height: 600,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 800,
          bottom: 600,
        },
      } as ResizeObserverEntry,
    ], this);
  }

  unobserve() {
    // no-op
  }

  disconnect() {
    // no-op
  }
} as typeof ResizeObserver;

if (!('matchMedia' in window)) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

if (!SVGElement.prototype.getBBox) {
  SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
  });
}

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = () => null;
}
