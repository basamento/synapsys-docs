---
title: Glossary
description: The terms Synapsys uses, and what they mean precisely.
sidebar_position: 1
---

# Glossary

The naming is biological on purpose — the product centralises scattered programs
the way a nervous system centralises scattered signals.

### Core

The central node, also called the *nucleus*. One Go binary with the console
compiled in and a SQLite database. The only component that stores anything.

### Neuron

A worker: one of your applications, connected to the Core. Identified by
`workerName`, which must be stable across restarts.

### Worker

The same thing as a neuron. *Worker* is used in the API and configuration;
*neuron* is used when talking about the model.

### Process

A unit of work inside a worker — a job, a loop, a task. Names are unique **per
worker**, not globally, which is why processes are addressed by id.

### Endless process

A process that runs until told to stop. Cooperates with a stop signal.

### Progressive process

A process that runs to completion on its own and reaches `idle` by finishing.
Cancelled by interruption rather than by a flag.

### Execution

One run of a process, with a start, an end and an outcome.

### Run id

The identifier the Core assigns to an in-flight execution. Present in the
heartbeat while a run is active; carried back unchanged by the worker.

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
process it owns and receiving the Core's desired states in reply.

### Framework

The runtime a worker declares itself to be. Recorded as `unknown` when not sent —
never inferred.
