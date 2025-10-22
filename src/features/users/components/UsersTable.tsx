import { useMemo } from 'react';

import { AlertCircle, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/components/ui/utils';
import type { User } from '@/shared/api/users.types';

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
          {loading
            ? 'Carregando usuários cadastrados...'
            : hasError
            ? error || 'Não foi possível carregar os usuários.'
            : `Visualize os usuários cadastrados e seus detalhes principais.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
            <span>Carregando...</span>
          </div>
        ) : hasError ? (
          <Alert variant="destructive" className="max-w-xl">
            <AlertCircle className="h-5 w-5" aria-hidden />
            <AlertTitle>Falha ao carregar usuários</AlertTitle>
            <AlertDescription className="space-y-3 text-muted-foreground">
              <p>{error || 'Não foi possível carregar os usuários.'}</p>
              <p>
                Verifique sua conexão com a internet ou tente novamente em alguns instantes. Caso o
                problema persista, contate o suporte.
              </p>
              {onRetry ? (
                <Button onClick={onRetry} variant="outline" size="sm" className="mt-1">
                  Tentar novamente
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
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
                {showEmptyState ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      Nenhum usuário cadastrado até o momento.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.company?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'secondary' : 'outline'}
                          className="min-w-[7rem] justify-center"
                        >
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'flex min-w-[7rem] items-center justify-center gap-2 border',
                            getMfaBadgeClasses(user.mfa),
                          )}
                        >
                          {user.mfa ? (
                            <ShieldCheck className="h-4 w-4" aria-hidden />
                          ) : (
                            <ShieldOff className="h-4 w-4" aria-hidden />
                          )}
                          <span>{user.mfa ? 'Ativo' : 'Inativo'}</span>
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
          </div>
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

function getMfaBadgeClasses(isActive: boolean) {
  if (isActive) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-200';
  }

  return 'border-muted-foreground/20 bg-muted text-muted-foreground';
}
