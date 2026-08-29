---
title: Back up and upgrade Core
description: Create a consistent Core data backup, pin a new image, verify the upgrade, and prepare rollback.
sidebar_position: 9
---

# Back up and upgrade Core

Core keeps operational state in `/app/data`. An image upgrade should preserve that
volume. Take a consistent backup first and test restoration as part of normal
operations, not only during an incident.

## 1. Record the current state

From the deployment directory:

```bash
docker compose ps
docker compose images
curl --fail https://core.example.com/api/health
```

Record the currently pinned image version and confirm workers are healthy.

## 2. Stop Core and back up the volume

Stopping Core gives the backup a consistent point in time. Worker processes keep
running and reconnect after Core returns.

```bash
docker compose stop core
mkdir -p backups
docker run --rm \
  -v synapsys-core_synapsys-data:/source:ro \
  -v "$PWD/backups:/backup" \
  alpine sh -c 'cd /source && tar czf /backup/core-data.tgz .'
```

Compose may use a different volume prefix. Run `docker volume ls` and use the exact
volume created by this deployment. Copy the archive to protected storage and test
that it can be listed with `tar tzf backups/core-data.tgz`.

## 3. Pin and start the new image

Change the image tag in `compose.yaml` to the version you validated, then:

```bash
docker compose pull
docker compose up -d
docker compose ps
curl --fail https://core.example.com/api/health
```

Sign in and verify workers, processes, executions, actions, logs, and token metadata.
Workers should reconnect automatically.

## 4. Prepare rollback

If validation fails, first inspect `docker compose logs --tail=200 core`. A rollback
may require both the previous image and the matching data backup if the upgrade
changed stored data.

:::danger Restoring replaces current state
Do not unpack a backup over a live or newer volume. Stop Core, preserve the failed
volume separately, restore into an empty volume, and start the matching image. Test
the complete procedure in a non-production environment before relying on it.
:::

Keep multiple dated backups rather than overwriting `core-data.tgz`, and apply the
retention and encryption rules your organisation uses for operational data.
