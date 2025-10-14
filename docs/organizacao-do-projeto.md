# Organização do Projeto AgroSense AI Dashboard

## Visão geral
O repositório contém uma aplicação web construída com React 18, Vite e TypeScript para demonstrar o dashboard "AgroSense AI" baseado no design comunitário do Figma. Os dados exibidos são simulados e estão codificados diretamente nos componentes para possibilitar a visualização dos fluxos de monitoramento agrícola, clima, pragas, finanças e operações.

## Ferramentas e scripts
- **Gerenciador de pacotes**: o projeto usa PNPM/NPM com dependências descritas em `package.json`, incluindo a coleção de componentes do shadcn/ui (Radix UI + Tailwind), bibliotecas de gráficos (Recharts), ícones (`lucide-react`) e utilitários para composição de classes.
- **Scripts disponíveis**: `npm run dev` para desenvolvimento e `npm run build` para gerar a versão final por meio do Vite.
- **Configuração do Vite**: `vite.config.ts` aplica o plugin `@vitejs/plugin-react-swc`, define aliases para travar versões específicas das dependências e expõe o app na porta 3000 com saída em `build/`.

## Estrutura de pastas principal
```
/
├── index.html              # ponto de entrada estático do Vite
├── package.json            # metadados, scripts e dependências
├── src/                    # código-fonte da aplicação
│   ├── main.tsx            # bootstrap do React
│   ├── App.tsx             # layout base, navegação e tema
│   ├── index.css           # bundle Tailwind gerado
│   ├── Attributions.md     # créditos de recursos externos
│   ├── components/         # páginas e biblioteca de UI
│   │   ├── *.tsx           # módulos de dashboard (Overview, FieldMap, etc.)
│   │   ├── Mobile*.tsx     # variantes móveis compactas
│   │   ├── figma/          # utilitários ligados ao design (ImageWithFallback)
│   │   └── ui/             # componentes reutilizáveis derivados do shadcn/ui
│   ├── styles/globals.css  # tokens de tema claro/escuro e utilitários
│   └── guidelines/         # espaço reservado para diretrizes do projeto
├── vite.config.ts          # configuração de build e aliases
└── docs/                   # documentação interna (ex.: este arquivo)
```

## Fluxo de inicialização e navegação
1. `index.html` define o elemento `#root` que receberá a aplicação e importa `src/main.tsx` como módulo Vite.
2. `main.tsx` cria a raiz do React e renderiza `<App />`.
3. `App.tsx` centraliza o estado global do dashboard: controle da aba ativa, alternância claro/escuro, detecção de viewport móvel e abertura do menu lateral. A lista `navigationItems` mapeia ícones, rótulos e componentes (inclusive variantes móveis) para cada seção do dashboard.
4. No desktop, o componente renderiza uma sidebar fixa com contadores de alertas e ferramentas de filtragem; no mobile, ativa um cabeçalho compacto, drawer lateral e troca automaticamente para componentes otimizados (`MobileOverview`, `MobileFieldMap`).

## Páginas e módulos funcionais
Os arquivos em `src/components` representam páginas ou módulos especializados do dashboard. Eles seguem um padrão de uso de cartões, grades e gráficos baseados nos componentes utilitários da pasta `ui/`.

- **OverviewDashboard.tsx** – reúne indicadores-chave (hectares, saúde da safra, rendimento), gráficos de linha/área e alertas resumidos para oferecer uma visão geral do negócio agrícola.
- **FieldMap.tsx** – fornece um mapa estilizado com polígonos dos talhões, controles de camada (satélite, NDVI, clima) e lista de detalhes do campo selecionado, incluindo alertas e estações meteorológicas.
- **FieldManagement.tsx** – organiza a gestão de campos com buscas, filtros, abas temáticas (visão geral, planejamento, operações e histórico) e cards de cada talhão com métricas de irrigação e saúde.
- **SatelliteMonitor.tsx, FleetManagement.tsx, HardwareStatus.tsx** – apresentam telemetria de satélites, logística da frota e status de dispositivos IoT usando tabelas, badges e gráficos (estruturas semelhantes às demais páginas).
- **AgriWeatherAI.tsx** – exibe previsão meteorológica com métricas instantâneas e gráfico de linha de 7 dias para temperatura, chuva, umidade e vento.
- **AgroPestAI.tsx** – concentra alertas de pragas, distribuições de severidade e histórico recente com badges e componentes de alerta personalizados.
- **EconomicDashboard.tsx** – traz painéis financeiros (receita, custos, lucro, ROI) e gráfico comparativo por cultura para análise econômica.
- **TaskManagement.tsx, AlertsPage.tsx, Analytics.tsx, MessagesReports.tsx, Integrations.tsx** – cobrem tarefas, alertas detalhados, análises avançadas, relatórios/mensagens e integrações de sistemas com padrões visuais consistentes (cards, tabelas e componentes Radix).
- **MobileOverview.tsx** e **MobileFieldMap.tsx** – versões enxutas para telas pequenas, com grades 2x2 de métricas, listas compactas de alertas e interações simplificadas.

## Biblioteca de UI reutilizável
A pasta `src/components/ui` agrupa componentes extraídos do shadcn/ui com estilização Tailwind, como `button`, `card`, `tabs`, `dialog`, `table`, `badge` e hooks auxiliares (`use-mobile`, `utils`). Esses blocos provêm a base visual e comportamental usada em todas as páginas, mantendo consistência e reduzindo duplicação.

## Estilos e temas
- `src/index.css` contém o build do Tailwind CSS (camadas `@layer` de base, componentes e utilitários) que habilita tokens e utilidades usados nas classes utilitárias dos componentes.
- `src/styles/globals.css` define variáveis de cor personalizadas para a identidade agrícola (tons de verde, amarelo, laranja) e o espelho em modo escuro, além de utilidades como `@custom-variant dark`. O arquivo é importado pelos componentes shadcn para fornecer tokens de tema reutilizáveis.

## Suporte a responsividade e tema
- `App.tsx` alterna a classe `dark` no `documentElement` para aplicar o tema escuro definido nos estilos globais, além de reagir à largura da janela para exibir a navegação móvel.
- O hook `useIsMobile` disponibiliza uma API reutilizável para detectar o breakpoint de 768px, caso seja necessário em novos componentes.

## Arquivos de apoio
- `src/Attributions.md` registra as licenças de componentes shadcn/ui e imagens do Unsplash utilizadas no design original.
- `src/guidelines/Guidelines.md` atua como placeholder para instruções adicionais do time (atualmente vazio e pronto para ser preenchido).
- A pasta `docs/` (criada neste trabalho) armazena documentação interna, permitindo incluir novas referências sem poluir a raiz do projeto.
