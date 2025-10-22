import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { CompanyCard, CompanyCardSkeleton } from '../components/CompanyCard';
import { CreateCompanyDialog } from '../components/CreateCompanyDialog';
import { useCompanies } from '../hooks/useCompanies';

const SKELETON_ITEMS = 6;

export const CompaniesPage = () => {
  const { companies, status, error, append } = useCompanies();

  const showEmptyState = useMemo(
    () => status === 'ready' && !error && companies.length === 0,
    [companies.length, error, status],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Companhias</h1>
          <p className="text-muted-foreground">
            Visualize e acompanhe as empresas cadastradas e seus principais indicadores.
          </p>
        </div>

        <CreateCompanyDialog onCompanyCreated={append} />
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar as companhias</CardTitle>
            <CardDescription>
              {error || 'Tente novamente mais tarde.'}
            </CardDescription>
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
                <CompanyCardSkeleton key={`company-skeleton-${index}`} />
              ))
            : showEmptyState
            ? (
                <Card className="md:col-span-2 xl:col-span-3">
                  <CardHeader>
                    <CardTitle>Nenhuma companhia cadastrada</CardTitle>
                    <CardDescription>
                      Cadastre novas empresas para visualizar seus detalhes aqui.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            : (
                companies.map(company => <CompanyCard key={company.id} company={company} />)
              )}
        </div>
      )}
    </div>
  );
};
