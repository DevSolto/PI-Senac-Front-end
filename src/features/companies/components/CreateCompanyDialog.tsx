import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
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
import { createCompany } from '@/shared/api/companies';
import type { Company, CreateCompanyDto } from '@/shared/api/companies.types';

interface CreateCompanyDialogProps {
  onCompanyCreated?: (company: Company) => void;
}

type CreateCompanyFormValues = {
  name: string;
  CNPJ: string;
  description: string;
  address: string;
};

export function CreateCompanyDialog({ onCompanyCreated }: CreateCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo<CreateCompanyFormValues>(
    () => ({
      name: '',
      CNPJ: '',
      description: '',
      address: '',
    }),
    [],
  );

  const form = useForm<CreateCompanyFormValues>({
    defaultValues,
  });

  const resetForm = useCallback(() => {
    form.reset({ ...defaultValues });
  }, [defaultValues, form]);

  const handleSubmit = useCallback(
    async (values: CreateCompanyFormValues) => {
      setIsSubmitting(true);

      try {
        const payload: CreateCompanyDto = {
          name: values.name.trim(),
          CNPJ: values.CNPJ.trim(),
          description: values.description.trim() || undefined,
          address: values.address.trim() || undefined,
        };

        const createdCompany = await createCompany(payload);

        onCompanyCreated?.(createdCompany);
        toast.success('Empresa criada com sucesso!');

        resetForm();
        setOpen(false);
      } catch (error) {
        console.error('Erro ao criar empresa', error);
        toast.error('Não foi possível criar a empresa. Verifique os dados e tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCompanyCreated, resetForm],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm();
      }

      setOpen(nextOpen);
    },
    [resetForm],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nova empresa
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar uma nova empresa na plataforma.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Informe o nome da empresa.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" autoComplete="organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="CNPJ"
              rules={{ required: 'Informe o CNPJ.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, cidade" autoComplete="street-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Resumo sobre a empresa, produtos ou observações relevantes"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar empresa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
