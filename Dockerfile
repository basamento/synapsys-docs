# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

# Docusaurus uses Git to render each page's last-update timestamp.
RUN apk add --no-cache git

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run typecheck
RUN npm run build


FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /app/build/ /usr/share/nginx/html/

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
