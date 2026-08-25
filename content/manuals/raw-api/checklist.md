---
title: Client checklist
description: Everything a correct Synapsys client must do, in order.
sidebar_position: 3
---

# Client checklist

Everything a correct client must do. Nothing else is on this page on purpose —
if you are implementing Synapsys in a runtime with no starter, this is the list
to work through and then test against.

## Registration

- [ ] Send a `workerName`. If it is absent the Core cannot identify you across
      restarts.
- [ ] Send a `framework` string identifying your runtime. If you do not, the Core
      records `unknown` — it never guesses `springboot` or anything else.
- [ ] Send a `host`. If you omit it the Core falls back to the TCP remote address,
      which is usually a container IP and usually useless.
- [ ] Send `heartbeatInterval` as an **integer number of seconds**, matching the
      interval you actually use.

## The loop

- [ ] POST to `{coreUrl}/api/v1/workers/heartbeat` on a fixed interval.
- [ ] Send **every** process you own in one batch, on every beat — not just the
      ones that changed.
- [ ] Include `name`, `type` (`endless` or `progressive`), `currentState`, and
      `ackToken` for each.
- [ ] Keep beating while processes are idle. Silence is how the Core decides a
      worker is gone.
- [ ] Never open an inbound port. Nothing calls you.

## Applying a command

- [ ] Compare the response's `desiredToken` against your stored `ackToken` for
      that process.
- [ ] Apply the command **only** when `desiredToken > ackToken`. Equal or lower is
      a duplicate and must be ignored.
- [ ] Set `ackToken = desiredToken` **after** applying, not before.
- [ ] Report the new `ackToken` on the next beat.
- [ ] Treat `desiredState: "idle"` as **no command**. It is not a stop.
- [ ] Reject `failed` as a desired state — it is observable only.
- [ ] Carry `runId` back unchanged when the Core sends one.

## States

- [ ] Report exactly one of `idle`, `running`, `stopping`, `failed`.
- [ ] Report `stopping` while a stop is in progress, not `idle`, and not
      `running`.
- [ ] Report `failed` when a process terminated abnormally, and leave it there
      until a new command arrives.
- [ ] Omit a process you cannot determine the state of, rather than guessing.

## Process types

- [ ] **Endless** — runs until told to stop. Must poll a stop signal cooperatively
      and return promptly once it is set.
- [ ] **Progressive** — runs to completion on its own. Must check for cancellation
      at safe points, and reaches `idle` by finishing.

## Robustness

- [ ] Set a connect timeout and a request timeout. A hung Core must not stall your
      loop.
- [ ] Survive the Core being unreachable — keep running, keep retrying, do not
      stop processes because a heartbeat failed.
- [ ] Keep beating with the same `ackToken` values across a Core restart. Command
      state lives in the Core's database, not in the connection.
- [ ] Tolerate unknown fields in the response. Newer Cores will add them.

## Test it

- [ ] Issue the same command twice — the process must act once.
- [ ] Stop a process that takes longer than one interval to stop — it must not
      receive a second stop.
- [ ] Kill the Core mid-command, restart it — the worker must converge without
      replaying.
- [ ] Send a batch with one malformed process — the others must still be
      accepted.
