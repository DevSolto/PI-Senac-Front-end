import { useCallback, useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { CompanyCard, CompanyCardSkeleton } from '../components/CompanyCard';
import { listCompanies } from '@/shared/api/companies';
import type { Company } from '@/shared/api/companies.types';
import { CreateCompanyDialog } from '../components/CreateCompanyDialog';

const SKELETON_ITEMS = 6;

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchCompanies() {
      try {
        setLoading(true);
        setError(null);
        const response = await listCompanies();

        if (!isSubscribed) return;

        setCompanies(response);
      } catch (err) {
        if (!isSubscribed) return;

        console.error('Erro ao carregar companhias', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar companhias.');
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    fetchCompanies();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const showEmptyState = !loading && !error && companies.length === 0;

  const handleCompanyCreated = useCallback((company: Company) => {
    setCompanies((previous) => [...previous, company]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Companhias</h1>
          <p className="text-muted-foreground">
            Visualize e acompanhe as empresas cadastradas e seus principais indicadores.
          </p>
        </div>

        <CreateCompanyDialog onCompanyCreated={handleCompanyCreated} />
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
          {loading
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
