import { useCallback, useEffect, useRef, useState } from 'react';

import { UsersTable } from '../components/UsersTable';

import { listUsers } from '@/shared/api/users';
import type { User } from '@/shared/api/users.types';

type UsersStatus = 'idle' | 'loading' | 'ready' | 'error';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<UsersStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listUsers();

      if (!isMounted.current) {
        return;
      }

      setUsers(response);
      setStatus('ready');
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      console.error('Erro ao carregar usuários', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os usuários.');
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const isLoading = status === 'loading';
  const hasError = status === 'error';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Administre as contas vinculadas às empresas cadastradas.
          </p>
        </div>
      </div>

      <UsersTable
        users={users}
        loading={isLoading}
        error={hasError ? error || 'Não foi possível carregar os usuários.' : null}
        onRetry={hasError ? fetchUsers : undefined}
      />
    </div>
  );
};
