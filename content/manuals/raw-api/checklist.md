---
title: Client checklist
description: Production checklist for a correct, secure, and resilient Synapsys heartbeat client.
---

# Client checklist

Use this list before calling a custom heartbeat client production-ready.

## Identity and authentication

- [ ] The worker name is stable across restarts.
- [ ] Process names are non-empty and unique within that worker.
- [ ] Every heartbeat sends `Authorization: Bearer <token>`.
- [ ] The token comes from a secret mechanism and never appears in logs or URLs.
- [ ] The Core URL uses HTTPS outside isolated local development.
- [ ] Redirects do not forward the bearer token to another host.

## Heartbeat

- [ ] Send `POST /api/v1/workers/heartbeat` on a positive whole-second interval.
- [ ] Send every process on every beat, including idle processes.
- [ ] Report `workerName`, `framework`, `heartbeatInterval`, and `processes`.
- [ ] Apply connection and whole-request timeouts.
- [ ] Catch every error at the loop boundary so one exception cannot kill it.
- [ ] Ignore unknown response fields for forward compatibility.
- [ ] Core being unavailable does not stop running user work.

## Commands and state

- [ ] Apply a command only when `desiredToken > ackToken`.
- [ ] Acknowledge only after the handler completes successfully.
- [ ] `running` starts, `stopping` requests a cooperative stop, and `idle` means no command.
- [ ] `failed` is reportable but never accepted as a desired state.
- [ ] One process failure cannot block another process's command.
- [ ] Duplicate start commands cannot create duplicate runs.
- [ ] Preserve and echo `runId` exactly as an opaque 64-bit value.

## Process types

- [ ] Endless bodies keep running until they observe a stop request.
- [ ] Progressive bodies run once and return to `idle` when complete.
- [ ] Progressive work has explicit cancellation points for long loops or I/O.
- [ ] Cleanup failure does not prevent the process from stopping.

## Logs

- [ ] Capture only output produced inside a process execution.
- [ ] Continue writing every captured line to the application's normal output.
- [ ] Attach the process name, exact `runId`, timestamp, source, level, and sequence.
- [ ] Drop blank lines and never send a null run id or sequence below one.
- [ ] Bound line length, queue length, and bytes per heartbeat.
- [ ] Requeue drained lines when the heartbeat fails.
- [ ] Make capture disableable and document that output is transmitted to Core.

## Test it

- [ ] Start while Core is unavailable, then confirm the worker connects when Core returns.
- [ ] Interrupt a heartbeat and confirm the loop continues.
- [ ] Repeat a command response and confirm it is not applied twice.
- [ ] Crash one process and confirm other processes still receive commands.
- [ ] Stop a sleeping or in-flight process and confirm it exits cooperatively.
- [ ] Send concurrent process output and confirm lines remain attached to the right run.
- [ ] Revoke the token and confirm the next heartbeat receives `401`.
