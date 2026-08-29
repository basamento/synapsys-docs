---
title: Configuration
description: Configure the Node.js SDK through environment variables or options, including timeouts, logging, and shutdown.
---

# Configuration

Every Node.js setting can come from the environment or the `Synapsys` options
object. Explicit options win. Environment variables are usually the cleanest way to
reuse the same application build in local, test, staging, and production systems.

## Recommended environment

```dotenv
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_your_token
SYNAPSYS_WORKER_NAME=billing-api
SYNAPSYS_HEARTBEAT_INTERVAL=5s
SYNAPSYS_CONNECT_TIMEOUT=2s
SYNAPSYS_REQUEST_TIMEOUT=5s
SYNAPSYS_FAIL_FAST=false
SYNAPSYS_CAPTURE_CONSOLE=true
SYNAPSYS_LOG_LEVEL=info
```

Do not commit the file containing the real token. If you use a local `.env` loader,
load it before constructing `Synapsys`; the SDK does not read `.env` files itself.

## Settings

| Option | Environment variable | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `SYNAPSYS_ENABLED` | `true` | `false` disables network activity and console capture. |
| `coreUrl` | `SYNAPSYS_CORE_URL` | none | Required Core base URL. |
| `coreToken` | `SYNAPSYS_CORE_TOKEN` | none | Worker bearer token. |
| `workerName` | `SYNAPSYS_WORKER_NAME` | none | Required stable identity across restarts. |
| `host` | `SYNAPSYS_HOST` | machine hostname | Host label reported to Core. |
| `heartbeatInterval` | `SYNAPSYS_HEARTBEAT_INTERVAL` | `5s` | Positive whole seconds between heartbeats. |
| `failFast` | `SYNAPSYS_FAIL_FAST` | `false` | Reject `start()` if Core is unavailable at startup. |
| `connectTimeout` | `SYNAPSYS_CONNECT_TIMEOUT` | `2s` | Connection timeout. |
| `requestTimeout` | `SYNAPSYS_REQUEST_TIMEOUT` | `5s` | Whole heartbeat timeout. |
| `captureConsole` | `SYNAPSYS_CAPTURE_CONSOLE` | `true` | Stream process stdout/stderr to Core. |
| `logLevel` | `SYNAPSYS_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error`, or `silent`. |
| `logger` | none | built-in | A pino-, winston-, bunyan-, or console-compatible logger. |

Durations should carry a unit: `250ms`, `5s`, `2m`, or `1h`. A number means
milliseconds. A unitless string is rejected. Unknown options also throw immediately,
which makes misspellings visible during startup.

## Options object

```js
const synapsys = new Synapsys({
  workerName: 'billing-api',
  heartbeatInterval: '10s',
  captureConsole: true,
  logger: applicationLogger,
});
```

## Graceful shutdown

The SDK does not install signal handlers because doing so would change your
application's existing shutdown behaviour. Add it to the path you already own:

```js
process.on('SIGTERM', async () => {
  await synapsys.stop();
  server.close();
});
```

`stop()` is idempotent: it stops heartbeats, restores console streams, and asks
running processes to stop.

## Test and local profiles

Set `SYNAPSYS_ENABLED=false` when a run should have no timer, network call, or stream
interception. Core configuration is not required while disabled.

Next: [define processes and understand cancellation and capture](./processes-and-logs).
