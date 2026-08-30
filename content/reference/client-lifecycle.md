---
title: Client lifecycle contract
description: Normative command, heartbeat, cancellation, failure, logging, and shutdown behavior shared by every Synapsys client library.
sidebar_position: 3
---

# Client lifecycle contract

This page is the public, language-neutral contract for official SDKs and custom
clients. Language manuals describe their APIs; this page defines what those APIs
must accomplish. The [raw-client checklist](/manuals/raw-api/checklist), Core's
`openapi.yaml`, and the internal `CLIENT_LIBRARY_SPEC.md` remain the implementation
sources of truth.

Synapsys is **not a scheduler**. Core decides when a registered process starts and
stops. An SDK wires existing, independently testable business logic to that control
plane; it does not decide execution times.

## Process model

| Type | Contract |
| --- | --- |
| Endless | One accepted start invokes the body once. The body continues until it finishes or cooperatively observes a stop. A real queue consumer or listener may contain its own loop. The SDK must never repeatedly invoke a finite function to simulate Endless work. |
| Progressive | One accepted start invokes one finite unit of work. The body returns naturally and the process returns to `idle`. |

Cancellation is cooperative. A body that does not need cancellation must not be
forced to accept an unused cancellation parameter. A body that does accept the
language's stop signal or cancellation token should pass it to cancellable I/O and
check it at safe points. SDKs do not kill arbitrary threads, goroutines, tasks, or
event-loop callbacks.

## Commands and acknowledgement

Every Core command has a monotonically increasing `desiredToken`. A client applies
only a command whose token is greater than its local `ackToken`, then acknowledges
the token only after the local handler accepts the command.

| Situation | Required behavior |
| --- | --- |
| Start while idle or failed | Set `running` before scheduling the body, adopt the new `runId`, start exactly one execution, then acknowledge. |
| Start while already running | Idempotent handled no-op. Acknowledge it, keep the active `runId`, and do not create a second execution. |
| Start while stopping or while the previous body is still in flight | Defer it. Do not acknowledge it and do not replace the old `runId`. Core redelivers it; accept it after the old run becomes terminal. |
| Stop while running | Set `stopping`, signal cooperative cancellation, start cleanup where supported, then acknowledge. |
| Stop while idle, failed, or already stopping | Idempotent handled no-op; acknowledge it. |
| `desiredState: idle` | No outstanding command. It is never an instruction to stop. |
| Duplicate or stale token | Ignore it. `ackToken` never decreases. |
| Handler failure | Isolate it, report `failed`, leave the token unacknowledged, and continue applying commands to sibling processes. |

Setting `running` synchronously closes the race in which two starts arrive before
the execution thread or task begins. Tracking an in-flight body separately from
the visible state closes the corresponding shutdown race. The same process must
never have overlapping active executions.

`runId` is an opaque signed 64-bit value. Preserve its digits exactly. In
JavaScript, this requires an int64-safe JSON strategy because ordinary numbers
cannot exactly represent Core's current nanosecond-based IDs.

## Heartbeats and transport

- Send every process on every heartbeat, including idle processes. Official
  framework identifiers are `springboot`, `nodejs`, `python`, `go`, and `dotnet`.
- Send the first heartbeat immediately. Schedule later beats with a fixed delay
  after the previous request settles. Never overlap requests or create a catch-up
  burst after a slow response.
- Bound connection establishment and the complete request. Do not follow redirects
  carrying the bearer token. The startup `GET /api/health` probe is unauthenticated;
  the heartbeat POST uses `Authorization: Bearer <token>`.
- A transport exception or non-2xx response is a failed beat. Keep running business
  logic, requeue drained logs in their original order, log the availability
  transition once, and retry on the normal next beat.
- A 2xx body that is empty, unreadable, or lacks the required `processes` array is
  also a failed beat. Requeue logs and acknowledge nothing. Unknown fields in an
  otherwise readable response are ignored for forward compatibility.
- The heartbeat loop catches the runtime's broadest failure at its outer boundary.
  No process or parsing error may terminate it.

There is no separate reconnect operation and no inbound connection. The next
outbound heartbeat is the retry. A successful beat after an outage reports the
connection-restored transition once.

## Failure state and logs

An unhandled business exception or panic is caught at the SDK boundary, reported
through the application's logging system, captured against the execution where
supported, and transitions that process to `failed`. It does not escape as an
unobserved task/thread failure or affect sibling processes. A later accepted start
may run a failed process again.

Process output delivery is best effort but bounded: queues, lines, entries per
heartbeat, and UTF-8 bytes per heartbeat have limits. A failed or malformed
heartbeat puts its drained batch back at the front. Delivery failure never fails
business work. Capture is independently disableable because it transmits process
output to Core.

Global console replacement is runtime-specific and has documented limits. Go and
.NET deliberately use explicit process-scoped loggers or writers instead. The .NET
hosting package additionally captures `Microsoft.Extensions.Logging` records in
the active execution context.

## Graceful shutdown

Shutdown is idempotent, cooperative, and bounded:

1. Stop the normal heartbeat loop and wait for an in-flight beat only within the
   shutdown budget.
2. Signal every active process; one failure must not prevent the others.
3. Wait only until the common deadline. Name bodies that ignore cancellation and
   leave them alive and non-replaceable.
4. If time remains, send exactly one final heartbeat bounded by the lesser of the
   remaining budget and request timeout. It carries final states and queued logs,
   but its response commands are ignored.
5. Restore capture and release SDK-owned transport resources. Never dispose a
   caller-owned HTTP client.

A final-heartbeat timeout or failure is diagnostic only. When the budget is already
exhausted, skip it. “Bounded” applies to the entire sequence, not only to waiting for
business bodies.

## Current implementation differences

The contract above is authoritative. This table records source-level differences
verified on 30 August 2026; it is not permission for new clients to copy them.

| Library | Difference | Recommended alignment |
| --- | --- | --- |
| Go `v0.1.0` | A 2xx response with an empty body decodes as an empty successful response. Malformed non-empty JSON already fails correctly. | Treat empty 2xx as a protocol failure, requeue logs, and acknowledge nothing. |
| Python `0.2.0` | The final heartbeat uses the request timeout but is not shortened to the time remaining in `shutdown_timeout`; a near-expired shutdown can exceed the nominal hard bound. | Pass the remaining deadline into the final request and cap it with `min(remaining, request_timeout)`. |
| Spring Boot `0.2.0` | The final heartbeat is skipped when no time remains, but a started final request keeps the full configured request timeout rather than the smaller remaining shutdown budget. | Give the final request a per-call timeout capped to the remaining deadline. |

Node.js `0.2.0` and the unreleased .NET implementation follow these specific rules
in their current tests. All implementations still require normal regression testing
against the full [client checklist](/manuals/raw-api/checklist).
