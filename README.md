# PI Senac Front-end

Aplicação front-end desenvolvida para o Projeto Integrador do Senac. O objetivo é oferecer uma base em React com Vite e TypeScript pronta para receber os módulos que serão construídos ao longo do projeto.

## Pré-requisitos
- Node.js 20+
- PNPM ou NPM

## Instalação
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse a aplicação em `http://localhost:5173` (ou a porta indicada no terminal).

## Build de produção
Gere a versão otimizada executando:
```bash
npm run build
```

## Testes
Execute a suíte de testes unitários com Jest e Testing Library usando:
```bash
npm test
```

## Variáveis de ambiente
- Crie um arquivo `.env` (ou `.env.local`) na raiz do projeto para configurar valores como `VITE_API_URL`, `API_URL` ou `COLLECT_LISTING_URL`.
- Em modo de desenvolvimento o Vite expõe automaticamente as variáveis iniciadas com `VITE_` no `import.meta.env`.
- Para Jest, scripts Node e a CLI (`npm run collect`), o arquivo `load-env.js` garante o carregamento dos arquivos `.env`, `.env.local`, `.env.<modo>` e `.env.<modo>.local` respeitando a ordem de precedência, permitindo que todos os contextos compartilhem a mesma configuração.

## Coleta via CLI
Para disparar a rotina de coleta em linha de comando execute:

```bash
npm run collect -- --all \
  --audit-listing-html \
  --listing-url="https://exemplo.com/listagem"
```

- `--audit-listing-html`: salva o HTML da primeira página de listagem para auditoria.
- `--listing-url`: define qual URL deve ser baixada (pode ser informada via `COLLECT_LISTING_URL`).
- `--audit-output`: permite customizar o diretório de saída (padrão `audits/listing-pages`).

## Estrutura básica
- `index.html`: ponto de entrada do Vite.
- `src/`: código-fonte da aplicação React.
- `vite.config.ts`: configuração do Vite.
