# Plano da Feature: Dashboard Operacional

## Objetivo

Construir o painel principal de monitoramento utilizando os agregados do endpoint `/data-process`, permitindo filtros por período e silos, exibição de KPIs resumidos, gráficos de tendência e uma tabela detalhada do histórico.

## Arquitetura

```
src/
├─ pages/Dashboard.tsx
├─ hooks/useFilters.ts
├─ lib/
│  ├─ api.ts
│  ├─ metrics.ts
│  └─ date.ts
├─ components/
│  ├─ kpi/KpiCard.tsx
│  ├─ filters/DateRange.tsx
│  ├─ filters/SiloMultiSelect.tsx
│  ├─ charts/LineTemperature.tsx
│  ├─ charts/LineHumidity.tsx
│  ├─ charts/BarAlerts.tsx
│  ├─ charts/PieDistribution.tsx
│  └─ table/DataTable.tsx
└─ components/ui/ (extensões do shadcn/ui)
```

## Fluxo de Dados

1. `Dashboard.tsx` lê a query string (`from`, `to`, `silos`) via `useFilters`.
2. O hook dispara `useQuery(['data-process'], fetchDataProcess, { refetchInterval: 300000 })`.
3. `lib/api.ts` chama `fetch('/data-process')`, valida com `ReadDataProcessSchema` (Zod), normaliza datas com `America/Recife` e ordena por `periodStart`.
4. O resultado é filtrado em memória pelos filtros ativos; `lib/metrics.ts` agrega dados para KPIs, gráficos e tabela utilizando `useMemo`.
5. Componentes de UI consomem esses dados já preparados.
6. O botão **“Atualizar agora”** aciona `refetch()`, com feedback via toasts (`sonner`) e skeletons durante o carregamento.

## Casos de Uso Principais

- Operador ajusta o período e compara tendências de temperatura/umidade.
- Gestor seleciona um conjunto de silos para avaliar alertas críticos e score ambiental.
- Equipe de manutenção exporta a tabela filtrada para inspeções manuais.

## Considerações

- Manter a memoização das agregações para evitar cálculos desnecessários.
- Validar eventuais erros da API e apresentar feedback amigável.
- Permitir expansão futura com novos gráficos apenas estendendo `lib/metrics.ts` e adicionando componentes especializados.
