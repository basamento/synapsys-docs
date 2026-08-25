---
title: Start and stop a process
description: Declare a process, then drive it from the console.
sidebar_position: 4
---

# Start and stop a process

A worker with no processes is just a heartbeat. Processes are the things you
actually start and stop.

## Declare one

```java
@SynapsysProcess(name = "nightly-sync", type = ENDLESS)
public class NightlySync extends AbstractSynapsysProcess {

    @Override
    public void run(StopSignal stop) {
        while (!stop.requested()) {
            reconcileInvoices();
            stop.sleep(Duration.ofMinutes(5));
        }
    }
}
```

Two things are doing work here:

- **`type = ENDLESS`** — this process runs until told to stop. The alternative is
  `PROGRESSIVE`, which runs to completion on its own.
- **`stop.requested()`** — stopping is cooperative. The Core asks; your loop
  decides when it is safe to leave. A process that never checks the signal cannot
  be stopped.

## Drive it

Restart the application. `nightly-sync` now appears under the worker in the
console, in state `idle`.

Press **Start**. Within one heartbeat the state becomes `running`.

Press **Stop**. The state becomes `stopping` first, then `idle` once your loop has
actually returned — not before. That intermediate state is the honest one: it
means the Core has asked and is waiting.

## What just happened

The console did not call your application. It could not — your application has no
open port. It wrote a desired state into the Core's database, and your worker
picked it up on its next heartbeat.

That indirection is the whole design. Read
[the heartbeat protocol](../concepts/heartbeat-protocol) for how it avoids
applying the same command twice.
