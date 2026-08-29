---
title: Processes and logs
description: Define Node.js endless and progressive processes, cancel I/O safely, and control captured output.
---

# Processes and logs

Register functions before calling `start()`. Process names must be unique within the
worker and should remain stable across deployments so operators recognise them.

## Endless process

```js
synapsys.endless('invoice-poller', async (stop) => {
  while (!stop.requested) {
    await pollInvoices();
    await stop.sleep('30s');
  }
}, {
  onStop: () => connection.close(),
});
```

The body must cooperate with stop requests. `stop.sleep()` wakes early; `requested`
and `isStopRequested()` let you check loops directly.

## Progressive process

```js
synapsys.progressive('monthly-report', async (ctx) => {
  for (const account of accounts) {
    ctx.throwIfCancelled();
    await buildReport(account);
    console.log(`completed ${account.id}`);
  }
});
```

A progressive process returns to `idle` when the function resolves. Pass
`ctx.signal` to APIs such as `fetch` so in-flight I/O aborts when the operator stops
the run:

```js
const response = await fetch(url, { signal: ctx.signal });
```

## Existing functions

Functions do not need to import Synapsys. Register an existing function directly:

```js
const { buildMonthlyReport } = require('./reports');
synapsys.progressive('monthly-report', buildMonthlyReport);
```

## Console capture

During a process run, stdout and stderr are copied to Core and remain visible in the
application's real console. Output is associated with the correct execution even
across `await` and callbacks. Output outside a Synapsys process is not captured.

Because capture transmits process output, review what the code prints. Disable only
this data path while keeping remote control enabled:

```dotenv
SYNAPSYS_CAPTURE_CONSOLE=false
```

## Event-loop limits

Node.js cannot preempt synchronous work. A tight loop, large synchronous parse, or
blocking crypto operation delays heartbeats and every process on the same event
loop. Move CPU-heavy work to `worker_threads` or a child process and drive it from
the registered function.

Errors from one process mark that process `failed`; they do not kill the heartbeat
loop or prevent another process from receiving a command. If Core is unavailable,
running work continues and the SDK retries.
