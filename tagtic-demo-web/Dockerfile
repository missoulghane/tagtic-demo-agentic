FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Installation plus légère et plus rapide
RUN npm ci --no-audit --no-fund

COPY . .

# Build Angular moins gourmand
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/tagtic-demo-web/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80