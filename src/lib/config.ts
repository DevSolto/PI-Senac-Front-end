const getEnvVar = (key: string, { required = false }: { required?: boolean } = {}) => {
  const value = process.env[key];

  if (required && (value === undefined || value === "")) {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }

  return value;
};

//const apiBaseUrl = getEnvVar("NEXT_PUBLIC_API_BASE_URL", { required: true });
//const apiSseUrl = getEnvVar("NEXT_PUBLIC_API_SSE_URL");
const apiKey = getEnvVar("NEXT_PUBLIC_API_KEY");
const apiJwt = getEnvVar("NEXT_PUBLIC_API_JWT");

const apiBaseUrl = 'http://localhost:3000/'
const apiSseUrl = 'http://localhost:3000/events'

const defaultTimeout = Number(getEnvVar("NEXT_PUBLIC_API_TIMEOUT_MS")) || 10000;

export const appConfig = {
  apiBaseUrl,
  apiSseUrl,
  apiKey,
  apiJwt,
  apiRequestTimeoutMs: defaultTimeout,
} as const;

export type AppConfig = typeof appConfig;
