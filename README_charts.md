# Guia de gráficos do dashboard

Este documento descreve o estado atual da camada de gráficos do dashboard, como reutilizar os utilitários de `shadcn/ui` e como adicionar novos gráficos mantendo responsividade, temas claro/escuro e paridade com os componentes legados.

## Visão geral das camadas

- **Componentes legados (`src/components/charts`)**: implementações baseadas na primeira migração para Recharts. Continuam disponíveis através de `DashboardChartsLegacy` para comparação visual e como fallback.
- **Variante shadcn/ui (`src/components/dashboard/charts`)**: camada moderna construída com os componentes de cartão, tipografia e utilitários do kit shadcn/ui. É a implementação exibida por padrão em `DashboardChartsShadcn`.

Ambas as camadas recebem as mesmas `series` vindas de `src/lib/metrics.ts` e são orquestradas pela página `src/pages/Dashboard.tsx`. Para manter os dados sincronizados, qualquer novo gráfico deve aceitar os mesmos tipos de pontos definidos em `@/lib/metrics`.

## Utilitários compartilhados da camada shadcn/ui

Todos os gráficos modernos ficam dentro de `src/components/dashboard/charts` e usam alguns utilitários centrais:

### `ChartCard`
Responsável por aplicar o `Card` shadcn/ui, gerenciar estados de carregamento (`Skeleton`) e vazios e garantir alturas consistentes.

### `ChartContainer`
Wrapper declarado em `src/components/ui/chart.tsx`. Ele recebe um `config` do tipo `ChartConfig` e injeta `--color-{dataKey}` como variáveis CSS na árvore do gráfico. Sempre que você adicionar uma nova série, inclua `label` e `color` no `config` para que tooltips e legendas reflitam a cópia correta.

```ts
export type ChartConfig = Record<string, { label?: string; color?: string }>;
```

### `ChartTooltipContent` e `ChartLegendContent`
Ambos leem o contexto fornecido pelo `ChartContainer` para usar os labels/cor definidos no `config`. Use-os dentro de `ChartTooltip` e `ChartLegend` para manter a consistência com o tema shadcn.

### Variáveis `--chart-*`
Os valores padrão vivem em `src/index.css` nas seções `:root` e `.dark`. Utilize `hsl(var(--chart-X))` ao montar o `ChartConfig` para herdar automaticamente as cores em ambos os temas. Caso precise de novas paletas, declare novas variáveis seguindo o padrão `--chart-8`, etc., em `src/index.css`.

## Exemplo completo

```tsx
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartCard } from '@/components/dashboard/charts/ChartCard';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  avg: { label: 'Temperatura média (°C)', color: 'hsl(var(--chart-1))' },
  max: { label: 'Temperatura máxima (°C)', color: 'hsl(var(--chart-2))' },
  min: { label: 'Temperatura mínima (°C)', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

export function TemperatureChart({ data, isLoading, isEmpty }) {
  return (
    <ChartCard
      title="Temperatura ao longo do tempo"
      description="Evolução das temperaturas média, mínima e máxima."
      isLoading={isLoading}
      isEmpty={isEmpty || data.length === 0}
      height={320}
    >
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line dataKey="avg" className="stroke-[--color-avg]" />
            <Line dataKey="max" className="stroke-[--color-max]" />
            <Line dataKey="min" className="stroke-[--color-min]" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
```

O exemplo acima destaca:
- `ChartCard` controla o layout responsivo do cartão e estados derivados das props `isLoading`/`isEmpty`.
- `ChartContainer` expõe `ChartConfig` para os conteúdos de tooltip/legenda.
- Os componentes do Recharts permanecem dentro de `ResponsiveContainer` para responsividade automática.

## Como adicionar um novo gráfico

1. **Localização**: crie um novo arquivo em `src/components/dashboard/charts` (ex.: `SoilMoistureChart.tsx`). Caso o gráfico precise permanecer na camada anterior para manter paridade, adicione também um equivalente em `src/components/charts`.
2. **Estrutura base**: importe e reutilize `ChartCard`, `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend` e `ChartLegendContent`. Configure `ChartConfig` com `label`/`color` baseados nas variáveis `--chart-*` para suportar temas claro/escuro.
3. **Dados**: receba como prop uma série definida em `src/lib/metrics.ts`. Se precisar de um novo shape de dado, exporte o tipo e garanta que os hooks que montam `metrics` (ver `buildLineSeries` em `src/lib/metrics.ts` e o consumo em `src/pages/Dashboard.tsx`) produzam essa série para ambas as camadas.
4. **Responsividade**: envolva o gráfico com `ResponsiveContainer` e use alturas consistentes (ex.: `ChartCard` com `height={320}`) para manter a malha de `DashboardChartsShadcn` alinhada.
5. **Temas e acessibilidade**: utilize classes utilitárias (`stroke-[--color-key]`, `fill-muted/30`, etc.) e mantenha `accessibilityLayer` do Recharts habilitado. Preserve estados de carregamento/vazio usando as props `isLoading`/`isEmpty` herdadas de `DashboardChartsShadcn`.
6. **Integração**: registre o novo componente em `src/components/dashboard/DashboardChartsShadcn.tsx`, passando os dados corretos. Se desejar paridade com a versão legada, espelhe-o em `DashboardChartsLegacy`.
7. **Testes/Storybook**: utilize os mocks em `src/lib/mock/timeSeries.ts` ou nos testes de componentes para validar o comportamento. Reaproveite os mesmos formatadores (`src/lib/formatters.ts`) nos eixos e tooltips para garantir consistência textual.

Seguindo os passos acima, futuros contribuidores conseguem estender o dashboard sem quebrar o padrão visual estabelecido ou duplicar lógica de dados.
