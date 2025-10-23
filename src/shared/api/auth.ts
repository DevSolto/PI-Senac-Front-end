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
  const data = apiClient.post<LoginResponse>(LOGIN_ENDPOINT, payload);
  console.log('login payload', payload);
  return data;
}

export function enableMfa(payload: EnableMfaPayload): Promise<EnableMfaResponse> {
  const data = apiClient.post<EnableMfaResponse>(ENABLE_MFA_ENDPOINT, payload);
  console.log('enableMfa payload', payload);
  return data;
}

export function resetMfa(payload: ResetMfaPayload): Promise<ResetMfaResponse> {
  const data = apiClient.post<ResetMfaResponse>(RESET_MFA_ENDPOINT, payload);
  console.log('resetMfa payload', payload);
  return data;
}
