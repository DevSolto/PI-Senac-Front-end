import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { CreateSiloDialog } from '../components/CreateSiloDialog';
import { SiloCard, SiloCardSkeleton } from '../components/SiloCard';
import { useSilos } from '../hooks/useSilos';

const SKELETON_ITEMS = 6;

export const SilosPage = () => {
  const { silos, status, error, append } = useSilos();

  const showEmptyState = useMemo(
    () => status === 'ready' && !error && silos.length === 0,
    [silos.length, error, status],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4 lg:flex lg:items-end lg:justify-between">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Silos</h1>
          <div className="max-w-prose text-base leading-relaxed text-muted-foreground">
            <p>
              Acompanhe os silos monitorados, verifique limites ideais e mantenha os ambientes sob controle.
            </p>
          </div>
        </div>

        <CreateSiloDialog onSiloCreated={append} />
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar os silos</CardTitle>
            <CardDescription>{error || 'Tente novamente mais tarde.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão com a internet ou tente recarregar a página.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {status === 'loading'
            ? Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
                <SiloCardSkeleton key={`silo-skeleton-${index}`} />
              ))
            : showEmptyState
            ? (
                <Card className="md:col-span-2 xl:col-span-3">
                  <CardHeader>
                    <CardTitle>Nenhum silo cadastrado</CardTitle>
                    <CardDescription>
                      Cadastre novos silos para acompanhar suas condições e históricos nesta página.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Utilize o botão <span className="font-semibold">Novo silo</span> para iniciar um cadastro e acompanhar seus ambientes.
                    </p>
                  </CardContent>
                </Card>
              )
            : (
                silos.map(silo => <SiloCard key={silo.id} silo={silo} />)
              )}
        </div>
      )}
    </div>
  );
};
