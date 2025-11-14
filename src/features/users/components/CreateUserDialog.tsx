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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createUser } from '@/shared/api/users';
import { listCompanies } from '@/shared/api/companies';
import type { Company } from '@/shared/api/companies.types';
import type { CreateUserDto, User, UserRole } from '@/shared/api/users.types';

interface CreateUserDialogProps {
  onUserCreated?: (user: User) => void;
}

type CreateUserFormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  mfa: boolean;
  companyId: string;
};

export function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  const defaultValues = useMemo<CreateUserFormValues>(
    () => ({
      name: '',
      email: '',
      password: '',
      role: 'user',
      mfa: false,
      companyId: '',
    }),
    [],
  );

  const form = useForm<CreateUserFormValues>({
    defaultValues,
  });

  const loadCompanies = useCallback(async () => {
    setIsLoadingCompanies(true);
    setCompaniesError(null);

    try {
      const response = await listCompanies();
      setCompanies(response);
    } catch (error) {
      console.error('Erro ao carregar empresas', error);
      toast.error('Não foi possível carregar as empresas. Tente novamente.');
      setCompaniesError('Não foi possível carregar as empresas.');
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    form.reset({ ...defaultValues });
  }, [defaultValues, form]);

  const handleSubmit = useCallback(
    async (values: CreateUserFormValues) => {
      setIsSubmitting(true);

      try {
        const payload: CreateUserDto = {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password.trim(),
          role: values.role,
          mfa: values.mfa,
          companyId: Number(values.companyId),
        };

        const createdUser = await createUser(payload);

        toast.success('Usuário criado com sucesso!');
        onUserCreated?.(createdUser);

        resetForm();
        setOpen(false);
      } catch (error) {
        console.error('Erro ao criar usuário', error);
        toast.error('Não foi possível criar o usuário. Verifique os dados e tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [onUserCreated, resetForm],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        if ((!companies.length || companiesError) && !isLoadingCompanies) {
          void loadCompanies();
        }
      } else {
        resetForm();
      }

      setOpen(nextOpen);
    },
    [companies.length, companiesError, isLoadingCompanies, loadCompanies, resetForm],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Novo usuário
        </Button>
      </DialogTrigger>

      <DialogContent className="dialog-surface dialog-surface--wide dialog-scroll">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar um novo usuário vinculado a uma empresa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Informe o nome completo.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Informe o e-mail.',
                pattern: {
                  value: /[^@\s]+@[^@\s]+\.[^@\s]+/,
                  message: 'Informe um e-mail válido.',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@empresa.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'Informe a senha temporária.',
                minLength: {
                  value: 8,
                  message: 'A senha deve ter pelo menos 8 caracteres.',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Senha temporária" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de acesso</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mfa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Autenticação em duas etapas</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Ative a verificação em duas etapas para este usuário.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Alternar MFA" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyId"
              rules={{ required: 'Selecione a empresa vinculada.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingCompanies || companies.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger aria-busy={isLoadingCompanies}>
                        <SelectValue placeholder={isLoadingCompanies ? 'Carregando empresas...' : 'Selecione a empresa'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isLoadingCompanies && companiesError ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Não foi possível carregar as empresas.</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto px-0"
                        onClick={() => {
                          void loadCompanies();
                        }}
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  ) : null}
                  {!isLoadingCompanies && !companiesError && companies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Cadastre uma empresa antes de criar um usuário.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar usuário'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
