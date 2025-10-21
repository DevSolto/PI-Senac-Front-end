import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { CompanyCard, CompanyCardSkeleton } from '../components/CompanyCard';
import { listCompanies } from '@/shared/api/companies';
import type { Company } from '@/shared/api/companies.types';

const SKELETON_ITEMS = 6;

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      cnpj: '',
      description: '',
      address: '',
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      form.reset();
    }
  };

  const handleSubmit = form.handleSubmit(data => {
    console.log('Nova companhia criada', data);
    setIsDialogOpen(false);
    form.reset();
  });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Companhias</h1>
          <p className="text-muted-foreground">
            Visualize e acompanhe as empresas cadastradas e seus principais indicadores.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Nova companhia</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova companhia</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar uma nova companhia.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Nome é obrigatório.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da companhia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  rules={{ required: 'CNPJ é obrigatório.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: 'Descrição é obrigatória.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Resumo das atividades da companhia"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  rules={{ required: 'Endereço é obrigatório.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
