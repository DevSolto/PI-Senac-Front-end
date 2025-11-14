import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DataProcessPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Processamentos de Dados</h1>
        <div className="max-w-prose text-base leading-relaxed text-muted-foreground">
          <p>Consulte as agregações e indicadores gerados a partir das leituras dos silos.</p>
        </div>
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
