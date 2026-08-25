---
title: State machine
description: The full state table in one place.
sidebar_position: 2
---

# State machine

## States

| State | Reported by worker | Commandable by Core | Meaning |
|---|---|---|---|
| `idle` | Yes | Yes | Not running. As a desired state: no command outstanding. |
| `running` | Yes | Yes | Executing now. |
| `stopping` | Yes | Yes | Stop requested, not yet finished. |
| `failed` | Yes | **No** | Terminated abnormally. Observed only. |

## Transitions

| From | Event | To |
|---|---|---|
| `idle` | start command applied | `running` |
| `running` | stop command applied | `stopping` |
| `stopping` | process returns | `idle` |
| `running` | unhandled error | `failed` |
| `stopping` | unhandled error | `failed` |
| `running` | progressive process completes | `idle` |
| `failed` | start command applied | `running` |

## Command lifecycle

| Step | Actor | Effect |
|---|---|---|
| 1 | Operator | `PUT /api/processes/{id}/desired-state` |
| 2 | Core | Sets `desiredState`, increments `desiredToken` |
| 3 | Worker | Reads response, sees `desiredToken > ackToken` |
| 4 | Worker | Applies command, sets `ackToken = desiredToken` |
| 5 | Worker | Reports new `ackToken` on next heartbeat |
| 6 | Core | Sees `ackToken >= desiredToken`, resets `desiredState` to `idle`, clears `runId` |

Step 6 only clears the processes whose command actually completed — a sibling
process with a start still in flight keeps its run id.

## Invariants

- `ackToken` never decreases.
- A command with `desiredToken <= ackToken` is a duplicate and must be ignored.
- `failed` is never sent as a desired state.
- `idle` as a desired state means no command; it is never an instruction to stop.
- A heartbeat is rejected only when **no** process in it is readable.
