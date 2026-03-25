# syntax=docker/dockerfile:1.7

########################
# STAGE 1 - BUILD
########################
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas manifests para instalar deps (cache eficiente)
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY adm/package.json adm/package.json
COPY quarta-colonia/package.json quarta-colonia/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/theme/package.json packages/theme/package.json
COPY packages/ui/package.json packages/ui/package.json

# Instala dependências do workspace server
RUN npm ci --workspace server --include-workspace-root=false

# Copia código do server
COPY server/tsconfig.json server/tsconfig.json
COPY server/src server/src

# Build
RUN npm run build --workspace server


########################
# STAGE 2 - PRODUCTION
########################
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Copia manifests novamente (boa prática)
COPY package.json package-lock.json ./
COPY server/package.json server/package.json

# ⚠️ COPIA AS DEPENDÊNCIAS DO BUILD (ESSENCIAL)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/node_modules ./server/node_modules

# Copia build final
WORKDIR /app/server
COPY --from=build /app/server/dist ./dist

# Permissões
RUN chown -R node:node /app

USER node

EXPOSE 8080

# Start correto
CMD ["node", "dist/index.js"]