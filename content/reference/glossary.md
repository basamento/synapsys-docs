---
title: Glossary
description: The terms Synapsys uses, and what they mean precisely.
sidebar_position: 1
---

# Glossary

These terms are used consistently by Core, the official libraries, and the HTTP API.

### Core

The self-hosted control plane and operator console. It receives worker heartbeats,
records state and history, and returns pending process commands.

### Worker

One application connected to Core. It is identified by `workerName`, which must be
stable across restarts.

### Process

A unit of work inside a worker — a job, a loop, a task. Names are unique **per
worker**, not globally, which is why processes are addressed by id.

### Endless process

A process that runs until told to stop. Cooperates with a stop signal.

### Progressive process

A process that runs to completion on its own and reaches `idle` by finishing.
It cooperates with the cancellation mechanism provided by its client library.

### Execution

One durable run of a process, with a start, an end and an outcome. Starting a
process appends a new execution record; completed executions remain in history.

### Run id

The identifier the Core assigns to an in-flight execution. Present in the
heartbeat while a run is active; carried back unchanged by the worker. Treat it as
an opaque signed 64-bit value.

### Desired state

What the Core wants a process to be doing. One of `idle`, `running` or
`stopping`. **`idle` means "no command"**, never "stop".

### Current state

What a process is actually doing, as reported by the worker. One of `idle`,
`running`, `stopping` or `failed`.

### Desired token

An integer the Core increments on every user command. The worker applies a
command only when this is strictly greater than its `ackToken`.

### Ack token

The last `desiredToken` a worker actually applied. Reported on every heartbeat.
This is what makes commands idempotent.

### Heartbeat

The single outbound POST a worker makes on a fixed interval, carrying every
process it owns, optional captured output, and receiving Core's desired states in
reply. It is authenticated with a worker bearer token.

### Worker token

A bearer credential accepted by the heartbeat endpoint. Named tokens can be created
and revoked in Core Settings. Their secret is displayed only at creation.

### Execution log

Captured stdout or stderr produced during one process run and associated with that
execution in Core.

### Framework

The runtime a worker declares itself to be. Recorded as `unknown` when not sent —
never inferred.
