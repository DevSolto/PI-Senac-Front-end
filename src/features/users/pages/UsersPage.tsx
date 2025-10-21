import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">Administre as contas vinculadas às empresas cadastradas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração com /users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Em breve esta tela apresentará listagem, criação e edição de usuários consumindo os endpoints do backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
