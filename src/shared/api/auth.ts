import { apiClient } from '../http';
import type {
  EnableMfaPayload,
  EnableMfaResponse,
  LoginPayload,
  LoginResponse,
  ResetMfaPayload,
  ResetMfaResponse,
} from './auth.types';
import type { User } from './users.types';

const LOGIN_ENDPOINT = '/auth/login';
const ENABLE_MFA_ENDPOINT = '/auth/mfa/enable';
const RESET_MFA_ENDPOINT = '/auth/mfa/reset';
const CURRENT_USER_ENDPOINT = '/auth/me';

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload);
}

export function enableMfa(payload: EnableMfaPayload): Promise<EnableMfaResponse> {
  return apiClient.post<EnableMfaResponse>(ENABLE_MFA_ENDPOINT, payload);
}

export function resetMfa(payload: ResetMfaPayload): Promise<ResetMfaResponse> {
  return apiClient.post<ResetMfaResponse>(RESET_MFA_ENDPOINT, payload);
}

export function getCurrentUser(): Promise<User> {
  return apiClient.json<User>({
    path: CURRENT_USER_ENDPOINT,
  });
}
