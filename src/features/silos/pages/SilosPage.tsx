import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SilosPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Silos</h1>
        <p className="text-muted-foreground">Gerencie os silos monitorados pela plataforma.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração com /silos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta página exibirá a listagem e os detalhes vindos da API de silos assim que os fluxos forem implementados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
