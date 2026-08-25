---
title: Why commands are matched by token, not by state
description: The obvious design replays every command. Here is what Synapsys does instead.
date: 2026-08-25
---

Synapsys workers do not accept inbound connections. Everything — every report and
every command — rides a single outbound POST the worker makes every few seconds.

That leaves one question: how does the Core tell a worker to do something exactly
once?

{/* truncate */}

## The obvious design is wrong

Send the desired state, let the worker compare it against what it is doing, and
act on the difference.

```
if (desiredState != currentState) apply(desiredState);
```

This replays. A process that takes thirty seconds to stop reports `stopping` for
six consecutive beats, and on each one the desired state still differs from the
current state, so the command fires again. With a start command it is worse: you
get six starts.

You can patch around it — suppress commands while a transition is in flight, add a
grace period — but every patch is a guess about timing, and timing is exactly what
an unreliable network takes away from you.

## What Synapsys does

The Core keeps a **`desiredToken`** per process and increments it on every user
command. The worker keeps the last token it actually applied, as **`ackToken`**,
and reports it on every heartbeat.

```
if (desiredToken > ackToken) {
    apply(desiredState);
    ackToken = desiredToken;
}
```

Duplicates are now arithmetic rather than judgement. The same response delivered
six times applies once, because after the first the tokens are equal.

## The consequences worth knowing

**`idle` had to stop meaning "stop".** Once a command completes, the Core resets
`desiredState` to `idle` to mean "nothing outstanding". Any client that reads that
as an instruction shuts down everything it owns. So `idle` means *no command*, and
stop is `stopping`.

**`failed` cannot be commanded.** A state you can be in is not necessarily a state
you can be told to enter. Nothing can be instructed to fail, so validity is
checked twice — once for what a worker may report, once for what the Core may
ask for.

**Order matters at the edges.** Update `ackToken` after applying, never before. A
client that acknowledges first and crashes has lost the command, because the Core
will consider it done.

## Why this is in the docs, not just the code

Every future starter — Go, Python, whatever comes after — reimplements this loop.
It is the one piece of Synapsys that cannot be encapsulated in a library, because
it *is* the thing each library independently has to get right.

That is also why Raw API is a first-class connection method rather than a
fallback: the protocol is the product.
