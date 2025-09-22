# PI Senac Front-end

Bem-vindo ao repositório do front-end do Projeto Integrador do Senac. Este projeto será construído com **Next.js** e utilizará a biblioteca de componentes **shadcn/ui** para acelerar o desenvolvimento de interfaces modernas e acessíveis. Além disso, serão implementados gráficos interativos para visualização de dados relevantes do projeto.

## 🚀 Tecnologias

- [Next.js](https://nextjs.org/) – Framework React para construção de aplicações web escaláveis com renderização híbrida.
- [shadcn/ui](https://ui.shadcn.com/) – Coleção de componentes UI reutilizáveis baseada em Radix UI e Tailwind CSS.
- [TypeScript](https://www.typescriptlang.org/) – Superset tipado do JavaScript para maior segurança e produtividade.
- [Tailwind CSS](https://tailwindcss.com/) – Framework CSS utilitário para criação rápida de layouts responsivos.
- [TanStack Query](https://tanstack.com/query) (opcional) – Gerenciamento de estado assíncrono e cache de dados.
- Biblioteca de gráficos (a definir, ex.: [Recharts](https://recharts.org/), [Chart.js](https://www.chartjs.org/) ou [ECharts](https://echarts.apache.org/)).

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [pnpm](https://pnpm.io/) (recomendado) ou npm/yarn
- Git

## 🔧 Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/<seu-usuario>/PI-Senac-Front-end.git
cd PI-Senac-Front-end
pnpm install # ou npm install / yarn install
```

## ▶️ Executando a aplicação em desenvolvimento

Inicie o servidor de desenvolvimento do Next.js:

```bash
pnpm dev # ou npm run dev / yarn dev
```

A aplicação ficará disponível em `http://localhost:3000` com recarregamento automático.

## 🧰 Scripts úteis

| Comando             | Descrição                                                    |
| ------------------- | ------------------------------------------------------------ |
| `pnpm dev`          | Executa o servidor de desenvolvimento.                        |
| `pnpm build`        | Gera a build de produção.                                     |
| `pnpm start`        | Inicia a aplicação em modo de produção (após `pnpm build`).   |
| `pnpm lint`         | Executa a verificação de lint para manter a qualidade do código. |

> Substitua `pnpm` por `npm run` ou `yarn` conforme o gerenciador de pacotes escolhido.

## 🗂️ Estrutura sugerida

```
PI-Senac-Front-end/
├── src/
│   ├── app/              # Rotas e páginas do Next.js
│   ├── components/       # Componentes reutilizáveis (shadcn/ui e customizados)
│   ├── features/         # Módulos de funcionalidades do Projeto Integrador
│   ├── lib/              # Utilidades, hooks, serviços e integrações
│   └── styles/           # Configurações do Tailwind e estilos globais
├── public/               # Assets estáticos
├── .env.example          # Variáveis de ambiente de exemplo
└── README.md
```

## 🎨 Componentes com shadcn/ui

- Utilize o CLI oficial (`pnpm dlx shadcn-ui@latest init`) para configurar os componentes.
- Gere novos componentes com `pnpm dlx shadcn-ui@latest add <componente>`.
- Personalize os temas no arquivo `tailwind.config.ts` e nas camadas CSS em `globals.css`.

Consulte a [documentação do shadcn/ui](https://ui.shadcn.com/docs) para exemplos e boas práticas.

## 📊 Gráficos e visualizações de dados

- Escolha a biblioteca de gráficos que melhor atende às necessidades do projeto.
- Centralize a lógica de formatação e transformação de dados em hooks ou serviços dentro de `src/lib/`.
- Crie componentes de gráficos reutilizáveis em `src/components/charts/` para manter consistência visual.

## ✅ Boas práticas

- Priorize componentes acessíveis e responsivos.
- Utilize a tipagem do TypeScript para garantir segurança nas integrações.
- Configure linting e formatação automatizada (ESLint/Prettier).
- Escreva testes automatizados para componentes críticos quando possível.

## 📄 Licença

Defina aqui a licença do projeto (por exemplo, MIT, Apache 2.0 ou proprietária), conforme a necessidade do time.

---

Sinta-se à vontade para ajustar este README conforme o projeto evoluir e novos requisitos forem adicionados.
