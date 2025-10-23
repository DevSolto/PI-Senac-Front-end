import type { UserRole } from './users.types';

export interface CreateCompanyDto {
  name: string;
  CNPJ: string;
  description?: string | null;
  address?: string | null;
}

export interface UpdateCompanyDto {
  name?: string;
  CNPJ?: string;
  description?: string | null;
  address?: string | null;
}

export interface CompanyUserSummary {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface CompanySiloSummary {
  id: number;
  name: string;
  grain: string;
  inUse: boolean;
}

export interface Company {
  id: number;
  name: string;
  CNPJ: string;
  description?: string | null;
  address?: string | null;
  users: CompanyUserSummary[];
  silos: CompanySiloSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyApiResponse
  extends Omit<Company, 'users' | 'silos' | 'description' | 'address'> {
  description?: string | null;
  address?: string | null;
  users?: CompanyUserSummary[] | null;
  silos?: CompanySiloSummary[] | null;
}
