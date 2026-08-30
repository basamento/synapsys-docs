---
title: Install and adopt
description: Add the Synapsys Node.js SDK from npm and wrap existing background work with minimal changes.
---

# Install and adopt

The Node.js SDK registers existing functions as Synapsys processes and handles
heartbeats, commands, cancellation, and per-run console output. It supports Node.js
16 or later, CommonJS and ESM, ships TypeScript declarations, and has no runtime
dependencies.

## Install from npm

```bash
npm install @synapsys-io/sdk@0.2.0
```

## Before and after

Suppose an application starts a poller during boot:

```js title="Before: app.js"
const { pollInvoices } = require('./jobs/invoice-poller');

setInterval(() => {
  pollInvoices().catch(console.error);
}, 30_000);
```

With Synapsys, keep the same business function and register the operational loop:

```js title="After: app.js"
const { Synapsys } = require('@synapsys-io/sdk');
const { pollInvoices } = require('./jobs/invoice-poller');

const synapsys = new Synapsys({ workerName: 'billing-api' });

synapsys.endless('invoice-poller', async (stop) => {
  while (!stop.requested) {
    await pollInvoices();
    await stop.sleep('30s');
  }
});

synapsys.start();
```

Use `stop.sleep()` instead of a bare timer: it returns immediately when Core sends
a stop, so the process does not remain in `stopping` until the delay expires.

For ESM, only the import changes:

```js
import { Synapsys } from '@synapsys-io/sdk';
```

## Set the connection environment

```dotenv
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_your_token
```

The options object takes precedence over environment variables. Keep tokens in a
secret manager, service definition, or deployment environment—not in source code or
an image.

The worker appears in Core after `synapsys.start()` and its first successful
heartbeat. Next: [configure every environment and shutdown path](./configuration).

Version `0.2.0` is available on [npm](https://www.npmjs.com/package/@synapsys-io/sdk).
The SDK supports Node 16+, CommonJS and ESM, ships TypeScript declarations, and has
no runtime dependencies. See the [source](https://github.com/basamento/synapsys-node-sdk),
the [consumer example](https://github.com/basamento/synapsys-node-sdk-example), and
the [publication matrix](/reference/client-libraries).
