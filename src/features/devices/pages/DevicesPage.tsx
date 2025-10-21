import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DevicesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispositivos IoT</h1>
        <p className="text-muted-foreground">Acompanhe o estado dos dispositivos vinculados aos silos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração com /devices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Em breve você poderá visualizar o status em tempo real, histórico e comandos enviados aos dispositivos cadastrados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
