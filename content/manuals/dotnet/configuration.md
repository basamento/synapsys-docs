---
title: Configuration and hosting
description: Configure SynapsysOptions, use SynapsysWorker directly, or integrate it with the .NET Generic Host and dependency injection.
---

# Configuration and hosting

## Framework-neutral `SynapsysWorker`

Direct use requires only the core namespace. The worker owns a client it creates,
but never disposes a caller-supplied `HttpClient` or `ILoggerFactory`.

```csharp
using Basamento.Synapsys;
using Microsoft.Extensions.Logging;

var options = new SynapsysOptions
{
    CoreUrl = new Uri("https://core.example.com"),
    CoreToken = Environment.GetEnvironmentVariable("SYNAPSYS_CORE_TOKEN"),
    WorkerName = "catalog-worker",
};

using var loggerFactory = LoggerFactory.Create(logging => logging.AddConsole());
using var httpClient = new HttpClient();
await using var worker = new SynapsysWorker(options, loggerFactory, httpClient);

// Register processes here.
await worker.StartAsync();
await applicationStopping;
await worker.StopAsync();
```

No ASP.NET Core, Generic Host, or DI container is required. `StartAsync` validates,
performs the health probe, and starts heartbeats. `StopAsync` is idempotent and
non-throwing for process, transport, and shutdown failures. A stopped worker cannot
be restarted.

## Options

`new SynapsysOptions()` first reads canonical environment variables; explicit
property assignments override those values.

| Property | Environment variable | Default |
| --- | --- | --- |
| `Enabled` | `SYNAPSYS_ENABLED` | `true` |
| `CoreUrl` | `SYNAPSYS_CORE_URL` | required when enabled |
| `CoreToken` | `SYNAPSYS_CORE_TOKEN` | none; missing token warns |
| `WorkerName` | `SYNAPSYS_WORKER_NAME` | entry assembly name |
| `Host` | `SYNAPSYS_HOST` | machine hostname |
| `HeartbeatInterval` | `SYNAPSYS_HEARTBEAT_INTERVAL` | `5s`; positive whole seconds |
| `FailFast` | `SYNAPSYS_FAIL_FAST` | `false` |
| `ConnectTimeout` | `SYNAPSYS_CONNECT_TIMEOUT` | `2s` |
| `RequestTimeout` | `SYNAPSYS_REQUEST_TIMEOUT` | `5s` |
| `ShutdownTimeout` | `SYNAPSYS_SHUTDOWN_TIMEOUT` | `10s` |
| `CaptureConsole` | `SYNAPSYS_CAPTURE_CONSOLE` | `true` |

Environment durations require a unit. `Enabled = false` is a complete runtime
no-op. Unknown keys are rejected by the hosting configuration binder.

## Generic Host and dependency injection

Import `Basamento.Synapsys.Extensions.Hosting` and register one configuration
section or an `Action<SynapsysOptions>`:

```csharp
using Basamento.Synapsys.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddScoped<BusinessProcesses>();

builder.Services
    .AddSynapsys(builder.Configuration.GetSection("Synapsys"))
    .AddEndless<BusinessProcesses>(
        "event-consumer",
        static (service, token) => service.ConsumeEventsAsync(token))
    .AddProgressive<BusinessProcesses>(
        "catalog-import",
        static service => service.ImportCatalogAsync());

await builder.Build().RunAsync();
```

Each accepted run creates a fresh async DI scope. The requested service follows its
registered lifetime; scoped and transient dependencies are disposed when the method
returns. The worker, registration descriptors, hosted service, HTTP integration,
and process log provider are singleton infrastructure.

The hosting package uses `IHttpClientFactory`; it does not create a second manually
owned pool. Its `IHostedService` starts and stops the worker with the host's
`CancellationToken`, so application shutdown is graceful and shares the configured
hard deadline. Standard `Synapsys__CoreUrl` environment mapping applies to a host
configuration section and overrides the canonical defaults.

Next: [register realistic business methods and logs](./processes-and-logs).
