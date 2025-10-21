import { apiClient } from '../http';

import type { Company, CreateCompanyDto, UpdateCompanyDto } from './companies.types';

const COMPANIES_ENDPOINT = '/companies';

export function createCompany(payload: CreateCompanyDto): Promise<Company> {
  return apiClient.post<Company>(COMPANIES_ENDPOINT, payload);
}

export function listCompanies(): Promise<Company[]> {
  return apiClient.json<Company[]>({
    path: COMPANIES_ENDPOINT,
  });
}

export function getCompany(id: number): Promise<Company> {
  return apiClient.json<Company>({
    path: `${COMPANIES_ENDPOINT}/${id}`,
  });
}

export function updateCompany(id: number, payload: UpdateCompanyDto): Promise<Company> {
  return apiClient.json<Company>({
    method: 'PATCH',
    path: `${COMPANIES_ENDPOINT}/${id}`,
    body: payload,
  });
}

export async function deleteCompany(id: number): Promise<void> {
  await apiClient.json<unknown>({
    method: 'DELETE',
    path: `${COMPANIES_ENDPOINT}/${id}`,
  });
}
