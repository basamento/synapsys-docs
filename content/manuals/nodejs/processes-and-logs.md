---
title: Processes and logs
description: Define Node.js endless and progressive processes, cancel I/O safely, and control captured output.
---

# Processes and logs

Register functions before calling `start()`. Process names must be unique within the
worker and should remain stable across deployments so operators recognise them.

Synapsys is not a scheduler. Core decides when a registered function runs. One
Endless start invokes one long-lived body; one Progressive start invokes one finite
body. The SDK never repeatedly calls a finite function to simulate Endless work.

## Endless before and after: queue consumer

Keep the ordinary consumer independent of Synapsys:

```js title="Before: queue-consumer.js"
async function consumeMessages({ queue, logger, signal }) {
  while (!signal.aborted) {
    const message = await queue.receive({ signal });
    logger.info({ messageId: message.id }, 'message processed');
    await queue.ack(message);
  }
}

module.exports = { consumeMessages };
```

Wire the same method at the application boundary using the SDK's native
`AbortSignal`:

```js title="After: app.js"
const { Synapsys } = require('@synapsys-io/sdk');
const { consumeMessages } = require('./queue-consumer');

const synapsys = new Synapsys({ workerName: 'message-worker', logger });
synapsys.endless('message-consumer', (stop) =>
  consumeMessages({ queue, logger, signal: stop.signal })
);
```

The loop is genuine queue-consumer business behavior, not SDK-controlled polling.

## Progressive before and after: customer-file import

Finite business logic remains a directly testable async function:

```js title="Before: customer-import.js"
async function importCustomerFile(path) {
  const customers = await readCustomers(path);
  await customerRepository.saveAll(customers);
  return customers.length;
}

module.exports = { importCustomerFile };
```

Register a zero-argument adapter because this operation does not need cancellation:

```js title="After: app.js"
const { importCustomerFile } = require('./customer-import');

synapsys.progressive('customer-file-import', () =>
  importCustomerFile('/imports/customers.csv')
);
```

For a cancellable batch, keep the same function shape with an optional
`AbortSignal` and pass `ctx.signal`. Business logic that does not need cancellation
is not forced to accept an unused argument.

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

Start and stop are idempotent. A start received while the old run is `stopping` is
left unacknowledged and deferred until that run is terminal; the active `runId`
stays unchanged, so executions never overlap. See the [shared lifecycle
contract](/reference/client-lifecycle).

## Testing recommendations

Unit-test `consumeMessages` with an `AbortController` and test
`importCustomerFile` directly. Use `enabled: false` in application tests that should
make no network calls or replace streams. For SDK integration, exercise duplicate
and deferred commands, exact 64-bit `runId` handling, malformed responses, log
requeue, process failure, and bounded shutdown with a fake Core.
