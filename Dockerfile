# ── Stage 1: Build the React/Vite app ─────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── Stage 2: app — nginx serving the production build ─────────────────────
FROM nginx:alpine AS app

# SPA routing: all paths fall back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ── Stage 3: proxy — lightweight Node CORS proxy ──────────────────────────
FROM node:20-alpine AS proxy

WORKDIR /app
COPY proxy-server.mjs ./

EXPOSE 3001
ENV PORT=3001
CMD ["node", "proxy-server.mjs"]
