# Quarta Colonia Monorepo

Monorepo com:

- `server/` API Fastify + TypeScript
- `quarta-colonia/` site público (portal)
- `adm/` painel admin
- `packages/api/` cliente API compartilhado
- `packages/ui/` tema compartilhado do ecossistema

## Rodar o projeto

```bash
npm i
npm run dev
```

## Variáveis de ambiente

Use estes valores nos frontends:

- `VITE_API_URL=http://localhost:3005`

Arquivos:

- `quarta-colonia/.env`
- `adm/.env`

## Home do site (plan.md)

A home do `quarta-colonia` foi definida para seguir o portal do `plan.md`:

- Header com barra de data e ticker urgente
- Sidebar esquerda
- Hero principal
- Banner de publicidade
- Grid de notícias
- Seção "Mais notícias"
- Sidebar direita
- Footer

Mesmo com API sem dados, o layout completo permanece visível com placeholders.
