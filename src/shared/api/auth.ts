import { apiClient } from '../http';
import type {
  EnableMfaPayload,
  EnableMfaResponse,
  LoginPayload,
  LoginResponse,
  ResetMfaPayload,
  ResetMfaResponse,
} from './auth.types';

const LOGIN_ENDPOINT = '/auth/login';
const ENABLE_MFA_ENDPOINT = '/auth/mfa/enable';
const RESET_MFA_ENDPOINT = '/auth/mfa/reset';

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload);
}

export function enableMfa(payload: EnableMfaPayload): Promise<EnableMfaResponse> {
  return apiClient.post<EnableMfaResponse>(ENABLE_MFA_ENDPOINT, payload);
}

export function resetMfa(payload: ResetMfaPayload): Promise<ResetMfaResponse> {
  return apiClient.post<ResetMfaResponse>(RESET_MFA_ENDPOINT, payload);
}
