# Quarta Colonia Monorepo

Monorepo com:

- `server/` API Fastify + TypeScript
- `quarta-colonia/` site publico
- `adm/` painel admin
- `packages/api/` cliente API compartilhado
- `packages/ui/` tema compartilhado do ecossistema

## Rodar o projeto

```bash
npm i
npm run dev
```

## Variaveis de ambiente

Use estes valores nos frontends:

- `VITE_API_URL=http://localhost:3005`

Arquivos:

- `quarta-colonia/.env`
- `adm/.env`

## Home do site

A home do `quarta-colonia` segue o portal definido no projeto:

- Header com barra de data e ticker urgente
- Sidebar esquerda
- Hero principal
- Banner de publicidade
- Grid de noticias
- Secao "Mais noticias"
- Sidebar direita
- Footer

Mesmo com API sem dados, o layout completo permanece visivel com placeholders.

## Deploy Cloud Run

Use deploy por imagem Docker. Nao use `gcloud run deploy --source`, porque esse fluxo pode usar buildpacks em vez do `Dockerfile`.

Build e deploy:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/quarta-colonia .

gcloud run deploy quarta-colonia \
  --image gcr.io/PROJECT_ID/quarta-colonia \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated
```

Script PowerShell incluido:

```bash
npm run deploy:cloudrun -- -ProjectId PROJECT_ID
```

O script:

- usa `gcloud builds submit`, que constroi a imagem com o `Dockerfile` da raiz
- faz deploy com `--image`, evitando buildpacks
- valida `GET /health` e `GET /api/news` apos o deploy

Importante:

- o backend sobe pelo entrypoint compilado `dist/index.js`
- o startup log imprime `app.printRoutes()` para confirmar que as rotas foram registradas
- se existir Continuous Deployment via Cloud Run ou Developer Connect, desative isso no Console do Google Cloud, porque essa configuracao e externa ao repositorio e nao e controlada por este codigo
