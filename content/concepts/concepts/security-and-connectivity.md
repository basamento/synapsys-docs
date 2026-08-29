---
title: Security and connectivity
description: Understand console sessions, worker tokens, outbound connectivity, and process-output handling.
---

# Security and connectivity

Synapsys separates people operating Core from software reporting to it. Operators
use a browser session; workers use bearer tokens. A credential from one path cannot
be used as the other.

## Two authentication paths

| Client | Credential | Used for |
| --- | --- | --- |
| Operator console | Username/password, then an HttpOnly session cookie | Viewing state, issuing commands, managing worker tokens |
| Worker | `Authorization: Bearer <token>` | Sending heartbeats, process state, acknowledgements, and captured output |

Create named worker tokens in **Settings**. The secret is displayed once, so copy it
directly into your secret manager. Revocation takes effect on the worker's next
heartbeat.

## Network direction

Workers initiate every connection to Core. Core does not call workers and workers
do not need an inbound listening port. This makes the normal network policy small:
allow each worker to reach the Core HTTPS endpoint.

## Transport and browser security

Use HTTPS whenever traffic leaves a trusted local machine. Set
`SYNAPSYS_AUTH_COOKIE_SECURE=true` on Core when HTTPS is in use, and configure the
public Core URL with `https://` in every worker.

Authentication can be disabled with `SYNAPSYS_AUTH_DISABLED=true` for isolated
local development. Do not use that setting on a shared network or public endpoint.

## Process output is data

Official libraries can capture stdout and stderr produced during a process run and
send it to Core for the execution log view. This is useful for diagnosis, but the
output may contain application data. Review what your process prints, protect Core
as an operational system, and disable capture where required by policy.

See [Core authentication](/manuals/core/authentication) for setup and token rotation.
