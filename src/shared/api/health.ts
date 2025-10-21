import { apiClient, HttpError } from '../http';

const HEALTH_ENDPOINT = '/';
const DEFAULT_ERROR_MESSAGE =
  'Não foi possível verificar a saúde da aplicação. Tente novamente mais tarde.';

export class HealthApiError extends Error {
  constructor(message: string = DEFAULT_ERROR_MESSAGE, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HealthApiError';
  }
}

export async function getHealth(): Promise<string> {
  try {
    const response = await apiClient.request<string>(HEALTH_ENDPOINT);

    if (typeof response !== 'string' || response.trim().length === 0) {
      throw new HealthApiError('Resposta inesperada ao consultar a saúde da aplicação.');
    }

    return response;
  } catch (error) {
    if (error instanceof HealthApiError) {
      throw error;
    }

    if (error instanceof HttpError) {
      const message =
        error.status >= 500
          ? 'O serviço de saúde está indisponível no momento. Tente novamente em instantes.'
          : 'Não foi possível confirmar a saúde da aplicação. Verifique os dados e tente novamente.';

      throw new HealthApiError(message, { cause: error });
    }

    if (error instanceof Error) {
      throw new HealthApiError(DEFAULT_ERROR_MESSAGE, { cause: error });
    }

    throw new HealthApiError(DEFAULT_ERROR_MESSAGE);
  }
}
