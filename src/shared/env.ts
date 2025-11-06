export type AppEnv = Record<string, string | undefined>;

const resolveEnv = (): AppEnv => {
  const globalScope = globalThis as typeof globalThis & { __APP_ENV__?: AppEnv };

  if (globalScope.__APP_ENV__) {
    return globalScope.__APP_ENV__;
  }

  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    return process.env as AppEnv;
  }

  return {};
};

export const appEnv = resolveEnv();
