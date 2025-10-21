import { apiClient } from '../http';
import type {
  EnableMfaPayload,
  EnableMfaResponse,
  LoginPayload,
  LoginResponse,
} from './auth.types';

const LOGIN_ENDPOINT = '/auth/login';
const ENABLE_MFA_ENDPOINT = '/auth/mfa/enable';

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload);
}

export function enableMfa(payload: EnableMfaPayload): Promise<EnableMfaResponse> {
  return apiClient.post<EnableMfaResponse>(ENABLE_MFA_ENDPOINT, payload);
}
