---
title: What Synapsys is
description: Understand the operational problem Synapsys solves and whether it fits your system.
slug: /start
---

# What Synapsys is

Synapsys is a self-hosted control plane for background work that already lives in
your applications and scripts. It gives teams one place to see what is running,
start or stop it, inspect execution history, and read its output—without rewriting
the work as a new job system.

## The problem it solves

Companies accumulate operational programs in many places: a poller inside a Spring
service, a Node.js import script, a long-running consumer, or a one-off maintenance
task. These programs may work well, but operating them becomes difficult:

- ownership and runtime location are unclear;
- starting or stopping work requires shell access or a deployment;
- teams cannot quickly tell whether work is idle, running, stopping, or failed;
- execution output is scattered across hosts and logging systems.

Synapsys adds a thin control layer around that existing code. The code remains in
its application and keeps using its own dependencies. A small library reports its
state to Synapsys Core and applies operator commands.

## The model

1. Run **Core**, which serves the operator console and control API.
2. Add a **starter or SDK** to an application. That application becomes a worker.
3. Register existing functions or classes as **processes**.
4. The worker sends an outbound heartbeat. Core returns any pending command.
5. Operators use the console to start, stop, inspect, and troubleshoot executions.

The console is designed for desktop, tablet, and mobile browsers, so an operator can
check status and navigate the system away from a workstation.

## What it does not replace

Synapsys is not a message broker, workflow engine, container orchestrator, or
scheduler. It does not move your business logic into Core and it does not require
workers to expose inbound ports. Use it when the work already belongs in your
application but needs a consistent operational surface.

## Choose an integration

| Your application | Start here |
| --- | --- |
| Spring Boot 3.x on Java 17+ | [Spring Boot starter](/manuals/spring-boot/install) |
| Node.js 16+, CommonJS or ESM | [Node.js SDK](/manuals/nodejs/install) |
| Python 3.9+ | [Python SDK](/manuals/python/install) |
| Go 1.22+ | [Go SDK](/manuals/go/install) |
| .NET 8+ | [.NET SDK](/manuals/dotnet/install) — packages await first NuGet release |
| Another runtime | [Raw HTTP API](/manuals/raw-api/overview) |

Ready to try it? The fastest look is the [hosted sandbox](/docs/start/sandbox),
which needs no installation. To run your own, [run Core](/docs/start/run-the-core), then connect your first
worker.
