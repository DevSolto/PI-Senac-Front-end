# Fluxo visual da tela de Silos

Este documento resume o funcionamento atual da tela de Silos após as últimas atualizações de interface e formulários.

## Tela principal (`src/features/silos/pages/SilosPage.tsx`)
- O cabeçalho exibe título, descrição curta e o botão **Novo silo** (`CreateSiloDialog`).
- Enquanto os dados estão carregando (`status === 'loading'`), a grade apresenta 6 cartões esqueleto (`SiloCardSkeleton`).
- Em caso de falha na busca (`error` preenchido), um `<Card>` de erro orienta o usuário a verificar a conexão e tentar novamente.
- Quando não existem silos cadastrados, um estado vazio ocupa toda a largura da grade com instrução para iniciar um cadastro.
- Após um cadastro bem-sucedido, o hook `useSilos().append` insere o silo recém-criado no topo da lista sem recarregar a página.

## Modal de criação (`src/features/silos/components/CreateSiloDialog.tsx`)
- Campos obrigatórios: **Nome**, **Grão** e **Empresa** (Select). Regras `required` exibem mensagens contextuais.
- Campo booleano **Em operação** usa `<Switch>` com estado inicial `true`.
- Campos numéricos (temperatura, umidade, qualidade do ar) utilizam `NumericField`, que valida o conteúdo com `normalizeNumberInput`.
- Na submissão, `parseNumber` converte strings vazias em `undefined`, garantindo que limites não informados sejam omitidos em `CreateSiloDto`.
- `description` também é normalizada: strings vazias viram `undefined` após `trim()`.
- `createSilo` serializa o payload e ignora chaves `undefined`, alinhando-se ao comportamento esperado pela API.

## Estados especiais
- Sem empresas carregadas: o `<Select>` fica desabilitado, mostra mensagem de orientação e oferece botão "Tentar novamente" quando há erro ao listar empresas.
- Em caso de erro na criação, um toast com feedback negativo é disparado; sucesso fecha o modal, reseta o formulário e exibe toast positivo.

## Observações para QA manual
- Validar que valores numéricos em branco permanecem vazios após reabrir o modal e não são enviados ao backend.
- Confirmar que o estado de carregamento do select de empresas é restaurado quando o modal é reaberto.
- Realizar smoke test: abertura da página, simulação de falha na listagem de silos (verificar card de erro), interação do modal sem empresas e cadastro completo observando atualização instantânea da grade.
