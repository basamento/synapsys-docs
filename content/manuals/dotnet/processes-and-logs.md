---
title: Processes, cancellation, logging, and tests
description: Register synchronous and asynchronous .NET business delegates directly or through scoped Generic Host services.
---

# Processes, cancellation, logging, and tests

`SynapsysWorker` has `RegisterEndless` and `RegisterProgressive` overloads for
`Action`, `Action<CancellationToken>`, `Func<Task>`, and
`Func<CancellationToken, Task>`. `SynapsysProcessOptions` adds either synchronous
`OnStop` or asynchronous `OnStopAsync` cleanup; setting both is invalid.

The hosting builder has equivalent `AddEndless<TService>` and
`AddProgressive<TService>` overloads with cancellable and non-cancellable sync or
async service delegates.

## Endless: event-stream consumer

Before Synapsys, ordinary business logic depends only on .NET abstractions:

```csharp title="Before: EventConsumer.cs"
public sealed class EventConsumer(ILogger<EventConsumer> logger)
{
    public async Task ConsumeAsync(CancellationToken cancellationToken)
    {
        await foreach (var message in ReadEventsAsync(cancellationToken))
        {
            logger.LogInformation(
                "Processed event {EventId} for {CustomerId}",
                message.Id,
                message.CustomerId);
        }
    }
}
```

After adoption, wire the same method through a fresh DI scope for every run:

```csharp title="After: Program.cs"
builder.Services.AddScoped<EventConsumer>();

builder.Services
    .AddSynapsys(builder.Configuration.GetSection("Synapsys"))
    .AddEndless<EventConsumer>(
        "event-consumer",
        static (consumer, token) => consumer.ConsumeAsync(token));
```

`CancellationToken` is cancelled when Core sends stop or the host shuts down.
Cancellation remains cooperative; pass it through awaited I/O. The hosting log
provider captures structured `Microsoft.Extensions.Logging` records produced in the
active process execution context while preserving normal providers.

## Progressive: customer-file import

Finite work that does not need in-flight cancellation keeps a clean signature:

```csharp title="Before: CustomerImporter.cs"
public sealed class CustomerImporter(ILogger<CustomerImporter> logger)
{
    public async Task ImportAsync()
    {
        var customers = await ReadCustomersAsync("/imports/customers.csv");
        await SaveCustomersAsync(customers);
        logger.LogInformation("Imported {CustomerCount} customers", customers.Count);
    }
}
```

Register that existing non-cancellable async method directly:

```csharp title="After: Program.cs"
builder.Services.AddScoped<CustomerImporter>();

builder.Services
    .AddSynapsys(builder.Configuration.GetSection("Synapsys"))
    .AddProgressive<CustomerImporter>(
        "customer-file-import",
        static importer => importer.ImportAsync());
```

One accepted start calls `ImportAsync` once. Returning naturally moves the process
to `idle`; the SDK never loops or schedules it.

## Direct registration and legacy cleanup

The framework-neutral path registers instances without DI:

```csharp
worker.RegisterProgressive("customer-file-import", importer.ImportAsync);
worker.RegisterEndless(
    "legacy-socket-listener",
    listener.Run,
    new SynapsysProcessOptions { OnStop = listener.Stop });
```

For explicit process output, `CreateLogger(processName, passthrough)` returns an
`ILogger`, and `CreateTextWriter(processName, source, passthrough)` returns a tee
without replacing `Console.Out` or `Console.Error`. The core SDK depends only on
`Microsoft.Extensions.Logging.Abstractions`. Records, text lines, exception details,
queue size, line length, and UTF-8 heartbeat batches are bounded; failed delivery is
retried without failing business work.

## Lifecycle and failure behavior

Start and stop commands are idempotent. `running` is set before scheduling, a start
while stopping is deferred without acknowledging or replacing the active `runId`,
and an in-flight execution prevents overlap. `OperationCanceledException` after an
accepted stop is clean cancellation. Any other unhandled exception is observed,
logged, captured, and reported as `failed`; it never becomes an unobserved task
exception. See the [shared lifecycle contract](/reference/client-lifecycle).

## Testing recommendations

- Unit-test `ConsumeAsync` with a test cancellation token and `ImportAsync` directly;
  neither needs a Synapsys worker.
- For host integration, build a `ServiceProvider`, verify one scope per accepted run,
  and assert scoped/async-disposable services are released.
- Use the SDK's fake transport seam to test duplicate and deferred commands, int64
  `runId`, malformed 2xx bodies, failed log delivery, and final-heartbeat deadlines.
- Run locked restore, format verification, Release build/test, package validation,
  and the Native AOT smoke test before the first release.
