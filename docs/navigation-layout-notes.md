# Navigation Layout Notes

## Main layout tab handling
- `src/app/layout/MainLayout.tsx` utiliza `useMemo` para separar os itens de navegação exportados em `navigationItems` entre abas primárias (`primary: true`) e secundárias (`primary: false`).
- A aba ativa vem de `useSidebar()`, especificamente do estado `activeTab`; o item correspondente é localizado via `find` por `id` e o componente associado (`component`) é renderizado como `ActiveComponent` dentro da área principal.
- Em telas mobile, o layout mostra o `Header`, depois o `Sidebar`, e finalmente um `<main>` com `ActiveComponent` dentro de um container `div` com `padding` (`p-4`). A navegação inferior fixa renderiza apenas as abas primárias e um botão "More" que dispara `openSidebar()`.
- No desktop, o `Sidebar` fica fixo à esquerda e o conteúdo principal usa `padding` (`p-6`) no `<main>`; não há navegação inferior.

## Navigation item naming
- Em `src/app/routes.tsx` cada item segue o padrão `{ id, label, icon, component, primary? }`.
- `id` utiliza `kebab-case` (ex.: `data-process`) ou minúsculas simples (`alerts`, `silos`), enquanto `label` é capitalizado e em português (ex.: `Alertas`, `Processamentos`).
- O campo opcional `primary` indica as tabs que aparecem tanto no sidebar quanto no menu inferior do mobile.

## UI spacing & typography reference
- `src/features/silos/pages/SilosPage.tsx` aplica `space-y-6` no wrapper para criar espaçamento vertical consistente entre blocos.
- Títulos principais utilizam `h1` com classes `text-3xl font-bold`; subtítulos/descritivos usam `p` com `text-muted-foreground`.
- Cards (`<Card>`) são compostos de `CardHeader`, `CardTitle` e `CardContent`, mantendo a hierarquia tipográfica interna.
