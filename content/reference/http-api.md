---
title: HTTP API
description: The machine-readable v1 Core API contract.
sidebar_position: 1
---

# HTTP API

The canonical HTTP contract is the
[OpenAPI 3.1 specification](https://github.com/basamento/synapsys-core/blob/main/openapi.yaml)
in the Core repository. Client libraries, examples, and this documentation must
all follow that file.

## Control-plane endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check whether Core is available. |
| `POST` | `/api/v1/workers/heartbeat` | Report a worker snapshot and receive commands. |
| `PUT` | `/api/processes/{id}/desired-state` | Start or stop one process. |
| `GET` | `/api/state` | Read the paginated console state and history. |
| `POST` | `/api/auth/login` | Open an operator browser session. |
| `GET` | `/api/auth/session` | Check the current operator session. |
| `POST` | `/api/auth/logout` | Close the operator session. |
| `GET`, `POST` | `/api/auth/worker-tokens` | List token metadata or create a named worker token. |
| `DELETE` | `/api/auth/worker-tokens/{id}` | Revoke a worker token. |
| `GET` | `/api/executions/{id}/logs` | Read captured output for one execution. |

`heartbeatInterval` is a positive whole number of **seconds** everywhere in v1.
Names are unique per worker, so operator commands address a process by id.

The heartbeat endpoint is the only endpoint a worker needs and requires bearer
authentication. Operator endpoints use the browser session created by login; unsafe
requests also carry the console's CSRF token. `GET /api/health` is public.

See the [Raw API manual](/manuals/raw-api/overview) for an implementation guide and
the OpenAPI document for complete schemas and status codes.
