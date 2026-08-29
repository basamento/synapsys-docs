---
title: Diagnose a failed execution
description: Use state, execution history, actions, and captured output to find why a process failed.
sidebar_position: 6
---

# Diagnose a failed execution

A process reports `failed` when its body terminates abnormally. Core keeps that run
in execution history so the failure can be investigated without reproducing it
immediately.

## 1. Open the execution

From **Processes**, locate the failed process and open its latest execution. Check:

- when the run started and last changed;
- whether it failed during normal work or while stopping;
- the worker and host that owned the run;
- whether earlier executions show the same pattern.

## 2. Read its output

Open the execution's logs and begin with the final error lines. Official libraries
capture uncaught process exceptions as error output. Look just before the exception
for the last successful unit of work, external dependency, or cancellation point.

No captured lines can mean capture is disabled, the process printed nothing, the
output occurred outside the execution scope, or the worker has not delivered it on
a successful heartbeat yet.

## 3. Check the action trail

Open **Actions** and filter by the process. Confirm the order of the start, heartbeat,
stop, and acknowledgement events. This distinguishes a process failure from a
command that has not yet reached an inactive worker.

## 4. Check worker connectivity

If the worker is inactive, inspect the application's own logs and network path to
Core. A Core outage does not fail a user process by itself; the worker continues and
reconnects later. An authentication failure appears as `401` on the heartbeat and
usually means a missing, replaced, or revoked worker token.

## 5. Retry deliberately

Fix the cause or confirm the operation is safe to repeat, then choose **Start**. A
new start creates a new execution; it does not erase the failed one. Compare the two
runs to confirm the change worked.

:::tip Make failures useful
Print stable milestones and identifiers, not credentials or complete sensitive
payloads. The best execution log explains progress without turning Core into a copy
of application data.
:::
