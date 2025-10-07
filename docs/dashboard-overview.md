# Dashboard – Visão Geral de Implementação

Este documento descreve como o dashboard da rota `/dashboard` foi estruturado, seus componentes principais e o fluxo de dados mockado utilizado durante o desenvolvimento.

## Estrutura de componentes

| Componente | Localização | Responsabilidades principais |
|------------|-------------|------------------------------|
| `DashboardPage` | `src/app/dashboard/page.tsx` | Composição geral da página. Carrega os dados via `useDashboardOverview`, deriva o estado do banner e distribui métricas, alertas e o detalhamento mensal. |
| `DashboardHeader` | `src/features/dashboard/components/dashboard-header.tsx` | Exibe informações da fazenda (nome, safra, localização) e um resumo de sensores online/offline. Recebe `farm` e `sensorStatus` como props. |
| `StatusBanner` | `src/features/dashboard/components/status-banner.tsx` | Banner de estado com região viva (`role="status"`) e badges com contagem de sensores por estado. Props: `sensorStatus`, `variant`, `message` e `className`. |
| `MetricCard` | `src/features/dashboard/components/metric-card.tsx` | Card de KPI com ícone inferido automaticamente, destaque de tendência e descrição. Props: `metric`, `tone`, `icon`, `className`. |
| `CriticalAlertCard` | `src/features/dashboard/components/critical-alert-card.tsx` | Card para cada alerta crítico com resumo, recomendações e botões opcionais de ação (`onAcknowledge`, `onResolve`). |
| `MonthlyAlertsCard` | `src/features/dashboard/components/monthly-alerts-card.tsx` | Representa a distribuição mensal de alertas (gráfico/visualização). Recebe `alerts` como prop. |

### Interatividade e acessibilidade

- As métricas são renderizadas como botões acessíveis (`role="button"`, `aria-label` e foco visível) que, no momento, disparam logs de intenção via `console.info`.
- O botão "Ver todos" dos alertas críticos possui `aria-label="Ver todos os alertas críticos"` e pode ser conectado a uma rota futura.
- O banner de status possui `role="status"` e `aria-live` dinâmico (`assertive` para falhas críticas), permitindo leitura por leitores de tela quando houver mudança de estado.

## Fluxo de dados mockado

1. **Mocks tipados** – O arquivo `src/features/dashboard/mocks.ts` exporta `dashboardOverviewMock`, objeto que segue o contrato definido em `src/features/dashboard/types.ts`.
2. **Hook de dados** – `useDashboardOverview` (`src/features/dashboard/hooks/use-dashboard-overview.ts`) inicializa o estado com o mock, fornece funções `refresh`/`refetch` (promessas resolvendo para o mock) e flags `isLoading`/`isError`.
3. **Consumo na página** – `DashboardPage` usa o hook para obter `data`. Caso `data` seja `null`, nada é renderizado. Quando existe valor, a página deriva `bannerVariant`/`bannerMessage` conforme `sensorsStatus` e contadores de sensores offline ou com bateria crítica.
4. **Atualização periódica** – Um `setInterval` em `DashboardPage` chama `refresh()` a cada 60 segundos. Para trocar o mock por uma chamada real, substitua o corpo de `refetch` por uma requisição HTTP/fetch e mantenha `refresh` como atalho.

### Como atualizar os mocks

1. Ajuste ou acrescente campos nos tipos em `types.ts`.
2. Atualize `dashboardOverviewMock` garantindo aderência ao novo contrato.
3. Se precisar simular estados específicos (ex.: ausência de alertas críticos), crie variantes exportadas adicionais em `mocks.ts`.
4. Caso o hook passe a consumir API real, mantenha os mocks como fallback para testes e Storybook (exportando-os separadamente).

## Testes e validações

- **React Testing Library** – Os testes em `src/features/dashboard/__tests__/dashboard-page.test.tsx` cobrem:
  - Renderização das métricas como controles acessíveis e resposta ao clique.
  - Banner de status com região viva e contagens de sensores.
  - Lista de alertas críticos, ação de "Ver todos" e estado vazio.
- **Tokens de cor** – O arquivo `src/styles/__tests__/color-contrast.test.ts` valida o contraste mínimo (AA) entre pares de variáveis de cor nos temas claro e escuro (`background`, `muted`, `secondary`, `accent` e `destructive`).

Para executar os testes, utilize `npm run test` (Vitest + jsdom). O arquivo `vitest.setup.ts` configura o ambiente, inclui asserções do `@testing-library/jest-dom` e silencia warnings durante a suíte.
