# syntax=docker/dockerfile:1.7

########################
# STAGE 1 - BUILD
########################
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY adm/package.json adm/package.json
COPY quarta-colonia/package.json quarta-colonia/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/theme/package.json packages/theme/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --workspace server --include-workspace-root=false

COPY server/tsconfig.json server/tsconfig.json
COPY server/src server/src

RUN npm run build --workspace server


########################
# STAGE 2 - PRODUCTION
########################
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json

# ✅ CORRETO: só node_modules raiz
COPY --from=build /app/node_modules ./node_modules

WORKDIR /app/server

COPY --from=build /app/server/dist ./dist

RUN chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node", "dist/index.js"]