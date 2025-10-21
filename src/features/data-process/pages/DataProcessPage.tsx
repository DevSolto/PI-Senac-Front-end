import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DataProcessPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Processamentos de Dados</h1>
        <p className="text-muted-foreground">Consulte as agregações e indicadores gerados a partir das leituras dos silos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração com /data-process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta área exibirá os registros de processamento armazenados pelo backend, permitindo explorar métricas como médias, limites e desvios.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
