---
title: Adopt a Node.js background job
description: Replace an unmanaged timer with a startable, stoppable Node.js process and graceful shutdown.
sidebar_position: 5
---

# Adopt a Node.js background job

Use this pattern for a poller or maintenance loop currently started by
`setInterval()`. The business function stays unchanged; the SDK owns when the loop
runs and provides cooperative cancellation.

## Before

```js
const { pollInvoices } = require('./invoice-service');

const timer = setInterval(() => {
  pollInvoices().catch(console.error);
}, 30_000);
```

The timer starts with every application instance, has no central status, and can be
difficult to stop while a deployment is draining.

## After

```js
const { Synapsys } = require('@synapsys-io/sdk');
const { pollInvoices } = require('./invoice-service');

const synapsys = new Synapsys({ workerName: 'billing-api' });

synapsys.endless('invoice-poller', async (stop) => {
  while (!stop.requested) {
    await pollInvoices({ signal: stop.signal });
    await stop.sleep('30s');
  }
});

synapsys.start();

process.on('SIGTERM', async () => {
  await synapsys.stop();
  server.close();
});
```

Set `SYNAPSYS_CORE_URL`, `SYNAPSYS_CORE_TOKEN`, and optionally
`SYNAPSYS_WORKER_NAME` in the deployment environment.

## Things to verify

- Delete the old timer so two loops cannot run together.
- Pass `stop.signal` to network or database calls that support `AbortSignal`.
- Use `stop.sleep()` for delays so Stop does not wait for a timer to expire.
- Keep synchronous CPU-heavy work off the event loop; use `worker_threads` or a
  child process when appropriate.
- Exercise your SIGTERM path in the same way your container platform stops the app.

Open the execution logs after a test run. Output from the job should appear there
and still reach the application's normal logger or console.
