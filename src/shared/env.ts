export type AppEnv = Record<string, string | undefined>;

const resolveEnv = (): AppEnv => {
  const globalScope = globalThis as typeof globalThis & { __APP_ENV__?: AppEnv };

  const hasImportMetaEnv =
    typeof import.meta !== 'undefined' && typeof import.meta.env === 'object';
  if (hasImportMetaEnv) {
    const env = import.meta.env as AppEnv;
    globalScope.__APP_ENV__ = env;
    return env;
  }

  if (globalScope.__APP_ENV__) {
    return globalScope.__APP_ENV__;
  }

  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    const env = process.env as AppEnv;
    globalScope.__APP_ENV__ = env;
    return env;
  }

  globalScope.__APP_ENV__ = {};
  return globalScope.__APP_ENV__;
};

export const appEnv = resolveEnv();
