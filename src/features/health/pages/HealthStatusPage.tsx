import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HealthStatusPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Status da Aplicação</h1>
        <div className="max-w-prose text-base leading-relaxed text-muted-foreground">
          <p>Acompanhe o resultado do endpoint de saúde exposto pelo backend.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração com /</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Utilizaremos esta área para validar a disponibilidade do backend por meio do client de health check.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
