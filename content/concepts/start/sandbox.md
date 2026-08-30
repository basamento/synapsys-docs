---
title: Try the live sandbox
description: A hosted Synapsys Core with real workers in five languages, open to anyone, with no installation.
slug: /start/sandbox
---

# Try the live sandbox

A running Synapsys Core with real workers connected to it, so you can see what
the console does before installing anything.

<a class="button button--primary button--lg" href="https://core.sandbox.synapsys.basamento.org" target="_blank" rel="noopener">Open the sandbox console →</a>

Sign in with the username `demo` and the password `demo`.

## What you are looking at

Four applications are connected, each built from its own example repository and
each using the client library for its language:

| Worker | Library |
| --- | --- |
| `spring-boot-example` | Spring Boot starter |
| `node-sdk-example` | Node.js SDK |
| `python-sdk-example` | Python SDK |
| `go-sdk-example` | Go SDK |

Together they register more than eighty processes. None of them is a mock: they
are ordinary applications that happen to declare their background work to Core.
The same code is what the [Get started](/docs/start) guide walks you through.

## What to try

**Start something.** Find `invoice-poller` on any worker and start it. Core does
not run the process — it records that you want it running, and the worker picks
that up on its next heartbeat, within about five seconds.

**Watch its output.** Open a run and read the log lines. That output is being
written by `System.out` or `console.log` inside the application and streamed to
Core against the specific run.

**Stop something mid-flight.** `slow-stopper` takes about fifteen seconds to
reach a safe stopping point, which makes the `stopping` state visible instead of
instantaneous.

**Watch something fail.** `crashing-watchdog` fails deliberately, ending in
`failed` rather than `idle`. Every third run survives.

## Things worth knowing

It is **shared and unauthenticated beyond the demo login**. Anyone reading this
page can start and stop the same processes you can. If something looks
half-finished, someone else was probably here first.

It **resets every night**, which returns the workers and their processes to a
known state.

It is **a demonstration, not a service**. Do not connect your own workers to it
or put anything real into it.

## Then run your own

The sandbox is one container plus four applications. To get the same thing
locally, [run Core](/docs/start/run-the-core) and
[connect your first worker](/docs/start/first-worker) — the whole path takes
about five minutes.
