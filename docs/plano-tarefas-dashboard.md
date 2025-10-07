# Plano de Tarefas – Dashboard "Silos Monitor"

Lista priorizada de atividades para implementar, em Next.js com shadcn/ui, o dashboard descrito no prompt, agora considerando suporte completo a PWA (Progressive Web App) para experiência offline e instalação.

## 1. Preparação do projeto
- [ ] Criar projeto Next.js com TypeScript (`npx create-next-app@latest`) já com suporte a `app router`.
- [ ] Configurar Tailwind CSS e postcss conforme documentação do Next.
- [ ] Integrar shadcn/ui (comando `pnpm dlx shadcn-ui@latest init`).
- [ ] Definir estrutura de pastas em `src/` seguindo padrão do README.
- [ ] Configurar ESLint/Prettier e scripts básicos (`lint`, `format`).
- [ ] Instalar dependências para PWA (ex.: `next-pwa` ou config `next.config.mjs` com `@ducanh2912/next-pwa`).
- [ ] Criar manifesto web (`public/manifest.json`) com ícones, cores de tema e nome "Silos Monitor".
- [ ] Adicionar ícones em múltiplas resoluções para instalação (Android/desktop) em `public/icons`.

## 2. Fundamentos de UI compartilhada
- [ ] Criar tema/preset de cores seguindo paleta proposta (primária azul, estados OK/Atenção/Risco etc.).
- [ ] Implementar tipografia global e tokens de espaçamento em `globals.css`.
- [ ] Adicionar componentes utilitários (botões, badges, cards, tooltips, tabs) via shadcn/ui.
- [ ] Configurar ícones (ex.: `lucide-react`) e mapa de importação centralizado.
- [ ] Criar componentes de feedback (skeleton, banners de estado, empty states).

## 3. Layout base
- [ ] Criar layout raiz (`src/app/layout.tsx`) com fontes, tema e provedores necessários.
- [ ] Implementar shell principal com `Topbar` fixa, `Sidebar` fixa e área de conteúdo central.
- [ ] Garantir responsividade mínima para resolução 1440x900 e estados menores (scroll interno).
- [ ] Preparar componentes globais para reagirem a estados online/offline (contexto de conectividade).

## 4. Topbar
- [ ] Adicionar logotipo (ícone de silo) + nome "Silos Monitor".
- [ ] Exibir indicador de conectividade com estados Online/Offline usando API de Network Information ou fallback.
- [ ] Implementar relógio ou label de "Última sincronização" atualizável.
- [ ] Adicionar botões "Criar Relatório", "Ajuda" e avatar com menu (Perfil, Sair).
- [ ] Tratar estado offline: banner e ocultar botões de exportação em tempo real.
- [ ] Exibir CTA "Instalar app" quando disponível (prompt PWA) na topbar ou menu do usuário.

## 5. Sidebar
- [ ] Criar lista de navegação com itens Dashboard, Silos, Alertas, Relatórios, Configurações.
- [ ] Adicionar badges numéricos em Alertas.
- [ ] Definir lógica de estado ativo e tooltips para itens bloqueados por permissão.

## 6. Cabeçalho do conteúdo
- [ ] Implementar título "Dashboard" com filtros horizontais (Safra, Cultura, Local/Unidade, Status, Ordenar).
- [ ] Adicionar campo de busca ("Buscar silo…") e exibir chips de filtros ativos.
- [ ] Criar botões "Exportar CSV" e "Exportar PDF" obedecendo estados de permissão/offline.
- [ ] Incluir indicativo visual quando dados estão provenientes de cache offline.

## 7. Cards de KPI
- [ ] Montar grade 4 colunas com cards: "Silos monitorados", "Alertas ativos", "% Silos OK", "Temperatura média (24h)".
- [ ] Incluir ícones, microtendência (seta ↑/↓) e destaque visual quando houver alertas.
- [ ] Conectar cards a dados mockados e preparar hooks de dados futuros.

## 8. Lista de Silos
- [ ] Criar componente `SiloList` com rolagem e itens detalhados (nome, status chip, mini indicadores T/UR/CO₂, último alerta).
- [ ] Implementar seleção de silo e estado de vazio ("Cadastrar Silo").
- [ ] Adicionar indicações de alerta (cores + tempo relativo).

## 9. Painel de Detalhes do Silo
- [ ] Estruturar `SiloDetail` com cabeçalho (nome, status, ações: Reconhecer alerta, Criar tarefa/checklist, Ver histórico).
- [ ] Criar tabs: Leituras, Alertas, Ações/Checklists, Histórico/Logs.
- [ ] Adicionar heatmap vertical simplificado com legenda.
- [ ] Preparar modal de confirmação para "Reconhecer" e modal de nota para "Resolver".
- [ ] Implementar tabela/lista para histórico exportável.

## 10. Dados e estado
- [ ] Criar mocks tipados para KPIs, lista de silos e alertas.
- [ ] Definir hooks para sincronização de dados e simulação de estados (offline, vazio, sem alertas).
- [ ] Planejar integração futura com backend/IoT (definir interfaces e endpoints esperados).
- [ ] Estruturar camada de persistência local (IndexedDB/localforage) para armazenar leituras e alertas offline.
- [ ] Mapear políticas de cache do service worker (estratégias `Stale-While-Revalidate`, cache-first para assets, network-first para dados críticos).
- [ ] Implementar fila de ações offline (ex.: reconhecer alerta) para sincronizar quando a conexão for restabelecida.

## 11. Acessibilidade e usabilidade
- [ ] Garantir foco visível, navegação por teclado e tooltips.
- [ ] Validar contraste das cores e tamanhos mínimos de fonte.
- [ ] Adicionar mensagens de carregamento (skeleton/spinner) e erros.

## 12. Testes e QA
- [ ] Configurar testes com Playwright/React Testing Library para componentes críticos.
- [ ] Criar testes unitários para componentes de status e listas.
- [ ] Validar layout em diferentes navegadores/resoluções (quando possível).
- [ ] Testar instalação PWA em navegadores desktop/mobile e comportamento offline.
- [ ] Verificar métricas Lighthouse (categoria PWA) e ajustar manifest/service worker conforme recomendações.

## 13. Funcionalidades PWA
- [ ] Configurar geração do service worker (build) com cache automático dos assets do Next.
- [ ] Implementar atualização do service worker com notificação ao usuário para recarregar quando nova versão estiver disponível.
- [ ] Adicionar tela de fallback offline amigável para rotas críticas.
- [ ] Garantir que o app funcione como standalone (display `standalone`, orientation `landscape`) no manifesto.
- [ ] Criar documentação de deploy com HTTPS obrigatório e cabeçalhos para PWA.

## 14. Documentação
- [ ] Atualizar README com instruções específicas do dashboard, scripts de dados e requisitos PWA.
- [ ] Criar documentação de componentes (Storybook opcional) ou MDX em `docs/`.
- [ ] Registrar fluxos principais e convenções de código.
