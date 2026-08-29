# syntax=docker/dockerfile:1

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx build/ /usr/share/nginx/html/

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
