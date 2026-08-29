---
title: Install
description: Run Synapsys Core from GitHub Container Registry with persistent storage and bootstrap credentials.
---

# Install Core

The supported Core distribution is the container image
`ghcr.io/jmarzoli/synapsys-core`. It exposes the console and API on port `8080` and
needs a persistent volume plus bootstrap credentials.

## Docker Compose

Create a Compose file:

```yaml title="compose.yaml"
services:
  core:
    image: ghcr.io/jmarzoli/synapsys-core:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - synapsys.env
    volumes:
      - synapsys-data:/app/data

volumes:
  synapsys-data:
```

Create `synapsys.env` outside source control:

```dotenv title="synapsys.env"
SYNAPSYS_AUTH_USERNAME=operator
SYNAPSYS_AUTH_PASSWORD=replace-with-a-long-random-password
```

Then start and verify Core:

```bash
docker compose up -d
curl http://localhost:8080/api/health
```

Open `http://localhost:8080` and sign in. The expected health response is
`{"status":"ok"}`.

Create a named worker token in **Settings** before connecting an application. The
optional deployment-wide `SYNAPSYS_WORKER_TOKEN` is documented under
[authentication](./authentication), but is not required to start Core.

## Production checklist

- Pin an immutable image version after validating it in your environment.
- Put Core behind HTTPS and set `SYNAPSYS_AUTH_COOKIE_SECURE=true`.
- Store passwords and tokens in your platform's secret mechanism.
- Persist and back up `/app/data`.
- Restrict the operator console to the networks and identities that need it.
- Keep the health endpoint available to your orchestrator or monitor.

The console is responsive and remains navigable on desktop, tablet, and mobile
browsers. Mobile support does not change the network-security requirement: expose
it only through your normal protected HTTPS entry point.

Next: [configure operator and worker authentication](./authentication).
