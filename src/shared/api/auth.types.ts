export interface LoginPayload {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginMfaRequiredResponse {
  mfaRequired: true;
  message?: string;
  hint?: string;
  recoveryHint?: string;
}

export interface LoginMfaSetupRequiredResponse {
  mfaSetupRequired?: true;
  message?: string;
  otpauth_url: string;
  qrCodeDataUrl: string;
}

export interface LoginSuccessResponse {
  access_token: string;
}

export type LoginResponse =
  | LoginMfaRequiredResponse
  | LoginMfaSetupRequiredResponse
  | LoginSuccessResponse;

export interface EnableMfaPayload {
  email: string;
  mfaCode: string;
}

export interface EnableMfaResponse {
  message: string;
  access_token: string;
}

export interface ResetMfaPayload {
  email: string;
  password: string;
}

export interface ResetMfaResponse {
  message: string;
  otpauth_url: string;
  qrCodeDataUrl: string;
}
