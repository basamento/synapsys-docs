---
title: System model
description: Learn how Core, workers, processes, executions, and actions fit together.
sidebar_position: 1
---

# System model

Synapsys has one Core and any number of workers. Operators use Core; applications
connect to it as workers. Every network connection from a worker is outbound.

```mermaid
flowchart LR
    O([Operators]):::person
    C["Synapsys Core<br/>console + control plane"]:::core
    W["Your worker applications<br/>Spring Boot · Node.js · Raw API"]:::worker

    O -->|use the HTTPS console| C
    W -->|send outbound heartbeats| C

    classDef person fill:#EEEAFB,stroke:#795FF5,color:#21184F,stroke-width:2px
    classDef core fill:#5F3DF2,stroke:#3F27B8,color:#FFFFFF,stroke-width:2px
    classDef worker fill:#DDF7F2,stroke:#12A28F,color:#103F38,stroke-width:2px
```

The command travels back in the HTTP response to the heartbeat. It is not a second
connection, callback, or inbound request to the worker.

## A command round trip

```mermaid
sequenceDiagram
    autonumber
    actor Operator
    participant Core
    participant Worker as Worker application

    Operator->>Core: Choose Start or Stop
    Note over Core: Store command with a new token
    Worker->>Core: POST heartbeat (state, ack token, logs)
    Core-->>Worker: 200 OK (desired state, desired token)
    Note over Worker: Apply only when desired token is newer
    Worker->>Core: Next heartbeat acknowledges the token
```

The worker opens both heartbeat connections. Core only answers them.

## Core

Core serves the responsive operator console and control API. It records the latest
worker state, process state, execution history, actions, worker-token metadata, and
captured output.

## Worker

A worker is one application connected through a starter, SDK, or the Raw API. Its
name is its identity across restarts. The same worker sends every registered process
on each heartbeat.

## Process

A process is a named unit of work inside a worker. Names are unique within a worker,
so two applications may both expose `nightly-sync` without colliding. A process is
either endless or progressive and reports `idle`, `running`, `stopping`, or `failed`.

## Execution and action

An execution is one run of a process. Its output is viewed independently from other
runs. An action records a control event such as a start, stop, heartbeat, or command
acknowledgement, providing an operational history of how state changed.

## Connectivity consequence

Workers need outbound HTTPS access to Core but no inbound listener. With a five-
second heartbeat interval, a command is normally observed within up to five seconds.
Choose an interval that balances response time and request volume for your fleet.
