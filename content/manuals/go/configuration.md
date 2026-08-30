---
title: Configuration and application lifecycle
description: Configure a Go worker with options or environment variables and integrate bounded context-driven shutdown.
---

# Configuration and application lifecycle

Options override environment variables.

| Option | Environment variable | Default |
| --- | --- | --- |
| `WithEnabled` | `SYNAPSYS_ENABLED` | `true` |
| `WithCoreURL` | `SYNAPSYS_CORE_URL` | required when enabled |
| `WithCoreToken` | `SYNAPSYS_CORE_TOKEN` | none; missing token warns |
| `WithWorkerName` | `SYNAPSYS_WORKER_NAME` | executable name |
| `WithHost` | `SYNAPSYS_HOST` | machine hostname |
| `WithHeartbeatInterval` | `SYNAPSYS_HEARTBEAT_INTERVAL` | `5s`; positive whole seconds |
| `WithFailFast` | `SYNAPSYS_FAIL_FAST` | `false` |
| `WithConnectTimeout` | `SYNAPSYS_CONNECT_TIMEOUT` | `2s` |
| `WithRequestTimeout` | `SYNAPSYS_REQUEST_TIMEOUT` | `5s` |
| `WithConsoleCapture` | `SYNAPSYS_CAPTURE_CONSOLE` | `true` |
| `WithLogger` | none | `slog.Default()` |

Environment durations use `time.ParseDuration` syntax and require a unit. Options
accept `time.Duration`. `WithEnabled(false)` makes startup a runtime no-op; invalid
declarations still return errors when registered.

## Start and graceful stop

`Start()` performs a bounded unauthenticated health probe, logs configuration once,
and starts an immediate, non-overlapping fixed-delay heartbeat. Core being down is
non-fatal unless `WithFailFast(true)` is set.

Go uses the caller's shutdown context instead of a `shutdown-timeout` setting:

```go
if err := worker.Start(); err != nil {
    return err
}

shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
if err := worker.Stop(shutdown); err != nil {
    logger.Warn("Synapsys shutdown deadline expired", "error", err)
}
```

`Stop` is idempotent. It stops the heartbeat goroutine, cancels active process
contexts, waits within the deadline, sends a final request whose commands are
ignored if time remains, and closes SDK-owned idle connections. A goroutine that
ignores its context is not killed; it remains `stopping` and blocks replacement.

## Structured and text logging

The SDK does not replace process-global `os.Stdout` or `os.Stderr`: goroutines have
no local execution context that could attribute concurrent writes safely. Use
explicit process-scoped sinks:

```go
processLog := worker.Logger("invoice-consumer")
processLog.Info("invoice received", "invoiceId", invoice.ID)

output := worker.Writer("legacy-listener", synapsys.Stdout, os.Stdout)
legacyLog := log.New(output, "", log.LstdFlags)
```

The `slog.Logger` passes records to the application logger and queues Info-or-higher
records only during the named active run. `Writer` is a tee. Both are bounded and
disabled by `WithConsoleCapture(false)`. Plain `fmt.Print` is never captured.

Current `v0.1.0` caveat: an empty 2xx heartbeat body is accepted instead of treated
as a protocol failure. See [current client differences](/reference/client-lifecycle#current-implementation-differences).
