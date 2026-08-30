---
title: Configuration and application lifecycle
description: Configure the Python SDK, integrate sync and async application lifecycles, and shut down cooperatively.
---

# Configuration and application lifecycle

Keyword arguments override environment variables. Unknown arguments fail
immediately, including while disabled.

| Argument | Environment variable | Default |
| --- | --- | --- |
| `enabled` | `SYNAPSYS_ENABLED` | `True` |
| `core_url` | `SYNAPSYS_CORE_URL` | required when enabled |
| `core_token` | `SYNAPSYS_CORE_TOKEN` | none; missing token warns |
| `worker_name` | `SYNAPSYS_WORKER_NAME` | required when enabled |
| `host` | `SYNAPSYS_HOST` | machine hostname |
| `heartbeat_interval` | `SYNAPSYS_HEARTBEAT_INTERVAL` | `"5s"`; positive whole seconds |
| `fail_fast` | `SYNAPSYS_FAIL_FAST` | `False` |
| `connect_timeout` | `SYNAPSYS_CONNECT_TIMEOUT` | `"2s"` |
| `request_timeout` | `SYNAPSYS_REQUEST_TIMEOUT` | `"5s"` |
| `shutdown_timeout` | `SYNAPSYS_SHUTDOWN_TIMEOUT` | `"10s"` |
| `capture_console` | `SYNAPSYS_CAPTURE_CONSOLE` | `True` |
| `log_level` | `SYNAPSYS_LOG_LEVEL` | `"info"` |
| `logger` | none | `logging.getLogger("basamento_synapsys")` |

Durations carry units (`"250ms"`, `"5s"`, `"2m"`, `"1h"`). A numeric value
means milliseconds; a unitless string is rejected. `enabled=False` is a runtime
no-op: no Core validation, network access, heartbeat thread, or stream replacement.

## Start and stop

The SDK does not install signal handlers. Attach it to the shutdown path the
application already owns:

```python
try:
    worker.start()
    run_application()
finally:
    worker.stop()
```

`with worker:` provides the same synchronous lifecycle. Async applications use
`await worker.start_async()` and `await worker.stop_async()`, or `async with worker`.
Async startup avoids blocking the application event loop and allows async process
bodies to reuse loop-bound resources. Sync process bodies always run on dedicated
threads.

`stop()` is idempotent and non-throwing. It stops normal heartbeats, requests every
active process to stop, waits up to `shutdown_timeout`, sends one best-effort final
snapshot whose commands are ignored, then restores capture. A body that ignores
cancellation is named and left running; Python cannot safely terminate its thread.

Current `0.2.0` caveat: the final request uses `request_timeout`, but is not shortened
to a smaller *remaining* shutdown budget. See [current client differences](/reference/client-lifecycle#current-implementation-differences).

## Application and process logging

SDK diagnostics use Python `logging` and begin with `[Synapsys] `. Healthy
heartbeats are silent. Availability transitions are logged once; the token is never
exposed.

Process `stdout` and `stderr` are tee-captured only within an active execution.
Capture is interpreter-wide, context-attributed, bounded, and restored only if the
SDK still owns the streams. Logging handlers bound to an older stream or direct file
descriptor bypass it. Disable this data path independently with
`capture_console=False`.

For tests, call the original business function directly and construct the worker
with `enabled=False`. See [process registration and examples](./processes-and-logs).
