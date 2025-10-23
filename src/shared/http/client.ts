const ENV_API_URL = (
  import.meta.env.VITE_API_URL ?? import.meta.env.API_URL ?? 'http://localhost:3000'
) as string;

const AUTH_HEADER_KEY = 'Authorization';

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface JsonRequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

export type JsonMethodOptions = Omit<JsonRequestOptions, 'method' | 'path' | 'body'>;

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: unknown;

  constructor(message: string, status: number, statusText: string, data: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

let authToken: string | null = null;
const responseInterceptors: ResponseInterceptor[] = [];

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!ENV_API_URL) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  const base = ensureTrailingSlash(ENV_API_URL);
  return new URL(path, base).toString();
}

function buildHeaders(initHeaders?: HeadersInit): Headers {
  const headers = new Headers(initHeaders ?? {});

  if (authToken) {
    headers.set(AUTH_HEADER_KEY, `Bearer ${authToken}`);
  }

  return headers;
}

async function applyResponseInterceptors(response: Response): Promise<Response> {
  let currentResponse = response;

  for (const interceptor of responseInterceptors) {
    const nextResponse = await interceptor(currentResponse);
    if (nextResponse instanceof Response) {
      currentResponse = nextResponse;
    }
  }

  return currentResponse;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  try {
    if (isJson) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.warn('[apiClient] Failed to parse response body', error);
    return undefined;
  }
}

function extractErrorMessage(data: unknown, statusText: string): string {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }

  if (data && typeof data === 'object') {
    const maybeMessage = (data as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
  }

  return statusText || 'Ocorreu um erro ao processar a requisição.';
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(init.headers);
  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  const response = await fetch(buildUrl(path), requestInit);
  const processedResponse = await applyResponseInterceptors(response);
  const data = await parseResponseBody(processedResponse);

  if (!processedResponse.ok) {
    const message = extractErrorMessage(data, processedResponse.statusText);
    throw new HttpError(message, processedResponse.status, processedResponse.statusText, data);
  }

  return data as T;
}

async function jsonRequest<T = unknown>({
  method = 'GET',
  path,
  body,
  signal,
  headers,
}: JsonRequestOptions): Promise<T> {
  const normalizedHeaders = new Headers(headers ?? {});
  normalizedHeaders.set('Accept', 'application/json');

  const shouldSendBody =
    body !== undefined && !['GET', 'HEAD'].includes(method.toUpperCase());

  if (shouldSendBody && !normalizedHeaders.has('Content-Type')) {
    normalizedHeaders.set('Content-Type', 'application/json');
  }

  const requestInit: RequestInit = {
    method,
    signal,
    headers: normalizedHeaders,
    body: shouldSendBody ? JSON.stringify(body) : undefined,
  };

  return request<T>(path, requestInit);
}

async function post<T = unknown>(
  path: string,
  body?: unknown,
  options: JsonMethodOptions = {},
): Promise<T> {
  return jsonRequest<T>({
    method: 'POST',
    path,
    body,
    ...options,
  });
}

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearAuthToken(): void {
  authToken = null;
}

export function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);

  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index >= 0) {
      responseInterceptors.splice(index, 1);
    }
  };
}

export const apiClient = {
  request,
  json: jsonRequest,
  post,
  addResponseInterceptor,
};
