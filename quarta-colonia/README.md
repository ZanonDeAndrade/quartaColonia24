# Quarta Colonia (Site Público)

Frontend Vite + React + TypeScript + Tailwind + shadcn tokens locais.

## Configuração

Crie `quarta-colonia/.env`:

```env
VITE_API_URL=https://quarta-colonia-755008866679.southamerica-east1.run.app
```

## Desenvolvimento

```bash
npm run dev
```

## Home (portal do plan.md)

A rota `/` renderiza `PortalHome` com:

- barra de data no topo
- header azul com logo/menu/busca
- ticker urgente
- sidebar esquerda
- hero principal
- banner de publicidade
- grid de notícias
- seção mais notícias
- sidebar direita
- footer completo

Se a API retornar vazio, o layout completo permanece com placeholders (sem tela branca).
