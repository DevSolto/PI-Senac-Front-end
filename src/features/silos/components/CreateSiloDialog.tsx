import { useCallback, useMemo, useState } from 'react';
import { useForm, type Control } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { createSilo } from '@/shared/api/silos';
import type { CreateSiloDto, Silo } from '@/shared/api/silos.types';
import { listCompanies } from '@/shared/api/companies';
import type { Company } from '@/shared/api/companies.types';

interface CreateSiloDialogProps {
  onSiloCreated?: (silo: Silo) => void;
}

type CreateSiloFormValues = {
  name: string;
  description: string;
  grain: string;
  inUse: boolean;
  companyId: string;
  maxTemperature: string;
  minTemperature: string;
  maxHumidity: string;
  minHumidity: string;
  maxAirQuality: string;
  minAirQuality: string;
};

export function CreateSiloDialog({ onSiloCreated }: CreateSiloDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  const defaultValues = useMemo<CreateSiloFormValues>(
    () => ({
      name: '',
      description: '',
      grain: '',
      inUse: true,
      companyId: '',
      maxTemperature: '',
      minTemperature: '',
      maxHumidity: '',
      minHumidity: '',
      maxAirQuality: '',
      minAirQuality: '',
    }),
    [],
  );

  const form = useForm<CreateSiloFormValues>({
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
    async (values: CreateSiloFormValues) => {
      setIsSubmitting(true);

      try {
        const payload: CreateSiloDto = {
          name: values.name.trim(),
          grain: values.grain.trim(),
          companyId: Number(values.companyId),
          inUse: values.inUse,
          description: values.description.trim() || undefined,
          maxTemperature: parseNumber(values.maxTemperature),
          minTemperature: parseNumber(values.minTemperature),
          maxHumidity: parseNumber(values.maxHumidity),
          minHumidity: parseNumber(values.minHumidity),
          maxAirQuality: parseNumber(values.maxAirQuality),
          minAirQuality: parseNumber(values.minAirQuality),
        };

        const createdSilo = await createSilo(payload);

        toast.success('Silo criado com sucesso!');
        onSiloCreated?.(createdSilo);

        resetForm();
        setOpen(false);
      } catch (error) {
        console.error('Erro ao criar silo', error);
        toast.error('Não foi possível criar o silo. Verifique os dados e tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSiloCreated, resetForm],
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
          Novo silo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo silo</DialogTitle>
          <DialogDescription>
            Cadastre um novo silo e defina faixas ideais para temperatura, umidade e qualidade do ar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Informe o nome do silo.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do silo" autoComplete="off" {...field} />
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
                      placeholder="Resumo sobre o silo, capacidade ou observações relevantes"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grain"
              rules={{ required: 'Informe o grão armazenado.' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Milho, Soja" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyId"
              rules={{ required: 'Selecione a empresa responsável.' }}
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
                        <SelectValue
                          placeholder={
                            isLoadingCompanies ? 'Carregando empresas...' : 'Selecione a empresa'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map(company => (
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
                      Cadastre uma empresa antes de criar um silo.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inUse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Em operação</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Indique se o silo está atualmente em uso.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Alternar uso" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <NumericField
                control={form.control}
                name="minTemperature"
                label="Temperatura mínima (°C)"
                placeholder="Ex.: 10"
              />
              <NumericField
                control={form.control}
                name="maxTemperature"
                label="Temperatura máxima (°C)"
                placeholder="Ex.: 25"
              />
              <NumericField
                control={form.control}
                name="minHumidity"
                label="Umidade mínima (%)"
                placeholder="Ex.: 40"
              />
              <NumericField
                control={form.control}
                name="maxHumidity"
                label="Umidade máxima (%)"
                placeholder="Ex.: 65"
              />
              <NumericField
                control={form.control}
                name="minAirQuality"
                label="Qualidade do ar mínima"
                placeholder="Ex.: 30"
              />
              <NumericField
                control={form.control}
                name="maxAirQuality"
                label="Qualidade do ar máxima"
                placeholder="Ex.: 60"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar silo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type NumericFieldProps = {
  control: Control<CreateSiloFormValues>;
  name: keyof Pick<
    CreateSiloFormValues,
    | 'maxTemperature'
    | 'minTemperature'
    | 'maxHumidity'
    | 'minHumidity'
    | 'maxAirQuality'
    | 'minAirQuality'
  >;
  label: string;
  placeholder: string;
};

function NumericField({ control, name, label, placeholder }: NumericFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="decimal"
              step="any"
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function parseNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}
