# syntax=docker/dockerfile:1.7

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

FROM node:20-alpine AS production
ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY adm/package.json adm/package.json
COPY quarta-colonia/package.json quarta-colonia/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/theme/package.json packages/theme/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --omit=dev --workspace server --include-workspace-root=false \
  && npm cache clean --force

WORKDIR /app/server

COPY --from=build /app/server/dist ./dist

RUN chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
