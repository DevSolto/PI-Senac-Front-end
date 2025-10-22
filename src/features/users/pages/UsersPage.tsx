import { useCallback, useEffect, useRef, useState } from 'react';

import { UsersTable } from '../components/UsersTable';
import { CreateUserDialog } from '../components/CreateUserDialog';

import { Badge } from '@/components/ui/badge';
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
      // TODO: permitir filtrar por empresa utilizando ListUsersParams quando o filtro estiver disponível na UI.
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
  const isReady = status === 'ready';
  const totalUsers = users.length;

  const handleUserCreated = useCallback(
    (createdUser: User) => {
      setUsers(prevUsers => {
        const withoutDuplicatedUser = prevUsers.filter(user => user.id !== createdUser.id);

        return [createdUser, ...withoutDuplicatedUser];
      });
      setStatus('ready');
      setError(null);
    },
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">Usuários</h1>
            {isReady ? (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-medium">
                {totalUsers} {totalUsers === 1 ? 'usuário' : 'usuários'}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">
            Administre as contas vinculadas às empresas cadastradas.
          </p>
        </div>

        <CreateUserDialog onUserCreated={handleUserCreated} />
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
