import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuth } from '@/app/hooks/useAuth';
import { enableMfa, login as loginRequest } from '@/shared/api/auth';
import type { LoginPayload, LoginResponse } from '@/shared/api/auth.types';
import { HttpError } from '@/shared/http';

interface LoginFormValues {
  email: string;
  password: string;
  mfaCode: string;
}

type MfaState = 'none' | 'required' | 'setup';

interface MfaSetupData {
  message?: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

const DEFAULT_FORM_VALUES: LoginFormValues = {
  email: '',
  password: '',
  mfaCode: '',
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [mfaState, setMfaState] = useState<MfaState>('none');
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues = useMemo<LoginFormValues>(
    () => ({ ...DEFAULT_FORM_VALUES }),
    [],
  );

  const form = useForm<LoginFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (mfaState === 'none') {
      form.setValue('mfaCode', '');
      setMfaSetupData(null);
    }
  }, [form, mfaState]);

  const focusMfaField = useCallback(() => {
    form.setValue('mfaCode', '');
    requestAnimationFrame(() => {
      form.setFocus('mfaCode');
    });
  }, [form]);

  const handleSuccessLogin = useCallback(
    async (payload: LoginPayload, token: string) => {
      await authLogin(payload, { accessToken: token });
      toast.success('Autenticação realizada com sucesso!');
      form.reset({ ...DEFAULT_FORM_VALUES, email: payload.email });
      setMfaState('none');
      setMfaSetupData(null);
      navigate('/');
    },
    [authLogin, form, navigate],
  );

  const handleLoginResponse = useCallback(
    async (payload: LoginPayload, response: LoginResponse) => {
      if ('access_token' in response && response.access_token) {
        await handleSuccessLogin(payload, response.access_token);
        return;
      }

      if ('mfaRequired' in response && response.mfaRequired) {
        setMfaState('required');
        setMfaSetupData(null);
        toast.info('Confirmação em duas etapas necessária', {
          description:
            'Informe o código gerado pelo seu aplicativo autenticador para finalizar o acesso.',
        });
        focusMfaField();
        return;
      }

      if ('mfaSetupRequired' in response && response.mfaSetupRequired) {
        setMfaState('setup');
        setMfaSetupData({
          message: response.message,
          otpauthUrl: response.otpauth_url,
          qrCodeDataUrl: response.qrCodeDataUrl,
        });
        toast.info('Configure a autenticação em duas etapas', {
          description:
            'Digite o primeiro código gerado pelo aplicativo autenticador para concluir a ativação.',
        });
        focusMfaField();
      }
    },
    [focusMfaField, handleSuccessLogin],
  );

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setErrorMessage(null);
      setIsSubmitting(true);

      const trimmedEmail = values.email.trim();
      const sanitizedMfaCode = values.mfaCode.replace(/\s+/g, '');
      const payload: LoginPayload = {
        email: trimmedEmail,
        password: values.password,
        ...(sanitizedMfaCode ? { mfaCode: sanitizedMfaCode } : {}),
      };

      try {
        if (mfaState === 'setup') {
          const enableResponse = await enableMfa({
            email: trimmedEmail,
            mfaCode: sanitizedMfaCode,
          });

          toast.success(enableResponse.message || 'MFA habilitada com sucesso!');
          await handleSuccessLogin(payload, enableResponse.access_token);
          return;
        }

        const response = await loginRequest(payload);
        await handleLoginResponse(payload, response);
      } catch (error) {
        console.error('Erro ao realizar login', error);
        const message =
          error instanceof HttpError
            ? error.message
            : 'Não foi possível realizar o login. Verifique os dados e tente novamente.';
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleLoginResponse, handleSuccessLogin, mfaState],
  );

  const mfaInstructions = useMemo(() => {
    if (mfaState === 'required') {
      return 'Abra o aplicativo autenticador cadastrado e digite o código de 6 dígitos exibido.';
    }

    if (mfaState === 'setup') {
      return 'Finalize a configuração digitando o primeiro código gerado após escanear o QR Code no aplicativo autenticador.';
    }

    return null;
  }, [mfaState]);

  const submitLabel = useMemo(() => {
    if (mfaState === 'setup') {
      return isSubmitting ? 'Ativando...' : 'Ativar e acessar';
    }

    if (mfaState === 'required') {
      return isSubmitting ? 'Validando...' : 'Validar código e entrar';
    }

    return isSubmitting ? 'Entrando...' : 'Entrar';
  }, [isSubmitting, mfaState]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Acessar plataforma
          </CardTitle>
          <CardDescription>
            Informe suas credenciais para visualizar os painéis de monitoramento.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Informe o e-mail corporativo.',
                    pattern: {
                      value: /[^@\s]+@[^@\s]+\.[^@\s]+/,
                      message: 'Informe um e-mail válido.',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="usuario@empresa.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{ required: 'Informe a senha.' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="Digite sua senha"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {mfaState !== 'none' && (
                <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Autenticação em duas etapas
                    </p>
                    {mfaInstructions && (
                      <p className="text-sm text-muted-foreground">{mfaInstructions}</p>
                    )}
                    {mfaState === 'setup' && mfaSetupData?.message && (
                      <p className="text-xs text-muted-foreground">{mfaSetupData.message}</p>
                    )}
                  </div>

                  {mfaState === 'setup' && mfaSetupData && (
                    <div className="space-y-2 rounded-md bg-muted/40 p-3 text-center">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Escaneie o QR Code abaixo no seu aplicativo autenticador
                      </p>
                      <div className="flex justify-center">
                        <img
                          src={mfaSetupData.qrCodeDataUrl}
                          alt="QR Code para configurar MFA"
                          className="h-44 w-44 rounded-md border border-border bg-background p-2 shadow-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Se preferir, adicione manualmente usando este endereço:
                      </p>
                      <code className="block break-all rounded bg-background px-2 py-1 text-xs text-foreground">
                        {mfaSetupData.otpauthUrl}
                      </code>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="mfaCode"
                    rules={{
                      validate: (value) => {
                        if (mfaState === 'none') {
                          return true;
                        }

                        const sanitized = value.trim();

                        if (!sanitized) {
                          return 'Informe o código de verificação.';
                        }

                        if (!/^\d{6}$/.test(sanitized)) {
                          return 'O código deve conter 6 dígitos.';
                        }

                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Código de verificação</FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={field.onChange}
                            containerClassName="w-full justify-center"
                            disabled={isSubmitting}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormDescription>
                          Digite o código numérico exibido no aplicativo autenticador.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {submitLabel}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
