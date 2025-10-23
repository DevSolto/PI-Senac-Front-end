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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { enableMfa, login as loginRequest, resetMfa } from '@/shared/api/auth';
import type {
  LoginPayload,
  LoginResponse,
  ResetMfaPayload,
} from '@/shared/api/auth.types';
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

interface ResetMfaFormValues {
  password: string;
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
  const [mfaHint, setMfaHint] = useState<string | null>(null);
  const [mfaRecoveryHint, setMfaRecoveryHint] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  const logFlowEvent = useCallback(
    (event: string, details?: Record<string, unknown>) => {
      if (details) {
        console.info('[LoginPage]', event, details);
        return;
      }

      console.info('[LoginPage]', event);
    },
    [],
  );

  const defaultValues = useMemo<LoginFormValues>(
    () => ({ ...DEFAULT_FORM_VALUES }),
    [],
  );

  const form = useForm<LoginFormValues>({
    defaultValues,
  });

  const resetForm = useForm<ResetMfaFormValues>({
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (mfaState === 'none') {
      form.setValue('mfaCode', '');
      setMfaSetupData(null);
      setPendingEmail(null);
      setMfaHint(null);
      setMfaRecoveryHint(null);
      setIsResetDialogOpen(false);
      setResetErrorMessage(null);
      resetForm.reset();
    }
  }, [form, mfaState, resetForm]);

  const focusMfaField = useCallback(() => {
    form.setValue('mfaCode', '');
    requestAnimationFrame(() => {
      form.setFocus('mfaCode');
    });
  }, [form]);

  const handleSuccessLogin = useCallback(
    async (payload: LoginPayload, token: string) => {
      logFlowEvent('login:success', { email: payload.email });
      await authLogin(payload, { accessToken: token });
      toast.success('Autenticação realizada com sucesso!');
      form.reset({ ...DEFAULT_FORM_VALUES, email: payload.email });
      setMfaState('none');
      setMfaSetupData(null);
      setPendingEmail(null);
      navigate('/');
    },
    [authLogin, form, logFlowEvent, navigate, setPendingEmail],
  );

  const handleLoginResponse = useCallback(
    async (payload: LoginPayload, response: LoginResponse) => {
      const hasAccessToken = 'access_token' in response && Boolean(response.access_token);
      const hasMfaSetupFlag =
        'mfaSetupRequired' in response ? response.mfaSetupRequired : undefined;
      const hasMfaRequiredFlag =
        'mfaRequired' in response ? response.mfaRequired : undefined;
      const responseMessage = 'message' in response ? response.message : undefined;
      const isMfaRequiredResponse =
        Boolean(hasMfaRequiredFlag) || responseMessage === 'MFA code required';
      const hasQrCode = 'qrCodeDataUrl' in response && Boolean(response.qrCodeDataUrl);

      logFlowEvent('login:handleResponse', {
        email: payload.email,
        hasAccessToken,
        mfaRequired: isMfaRequiredResponse,
        mfaSetupRequired: hasMfaSetupFlag,
        hasQrCode,
      });

      if ('access_token' in response && response.access_token) {
        await handleSuccessLogin(payload, response.access_token);
        return;
      }

      if (isMfaRequiredResponse) {
        logFlowEvent('login:mfaRequired', { email: payload.email });
        setMfaState('required');
        setMfaSetupData(null);
        const responseHint = 'hint' in response ? response.hint : undefined;
        const responseRecoveryHint =
          'recoveryHint' in response ? response.recoveryHint : undefined;
        setMfaHint(responseHint ?? responseMessage ?? null);
        setMfaRecoveryHint(responseRecoveryHint ?? null);
        setPendingEmail(payload.email);
        toast.info('Confirmação em duas etapas necessária', {
          description:
            'Informe o código gerado pelo seu aplicativo autenticador para finalizar o acesso.',
        });
        focusMfaField();
        return;
      }

      if ('mfaSetupRequired' in response && response.mfaSetupRequired) {
        logFlowEvent('login:mfaSetupRequired', {
          email: payload.email,
          hasQrCode: Boolean(response.qrCodeDataUrl),
          hasOtpAuthUrl: Boolean(response.otpauth_url),
        });
        setMfaState('setup');
        setMfaSetupData({
          message: response.message,
          otpauthUrl: response.otpauth_url,
          qrCodeDataUrl: response.qrCodeDataUrl,
        });
        setMfaHint(null);
        setMfaRecoveryHint(null);
        setPendingEmail(payload.email);
        toast.info('Configure a autenticação em duas etapas', {
          description:
            'Digite o primeiro código gerado pelo aplicativo autenticador para concluir a ativação.',
        });
        focusMfaField();
        return;
      }

      if ('qrCodeDataUrl' in response && response.qrCodeDataUrl) {
        logFlowEvent('login:mfaSetup:implicit', {
          email: payload.email,
          hasOtpAuthUrl: Boolean(response.otpauth_url),
        });
        setMfaState('setup');
        setMfaSetupData({
          message: response.message,
          otpauthUrl: response.otpauth_url,
          qrCodeDataUrl: response.qrCodeDataUrl,
        });
        setMfaHint(null);
        setMfaRecoveryHint(null);
        setPendingEmail(payload.email);
        toast.info('Configure a autenticação em duas etapas', {
          description:
            'Digite o primeiro código gerado pelo aplicativo autenticador para concluir a ativação.',
        });
        focusMfaField();
      }
    },
    [focusMfaField, handleSuccessLogin, logFlowEvent, setPendingEmail],
  );

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setErrorMessage(null);
      setIsSubmitting(true);

      const trimmedEmail = values.email.trim();
      const emailForRequest =
        mfaState === 'none' ? trimmedEmail : pendingEmail ?? trimmedEmail;
      const sanitizedMfaCode = values.mfaCode.replace(/\s+/g, '');
      const payload: LoginPayload = {
        email: emailForRequest,
        password: values.password,
        ...(sanitizedMfaCode ? { mfaCode: sanitizedMfaCode } : {}),
      };

      logFlowEvent('submit:start', {
        email: trimmedEmail,
        emailInRequest: emailForRequest,
        mfaState,
        hasMfaCode: Boolean(sanitizedMfaCode),
      });

      try {
        if (mfaState === 'setup' || mfaState === 'required') {
          if (!emailForRequest) {
            const message =
              'Não foi possível identificar o e-mail da tentativa de acesso. Tente novamente realizar o login.';
            setErrorMessage(message);
            toast.error(message);
            return;
          }

          if (!sanitizedMfaCode) {
            const message =
              'Informe o código de 6 dígitos do autenticador para validar o acesso.';
            setErrorMessage(message);
            toast.error(message);
            focusMfaField();
            return;
          }

          if (mfaState === 'setup') {
            logFlowEvent('submit:enableMfa', {
              email: trimmedEmail,
              emailInRequest: emailForRequest,
              hasMfaCode: Boolean(sanitizedMfaCode),
              mfaState,
            });

            const enableResponse = await enableMfa({
              email: emailForRequest,
              mfaCode: sanitizedMfaCode,
            });

            logFlowEvent('submit:enableMfa:success', {
              email: trimmedEmail,
              emailInRequest: emailForRequest,
              hasAccessToken: Boolean(enableResponse.access_token),
              mfaState,
            });

            const successMessage =
              enableResponse.message || 'MFA habilitada com sucesso!';

            toast.success(successMessage);
            await handleSuccessLogin(payload, enableResponse.access_token);
            return;
          }

          logFlowEvent('submit:loginWithMfa', {
            email: trimmedEmail,
            emailInRequest: emailForRequest,
            hasMfaCode: Boolean(sanitizedMfaCode),
            mfaState,
          });

          const responseWithMfa = await loginRequest(payload);

          logFlowEvent('submit:loginWithMfa:success', {
            email: trimmedEmail,
            emailInRequest: emailForRequest,
            responseKeys: Object.keys(responseWithMfa),
          });

          await handleLoginResponse(payload, responseWithMfa);
          return;
        }

        const response = await loginRequest(payload);
        logFlowEvent('submit:loginRequest:success', {
          email: trimmedEmail,
          emailInRequest: emailForRequest,
          responseKeys: Object.keys(response),
        });
        await handleLoginResponse(payload, response);
      } catch (error) {
        const parsedError =
          error instanceof Error ? error.message : 'Erro desconhecido ao realizar login';
        logFlowEvent('submit:error', {
          email: trimmedEmail,
          emailInRequest: emailForRequest,
          mfaState,
          error: parsedError,
        });
        console.error('[LoginPage] submit:error', error);
        const message =
          error instanceof HttpError
            ? error.message
            : 'Não foi possível realizar o login. Verifique os dados e tente novamente.';
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
        logFlowEvent('submit:finished', {
          email: trimmedEmail,
          emailInRequest: emailForRequest,
          mfaState,
          isSetupFlow: mfaState === 'setup',
        });
      }
    },
    [handleLoginResponse, handleSuccessLogin, logFlowEvent, mfaState, pendingEmail],
  );

  const handleCancelMfa = useCallback(() => {
    const currentEmail = pendingEmail ?? form.getValues('email').trim();
    logFlowEvent('mfa:cancel', { email: currentEmail, mfaState });
    setMfaState('none');
    setMfaSetupData(null);
    setMfaHint(null);
    setMfaRecoveryHint(null);
    setIsResetDialogOpen(false);
    setResetErrorMessage(null);
    resetForm.reset();
  }, [form, logFlowEvent, mfaState, pendingEmail, resetForm]);

  const mfaInstructions = useMemo(() => {
    if (mfaState === 'required') {
      return (
        mfaHint ??
        'Abra o aplicativo autenticador cadastrado e digite o código de 6 dígitos exibido.'
      );
    }

    if (mfaState === 'setup') {
      return 'Finalize a configuração digitando o primeiro código gerado após escanear o QR Code no aplicativo autenticador.';
    }

    return null;
  }, [mfaHint, mfaState]);

  const submitLabel = useMemo(() => {
    if (mfaState === 'setup') {
      return isSubmitting ? 'Ativando...' : 'Ativar e acessar';
    }

    if (mfaState === 'required') {
      return isSubmitting ? 'Validando...' : 'Validar código e entrar';
    }

    return isSubmitting ? 'Entrando...' : 'Entrar';
  }, [isSubmitting, mfaState]);

  const isMfaStep = mfaState !== 'none';

  const handleResetDialogOpenChange = useCallback(
    (open: boolean) => {
      const currentEmail = pendingEmail ?? form.getValues('email').trim();
      logFlowEvent(`mfaReset:dialog:${open ? 'open' : 'close'}`, {
        email: currentEmail,
        mfaState,
      });
      setIsResetDialogOpen(open);
      if (!open) {
        setResetErrorMessage(null);
        setIsResetSubmitting(false);
        resetForm.reset();
      }
    },
    [form, logFlowEvent, mfaState, pendingEmail, resetForm],
  );

  const onResetSubmit = useCallback(
    async (values: ResetMfaFormValues) => {
      setResetErrorMessage(null);
      setIsResetSubmitting(true);

      const email = pendingEmail ?? form.getValues('email').trim();

      if (!email) {
        const message = 'Informe o e-mail corporativo antes de solicitar o reset do MFA.';
        setResetErrorMessage(message);
        toast.error(message);
        setIsResetSubmitting(false);
        return;
      }

      const payload: ResetMfaPayload = {
        email,
        password: values.password,
      };

      logFlowEvent('mfaReset:submit:start', {
        email,
        hasPassword: Boolean(values.password),
      });

      try {
        const response = await resetMfa(payload);

        logFlowEvent('mfaReset:submit:success', {
          email,
          hasQrCode: Boolean(response.qrCodeDataUrl),
        });

        const successMessage =
          response.message || 'Novo QR Code gerado. Configure novamente a autenticação.';

        toast.success(successMessage);
        setMfaState('setup');
        setMfaSetupData({
          message: response.message,
          otpauthUrl: response.otpauth_url,
          qrCodeDataUrl: response.qrCodeDataUrl,
        });
        setMfaHint(null);
        setMfaRecoveryHint(null);
        setPendingEmail(email);
        handleResetDialogOpenChange(false);
        focusMfaField();
      } catch (error) {
        const parsedError =
          error instanceof HttpError
            ? error.message
            : 'Não foi possível reiniciar o MFA. Verifique a senha e tente novamente.';

        logFlowEvent('mfaReset:submit:error', {
          email,
          error: parsedError,
        });

        setResetErrorMessage(parsedError);
        toast.error(parsedError);
      } finally {
        setIsResetSubmitting(false);
      }
    },
    [focusMfaField, form, handleResetDialogOpenChange, logFlowEvent, pendingEmail],
  );

  const handleResetMfaSubmit = resetForm.handleSubmit(onResetSubmit);

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
                          disabled={isSubmitting || isMfaStep}
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
                          disabled={isSubmitting || isMfaStep}
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
                    {mfaState === 'required' && mfaRecoveryHint && (
                      <p className="text-xs text-muted-foreground">{mfaRecoveryHint}</p>
                    )}
                    {pendingEmail && (
                      <p className="text-xs text-muted-foreground">
                        Código referente ao usuário{' '}
                        <span className="font-medium text-foreground">{pendingEmail}</span>
                      </p>
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

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Digite o código numérico exibido no aplicativo autenticador.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {mfaState === 'required' && (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto px-0 text-xs"
                          onClick={() => handleResetDialogOpenChange(true)}
                          disabled={isSubmitting || isResetSubmitting}
                        >
                          Perdi o app autenticador
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto px-0 text-xs"
                        onClick={handleCancelMfa}
                        disabled={isSubmitting}
                      >
                        Usar outra conta
                      </Button>
                    </div>
                  </div>

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

      <Dialog open={isResetDialogOpen} onOpenChange={handleResetDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perdeu o aplicativo autenticador?</DialogTitle>
            <DialogDescription>
              Confirme sua senha para gerar um novo QR Code de autenticação em duas etapas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Um novo código será exibido e você precisará escaneá-lo antes de tentar o login
              novamente.
            </p>
            {pendingEmail && (
              <p className="text-xs text-muted-foreground">
                Solicitação vinculada ao usuário{' '}
                <span className="font-medium text-foreground">{pendingEmail}</span>.
              </p>
            )}
          </div>

          <Form {...resetForm}>
            <form onSubmit={handleResetMfaSubmit} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="password"
                rules={{ required: 'Informe a senha atual para confirmar a ação.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Digite sua senha"
                        disabled={isResetSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {resetErrorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {resetErrorMessage}
                </p>
              )}

              <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleResetDialogOpenChange(false)}
                  disabled={isResetSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isResetSubmitting}>
                  {isResetSubmitting ? 'Gerando...' : 'Gerar novo QR Code'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
