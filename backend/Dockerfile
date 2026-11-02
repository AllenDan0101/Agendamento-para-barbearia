FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci -w backend --include-workspace-root

FROM deps AS build
COPY backend backend
RUN npm run build -w backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci -w backend --omit=dev --include-workspace-root
COPY --from=build /app/backend/dist backend/dist
RUN mkdir -p /data
ENV SQLITE_PATH=/data/barbearia.db
ENV PORT=3333
EXPOSE 3333
CMD ["node", "backend/dist/index.js"]
