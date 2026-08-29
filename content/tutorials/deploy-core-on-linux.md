---
title: Deploy Core on Linux
description: Deploy Synapsys Core on a Linux server with Docker Compose, persistent data, HTTPS, and health checks.
sidebar_position: 7
---

# Deploy Core on Linux

This tutorial deploys one Core on a Linux server, keeps its data in a named volume,
binds the container only to localhost, and places an HTTPS reverse proxy in front of
it. The example uses Ubuntu or Debian, Docker Compose, and Caddy; equivalent platforms
are supported when they provide the same boundaries.

## 1. Prepare the host

Use a maintained Linux release, create a DNS record such as `core.example.com`, and
install Docker Engine with the Compose plugin from the
[official Docker instructions](https://docs.docker.com/engine/install/).

Allow inbound SSH for administration and ports `80`/`443` for HTTPS. Do not expose
Core's port `8080` publicly.

## 2. Create the deployment directory

```bash
sudo install -d -m 0750 -o "$USER" -g "$USER" /opt/synapsys-core
cd /opt/synapsys-core
```

Create `compose.yaml`:

```yaml
services:
  core:
    image: ghcr.io/jmarzoli/synapsys-core:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    env_file:
      - synapsys.env
    volumes:
      - synapsys-data:/app/data

volumes:
  synapsys-data:
```

For production, replace `latest` with the immutable version you validated.

### Set the operator credentials directly in Compose

For a small self-hosted deployment, replace the `env_file` block with an
`environment` block under the Core service:

```yaml
services:
  core:
    environment:
      SYNAPSYS_AUTH_USERNAME: operator
      SYNAPSYS_AUTH_PASSWORD: replace-with-a-long-random-password
      SYNAPSYS_AUTH_COOKIE_SECURE: "true"
```

Do not commit a real password to source control. The username and password initialise
the operator account only when `/app/data` is empty; changing them later does not
replace the persisted account.

## 3. Create the Core environment file

Keeping sensitive values in a separate, protected file is usually easier to operate.
Because `compose.yaml` already references `synapsys.env`, create it with:

```dotenv title="synapsys.env"
SYNAPSYS_AUTH_USERNAME=operator
SYNAPSYS_AUTH_PASSWORD=replace-with-a-long-random-password
SYNAPSYS_AUTH_COOKIE_SECURE=true
```

Protect it before starting Core:

```bash
chmod 600 synapsys.env
```

This file configures the Core container. It does not configure a worker. Use your
platform's secret mechanism instead of an environment file when one is available.

## 4. Start and verify Core locally

```bash
docker compose pull
docker compose up -d
docker compose ps
curl --fail http://127.0.0.1:8080/api/health
```

The health response should be `{"status":"ok"}`.

## 5. Add HTTPS

Install Caddy from its [official packages](https://caddyserver.com/docs/install),
then add a site block:

```caddyfile title="/etc/caddy/Caddyfile"
core.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Caddy obtains and renews certificates automatically when DNS points to the server
and ports `80` and `443` are reachable. Its
[automatic HTTPS documentation](https://caddyserver.com/docs/automatic-https)
lists the complete prerequisites.

```bash
sudo systemctl reload caddy
curl --fail https://core.example.com/api/health
```

## 6. Connect workers

Create a named token in Core **Settings**, then inject the public URL and token into
each worker:

```dotenv
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_your_token
```

`SYNAPSYS_WORKER_TOKEN` is an optional Core-side setting for a single shared,
deployment-wide worker credential. If you need headless bootstrap, configure that
variable on Core and give the same secret to workers as `SYNAPSYS_CORE_TOKEN`.
It is intentionally omitted above because a named token can be rotated or revoked
without replacing the credential for every worker.

## Operate the deployment

```bash
docker compose logs --tail=100 core
docker compose restart core
docker compose pull
```

Keep the named volume backed up, monitor `/api/health`, and test restoration before
depending on the deployment. Continue with [backup and upgrade](./backup-and-upgrade-core).
