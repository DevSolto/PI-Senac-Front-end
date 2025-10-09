import { appConfig } from "../config";

export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, options: { status?: number; data?: unknown; cause?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.data = options.data;
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface RequestOptions<TBody = unknown> extends Omit<RequestInit, "body"> {
  /** Corpo serializado manualmente. Use `json` para serialização automática */
  body?: BodyInit | null;
  /** Objeto que será serializado como JSON */
  json?: TBody;
  /** Substitui o timeout padrão (ms) configurado nas variáveis de ambiente */
  timeoutMs?: number;
  /** Quando falso, evita o parse JSON automático da resposta */
  parseJson?: boolean;
}

export interface NormalizedResponse<TData = unknown> {
  data: TData;
  response: Response;
}

const buildAuthorizationHeader = (): string | undefined => {
  if (appConfig.apiJwt) {
    return `Bearer ${appConfig.apiJwt}`;
  }

  if (appConfig.apiKey) {
    return `ApiKey ${appConfig.apiKey}`;
  }

  return undefined;
};

const parseResponse = async <T>(response: Response, parseJson: boolean): Promise<T> => {
  if (!parseJson) {
    return (await response.text()) as T;
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

const normalizeError = async (response: Response): Promise<never> => {
  let data: unknown;

  try {
    data = await parseResponse(response, true);
  } catch (error) {
    data = await response.text();
  }

  const message =
    typeof data === "object" && data !== null && "message" in data
      ? String((data as Record<string, unknown>).message)
      : response.statusText || "Erro ao comunicar com a API";

  throw new ApiError(message, { status: response.status, data });
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, signal: AbortSignal): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    if (timeoutMs <= 0) {
      return;
    }

    const id = setTimeout(() => {
      if (!signal.aborted) {
        reject(new ApiError("Tempo limite da requisição excedido"));
      }
    }, timeoutMs);

    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
      },
      { once: true }
    );
  });

  return (await Promise.race([promise, timeoutPromise])) as T;
};

export const apiClient = {
  async request<TResponse = unknown, TBody = unknown>(path: string, options: RequestOptions<TBody> = {}): Promise<
    NormalizedResponse<TResponse>
  > {
    const { timeoutMs = appConfig.apiRequestTimeoutMs, json, parseJson = true, headers, body, ...rest } = options;

    const controller = new AbortController();
    const authorization = buildAuthorizationHeader();

    const requestHeaders = new Headers(headers);

    if (authorization) {
      requestHeaders.set("Authorization", authorization);
    }

    if (json !== undefined) {
      requestHeaders.set("Content-Type", "application/json");
    }

    const url = path.startsWith("http") ? path : `${appConfig.apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    const requestInit: RequestInit = {
      ...rest,
      body: json !== undefined ? JSON.stringify(json) : body,
      headers: requestHeaders,
      signal: controller.signal,
    };

    const fetchPromise = fetch(url, requestInit).then(async (response) => {
      if (!response.ok) {
        await normalizeError(response);
      }

      const data = await parseResponse<TResponse>(response, parseJson);
      return { data, response } satisfies NormalizedResponse<TResponse>;
    });

    try {
      return await withTimeout(fetchPromise, timeoutMs, controller.signal);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if ((error as Error).name === "AbortError") {
        throw new ApiError("Requisição cancelada", { cause: error });
      }

      throw new ApiError("Erro ao executar requisição", { cause: error });
    } finally {
      controller.abort();
    }
  },

  get<T = unknown>(path: string, options?: RequestOptions): Promise<NormalizedResponse<T>> {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  post<T = unknown, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions<TBody>): Promise<NormalizedResponse<T>> {
    return this.request<T, TBody>(path, { ...options, method: "POST", json: body });
  },

  put<T = unknown, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions<TBody>): Promise<NormalizedResponse<T>> {
    return this.request<T, TBody>(path, { ...options, method: "PUT", json: body });
  },

  patch<T = unknown, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions<TBody>): Promise<NormalizedResponse<T>> {
    return this.request<T, TBody>(path, { ...options, method: "PATCH", json: body });
  },

  delete<T = unknown>(path: string, options?: RequestOptions): Promise<NormalizedResponse<T>> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },
};
