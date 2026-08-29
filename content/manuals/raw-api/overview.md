---
title: Overview
description: Integrate any runtime with Synapsys through the supported heartbeat HTTP API.
---

# Raw API

The Raw API is the supported integration for a runtime without an official library.
A worker sends one authenticated JSON request on a fixed interval. The request
reports every process and any new output; the response carries the latest command
and token for each process.

## What you implement

Your client owns one loop:

1. Build a complete snapshot of every registered process.
2. Add captured log lines produced since the previous successful heartbeat.
3. `POST /api/v1/workers/heartbeat` with a worker bearer token.
4. Compare each returned `desiredToken` with the process's `ackToken`.
5. Apply only newer commands and acknowledge after handling succeeds.
6. Retry indefinitely without stopping user work when Core is unavailable.

There is no registration endpoint and Core never calls the worker. The first valid
heartbeat creates the worker and its processes in Core.

## What you need

- A stable worker name and stable process names.
- A Core URL reachable from the worker.
- A token created in Core **Settings** or configured as Core's deployment token.
- A scheduler or loop with request timeouts.
- Isolated process state and a durable in-memory acknowledgement token per process.

## Use a library when one exists

The [Spring Boot starter](/manuals/spring-boot/install) and
[Node.js SDK](/manuals/nodejs/install) already implement retries, idempotent command
handling, cancellation, and log capture. Use the Raw API when you need a different
runtime or want to build an integration with equivalent behaviour.

Continue with [the heartbeat loop](./the-heartbeat-loop), then use the
[client checklist](./checklist) before production.
