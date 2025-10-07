export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto flex w-full flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            GrãoSeguro
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Painel de Monitoramento Agrícola
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Acompanhe indicadores de clima, produtividade e gestão de riscos para uma tomada de decisão mais eficiente no campo.
          </p>
        </header>
        <section className="grid gap-4 rounded-xl border border-border bg-background/80 p-6 shadow-sm backdrop-blur">
          <p className="text-sm text-muted-foreground">
            Os cards e visualizações do dashboard serão adicionados em breve.
          </p>
        </section>
      </div>
    </main>
  );
}
