---
title: Configuration
description: Configure the Core container, persistent data, authentication, and health monitoring.
---

# Configuration

Core is configured through environment variables. Keep configuration beside your
deployment definition and inject every secret through a protected mechanism.

| Variable | Default | Purpose |
| --- | --- | --- |
| `SYNAPSYS_AUTH_USERNAME` | none | Initial operator username for an empty data volume. |
| `SYNAPSYS_AUTH_PASSWORD` | none | Initial operator password. Prefer the file variant where supported. |
| `SYNAPSYS_AUTH_PASSWORD_FILE` | none | Path to a file containing the initial operator password. |
| `SYNAPSYS_AUTH_COOKIE_SECURE` | `false` | Mark the browser session cookie secure; set `true` behind HTTPS. |
| `SYNAPSYS_WORKER_TOKEN` | none | Optional Core-side credential accepted from every worker; workers receive the same secret as `SYNAPSYS_CORE_TOKEN`. |
| `SYNAPSYS_AUTH_DISABLED` | `false` | Disable all authentication for isolated local development only. |

## Persistent data

Mount persistent storage at `/app/data`. Treat that volume as operational state:
back it up, restore it with the same protection as Core, and do not remove it during
a routine image upgrade.

```yaml
volumes:
  - synapsys-data:/app/data
```

## Network and health

The container listens on port `8080`. Workers need outbound access to the Core URL;
they do not need inbound ports of their own. `GET /api/health` is unauthenticated so
a load balancer or orchestrator can check availability.

```bash
curl --fail https://core.example.com/api/health
```

## Upgrade pattern

1. Back up the persistent volume.
2. Pull and validate the target image in a non-production environment.
3. Update the pinned image tag.
4. Recreate the Core container without deleting the volume.
5. Check `/api/health`, sign in, and confirm workers reconnect.

Worker processes continue running during a Core restart and converge when
heartbeats succeed again.
