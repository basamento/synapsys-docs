---
title: Run the Core
description: Build and run the Core, with its console compiled in.
sidebar_position: 2
---

# Run the Core

The Core ships as a single Go binary with its web console compiled into it. There
is no separate frontend to deploy and no external database to provision.

:::info Not published yet
There is no image on a public registry and no tagged release. Until there is, the
Core is built from source. This page will change when that lands.
:::

## With Docker

```bash
git clone https://github.com/JMarzoli/synapsys-core-go.git
cd synapsys-core-go
docker build -t synapsys-core .
```

```bash
docker run -p 8080:8080 -v synapsys-data:/app/data synapsys-core
```

The console is now at **http://localhost:8080**.

The volume matters: the Core keeps its state in a SQLite database at
`/app/data/nucleus.db`. Without a volume, every worker, process and execution
record is lost when the container is replaced.

## Checking it is up

```bash
curl http://localhost:8080/api/health
```

## What you have now

An empty Core. It knows about nothing, because nothing has connected to it yet —
workers introduce themselves by heartbeating, not by being registered ahead of
time.

Next: [your first worker](./first-worker).
