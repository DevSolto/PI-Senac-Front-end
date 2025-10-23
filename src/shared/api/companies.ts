import { apiClient } from '../http';

import type {
  Company,
  CompanyApiResponse,
  CreateCompanyDto,
  UpdateCompanyDto,
} from './companies.types';

const COMPANIES_ENDPOINT = '/companies';

function normalizeCompany(company: CompanyApiResponse): Company {
  return {
    ...company,
    description: company.description ?? null,
    address: company.address ?? null,
    users: Array.isArray(company.users) ? company.users : [],
    silos: Array.isArray(company.silos) ? company.silos : [],
  };
}

export function createCompany(payload: CreateCompanyDto): Promise<Company> {
  return apiClient.post<CompanyApiResponse>(COMPANIES_ENDPOINT, payload).then(normalizeCompany);
}

export function listCompanies(): Promise<Company[]> {
  return apiClient
    .json<CompanyApiResponse[]>({
      path: COMPANIES_ENDPOINT,
    })
    .then(response => response.map(normalizeCompany));
}

export function getCompany(id: number): Promise<Company> {
  return apiClient
    .json<CompanyApiResponse>({
      path: `${COMPANIES_ENDPOINT}/${id}`,
    })
    .then(normalizeCompany);
}

export function updateCompany(id: number, payload: UpdateCompanyDto): Promise<Company> {
  return apiClient
    .json<CompanyApiResponse>({
      method: 'PATCH',
      path: `${COMPANIES_ENDPOINT}/${id}`,
      body: payload,
    })
    .then(normalizeCompany);
}

export async function deleteCompany(id: number): Promise<void> {
  await apiClient.json<unknown>({
    method: 'DELETE',
    path: `${COMPANIES_ENDPOINT}/${id}`,
  });
}
