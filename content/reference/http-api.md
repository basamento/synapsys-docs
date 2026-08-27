---
title: HTTP API
description: The machine-readable v1 Core API contract.
sidebar_position: 1
---

# HTTP API

The canonical HTTP contract is the
[OpenAPI 3.1 specification](https://github.com/JMarzoli/synapsys-core/blob/main/openapi.yaml)
in the Core repository. Client libraries, examples, and this documentation must
all follow that file.

## Control-plane endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check whether Core is available. |
| `POST` | `/api/v1/workers/heartbeat` | Report a worker snapshot and receive commands. |
| `PUT` | `/api/processes/{id}/desired-state` | Start or stop one process. |
| `GET` | `/api/state` | Read the paginated console state and history. |

`heartbeatInterval` is a positive whole number of **seconds** everywhere in v1.
Names are unique per worker, so operator commands address a process by id.

The heartbeat endpoint is the only endpoint a worker needs. The other endpoints
are used by operators and the bundled console.
