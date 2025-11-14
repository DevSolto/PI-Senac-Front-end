import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DevicesPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Dispositivos IoT</h1>
        <div className="max-w-prose text-base leading-relaxed text-muted-foreground">
          <p>Acompanhe o estado dos dispositivos vinculados aos silos.</p>
        </div>
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
