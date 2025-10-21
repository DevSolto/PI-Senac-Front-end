export type UserRole = 'admin' | 'user';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  mfa?: boolean;
  mfaSecret?: string | null;
  mfaEnabledAt?: string | null;
  companyId: number;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  mfa?: boolean;
  mfaSecret?: string | null;
  mfaEnabledAt?: string | null;
  companyId?: number;
}

export interface UserCompanySummary {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  mfa: boolean;
  mfaSecret?: string | null;
  mfaEnabledAt?: string | null;
  companyId: number;
  company?: UserCompanySummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  companyId?: number;
}
