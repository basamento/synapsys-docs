---
title: Install
description: Build and run the Core.
sidebar_position: 1
---

# Install the Core

The Core is one Go binary with the React console compiled into it via `go:embed`.
One artifact, one port, one file of state.

:::info Early development image
The Core image is private and pre-1.0. Authenticate to GitHub Container Registry
and use an explicit version tag such as `0.1.0` or `0.1.0-alpha.1`.
:::

## Docker

```bash
docker login ghcr.io
docker pull ghcr.io/jmarzoli/synapsys-core:0.1.0
docker run -p 8080:8080 -v synapsys-data:/app/data ghcr.io/jmarzoli/synapsys-core:0.1.0
```

The image is built through a multi-stage workflow: Node builds the frontend, Go
embeds it and compiles a static binary, and the runtime image is Alpine with just
that binary.

## What it needs

| | |
|---|---|
| Port | `8080` |
| State | SQLite at `/app/data/nucleus.db` |
| Volume | `/app/data` — **required** if you want your data to survive |
| External services | none |

## Networking

Workers need to reach the Core's `/api/v1/workers/heartbeat` endpoint outbound.
The Core needs to reach nothing.

If you run the console from a separate origin during development, note that the
Core's CORS layer allows exactly one origin — `http://localhost:5173`, the Vite
dev server. In production the console is served by the Core itself and CORS does
not apply.

## Upgrading

Schema migrations are tracked in a `schema_migrations` ledger and applied at
startup. Migrations that have already been applied are never edited; a change
means a new migration. Back up `nucleus.db` before upgrading anyway.
