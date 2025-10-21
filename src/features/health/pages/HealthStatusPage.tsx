import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HealthStatusPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Status da Aplicação</h1>
        <p className="text-muted-foreground">Acompanhe o resultado do endpoint de saúde exposto pelo backend.</p>
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
