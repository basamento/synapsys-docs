---
title: Run the Core
description: Start Synapsys Core from its GitHub Container Registry image with safe bootstrap credentials.
---

# Run the Core

Core is distributed as a container at `ghcr.io/jmarzoli/synapsys-core`. It serves
the web console and API on port `8080`, and stores its state in a persistent volume.

## 1. Create bootstrap secrets

Create a file named `synapsys.env` outside source control:

```dotenv title="synapsys.env"
SYNAPSYS_AUTH_USERNAME=operator
SYNAPSYS_AUTH_PASSWORD=replace-with-a-long-random-password
```

These values create the initial console account when Core starts with an empty data
volume. Worker access is configured separately after signing in.

:::tip Generate secrets instead of inventing them
Password managers are ideal. On a machine with OpenSSL, `openssl rand -base64 32`
produces a suitable random password.
:::

## 2. Start the container

```bash
docker pull ghcr.io/jmarzoli/synapsys-core:latest

docker run -d \
  --name synapsys-core \
  --restart unless-stopped \
  --env-file synapsys.env \
  -p 8080:8080 \
  -v synapsys-data:/app/data \
  ghcr.io/jmarzoli/synapsys-core:latest
```

Open `http://localhost:8080` and sign in with the operator credentials from the
environment file.

Open **Settings**, create a named worker token, and store the displayed value in the
worker as `SYNAPSYS_CORE_TOKEN`. The operator password is never used by a worker.

## 3. Check availability

```bash
curl http://localhost:8080/api/health
```

The expected response is:

```json
{"status":"ok"}
```

## What persists

The `synapsys-data` volume contains Core state and the initial account. Bootstrap
credentials initialise an empty volume; changing the environment variables later
does not replace the persisted password.

For a production deployment, use HTTPS, set
`SYNAPSYS_AUTH_COOKIE_SECURE=true`, keep the volume backed up, and supply secrets
through your platform's secret mechanism. See [Core authentication](/manuals/core/authentication)
for named worker tokens and rotation.

Next: [connect your first worker](/docs/start/first-worker).
