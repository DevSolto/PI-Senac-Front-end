import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '@/shared/api/users.types';

const SKELETON_ROWS = 5;

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function UsersTable({ users, loading, error, onRetry }: UsersTableProps) {
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  );

  const hasError = Boolean(error);
  const showEmptyState = !loading && !hasError && users.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de usuários</CardTitle>
        <CardDescription>
          {hasError
            ? error || 'Não foi possível carregar os usuários.'
            : 'Visualize os usuários cadastrados e seus detalhes principais.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {hasError ? (
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>Verifique sua conexão com a internet ou tente recarregar a página.</p>
            {onRetry ? (
              <Button onClick={onRetry} variant="outline" className="self-start">
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : (
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
              {loading
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
                          {renderTimestamp(user.createdAt, dateFormatter)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {renderTimestamp(user.updatedAt, dateFormatter)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function formatRole(role: User['role']): string {
  if (role === 'admin') {
    return 'Administrador';
  }

  return 'Usuário';
}

function renderTimestamp(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());

  if (!isValid) {
    return 'data indisponível';
  }

  return (
    <time dateTime={date.toISOString()}>{formatter.format(date)}</time>
  );
}
