# Levantamento de Requisitos de Dados

## Entidade `users`
- **Campos obrigatórios**: `name`, `email`, `password`, `role`, `mfa`, `companyId`, `createdAt`, `updatedAt`.
- **Fontes de verdade**: os contratos de API expõem esses campos como parte da entidade `users` e devem orientar todas as telas que consomem esses dados.

## Listagem de usuários
- Exibir exatamente os campos entregues pelo backend considerados obrigatórios.
- Garantir que as colunas/labels sejam equivalentes às chaves: nome completo, e-mail, perfil (`role`), status do MFA e empresa vinculada.
- Os carimbos de criação (`createdAt`) e atualização (`updatedAt`) devem ser apresentados em formato legível, respeitando a localidade e o padrão de data da aplicação.

## Formulário de usuários
- O formulário de criação/edição precisa solicitar os mesmos campos obrigatórios para manter paridade com o backend.
- Validar presença e formato de `name`, `email` e `password` antes do envio.
- Oferecer seleção controlada para `role` (ex.: dropdown) e associação com a companhia (`companyId`).
- Incluir controles para habilitar/desabilitar MFA.
- `createdAt` e `updatedAt` são exibidos apenas em modo de visualização/edição, sendo preenchidos automaticamente pelo backend.
