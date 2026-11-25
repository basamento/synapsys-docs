---
title: Packages and current availability
description: Understand the framework-neutral and Generic Host Synapsys .NET packages and their pre-publication status.
---

# Packages and current availability

The .NET SDK targets `net8.0` and has two deliberately separate packages:

| Package | Purpose |
| --- | --- |
| `Basamento.Synapsys` | Framework-neutral `SynapsysWorker`, process state and registration, cancellation, heartbeat transport, explicit logging sinks, and `SynapsysOptions`. It can run in a console app with no ASP.NET Core host or dependency-injection container. |
| `Basamento.Synapsys.Extensions.Hosting` | Optional Generic Host integration: `AddSynapsys`, process service scopes, `IHostedService`, `IHttpClientFactory`, configuration binding, and automatic `Microsoft.Extensions.Logging` capture. It references the core package transitively. |

Both package IDs are **not yet published on NuGet.org**. This was verified against
NuGet.org on 30 August 2026.

These are the intended commands, not currently working installation instructions:

```bash
# UNAVAILABLE until the first NuGet.org release
dotnet add package Basamento.Synapsys --version 0.1.0-alpha.1
dotnet add package Basamento.Synapsys.Extensions.Hosting --version 0.1.0-alpha.1
```

The .NET consumer example is not yet public and depends on the first NuGet release.

The implementation uses nullable reference types, exposes trim/AOT compatibility
metadata, runs an AOT smoke test, and avoids reflection-based process discovery in
the public API. Trimming and Native AOT are goals and are validated where the .NET
and hosting dependencies permit them; they are not a claim that every consumer
dependency is AOT-compatible.

See the [SDK source](https://github.com/basamento/synapsys-dotnet-sdk) and
[client library availability](/reference/client-libraries). Next:
[configure direct or hosted usage](./configuration).
