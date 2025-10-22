import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { listUsers } from '@/shared/api/users';
import type { User } from '@/shared/api/users.types';

type UsersStatus = 'idle' | 'loading' | 'ready' | 'error';

const SKELETON_ROWS = 5;

function formatRole(role: User['role']): string {
  if (role === 'admin') {
    return 'Administrador';
  }

  return 'Usuário';
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<UsersStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  );

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

  const handleUserCreated = useCallback((createdUser: User) => {
    if (!isMounted.current) {
      return;
    }

    setUsers(previousUsers => {
      const filteredUsers = previousUsers.filter(user => user.id !== createdUser.id);
      return [createdUser, ...filteredUsers];
    });
    setStatus('ready');
    setError(null);
  }, []);

  const showEmptyState = useMemo(
    () => status === 'ready' && users.length === 0 && !error,
    [error, status, users.length],
  );

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

      {hasError ? (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar os usuários</CardTitle>
            <CardDescription>{error || 'Tente novamente mais tarde.'}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão com a internet ou tente recarregar a página.
            </p>
            <Button onClick={() => fetchUsers()} variant="outline" className="self-start">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de usuários</CardTitle>
            <CardDescription>Visualize os usuários cadastrados e seus detalhes principais.</CardDescription>
          </CardHeader>
          <CardContent
            className="overflow-x-auto"
            data-has-create-handler={Boolean(handleUserCreated)}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead className="whitespace-nowrap">Criado em</TableHead>
                  <TableHead className="whitespace-nowrap">Atualizado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                      <TableRow key={`user-skeleton-${index}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-56" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                      </TableRow>
                    ))
                  : showEmptyState
                  ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                          Nenhum usuário cadastrado até o momento.
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.company?.name ?? '—'}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                              {formatRole(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.mfa ? 'default' : 'outline'}>
                              {user.mfa ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {dateFormatter.format(new Date(user.createdAt))}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {dateFormatter.format(new Date(user.updatedAt))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
