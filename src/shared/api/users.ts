import { apiClient } from '../http';

import type {
  CreateUserDto,
  ListUsersParams,
  UpdateUserDto,
  User,
} from './users.types';

const USERS_ENDPOINT = '/users';

function buildUsersPath(params?: ListUsersParams): string {
  if (!params || params.companyId === undefined) {
    return USERS_ENDPOINT;
  }

  const searchParams = new URLSearchParams();
  searchParams.set('companyId', String(params.companyId));

  return `${USERS_ENDPOINT}?${searchParams.toString()}`;
}

export function createUser(payload: CreateUserDto): Promise<User> {
  return apiClient.post<User>(USERS_ENDPOINT, payload);
}

export function listUsers(params?: ListUsersParams): Promise<User[]> {
  return apiClient.json<User[]>({
    path: buildUsersPath(params),
  });
}

export function getUser(id: number): Promise<User> {
  return apiClient.json<User>({
    path: `${USERS_ENDPOINT}/${id}`,
  });
}

export function updateUser(id: number, payload: UpdateUserDto): Promise<User> {
  return apiClient.json<User>({
    method: 'PATCH',
    path: `${USERS_ENDPOINT}/${id}`,
    body: payload,
  });
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.json<unknown>({
    method: 'DELETE',
    path: `${USERS_ENDPOINT}/${id}`,
  });
}
