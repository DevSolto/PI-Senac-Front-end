export type AppEnv = Record<string, string | undefined>;

const globalEnv = (globalThis as typeof globalThis & {
  __APP_ENV__?: AppEnv;
}).__APP_ENV__;

export const appEnv: AppEnv = globalEnv ?? {};
