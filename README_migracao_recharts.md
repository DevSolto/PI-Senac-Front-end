# Migração para Recharts

Este repositório utiliza o [Recharts](https://recharts.org/en-US) para renderizar os gráficos do dashboard.

## Principais decisões

- Todos os componentes de gráficos vivem em `src/components/charts/recharts`.
- Os gráficos compartilham padrões de layout: `ResponsiveContainer`, `CartesianGrid` com `strokeDasharray="3 3"`, tooltips customizados e legendas alinhadas na base.
- Estados de carregamento usam `Skeleton`; estados vazios exibem uma chamada para ajustar filtros.
- Formatações numéricas e de datas estão centralizadas em `src/lib/formatters.ts` (`fmtTemp`, `fmtPerc`, `fmtAQI`, `fmtData`).
- Alerts e erros são tratados no `Dashboard`, com `Alert` e botão de tentativas.

## Como adicionar um novo gráfico

1. Crie o componente em `src/components/charts/recharts` seguindo os padrões de estilo e acessibilidade.
2. Utilize os formatadores exportados de `src/lib/formatters.ts` para eixos e tooltips.
3. Envolva o gráfico com `ResponsiveContainer` para garantir responsividade.
4. Atualize ou acrescente testes em `src/components/charts/__tests__` para cobrir o novo componente.
5. Ajuste as telas que consomem o gráfico garantindo estados de loading/empty/error coerentes.

## Execução de testes

```bash
pnpm test
```

Os testes incluem smoke tests para os principais componentes de gráfico Recharts.
