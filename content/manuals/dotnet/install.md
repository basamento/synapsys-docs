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
NuGet.org on 30 August 2026; publication remains blocked on first-release account,
ID ownership/prefix, and trusted-publishing setup.

These are the intended commands, not currently working installation instructions:

```bash
# UNAVAILABLE until the first NuGet.org release
dotnet add package Basamento.Synapsys --version 0.1.0-alpha.1
dotnet add package Basamento.Synapsys.Extensions.Hosting --version 0.1.0-alpha.1
```

Do not add a project reference to a checkout as a substitute in production. The
[.NET example](https://github.com/basamento/synapsys-dotnet-sdk-example) is already a
real NuGet consumer: it references `Basamento.Synapsys.Extensions.Hosting` and its
`NuGet.Config` contains only NuGet.org. It will restore after the first release; it
does not clone or reference SDK source.

The implementation uses nullable reference types, exposes trim/AOT compatibility
metadata, runs an AOT smoke test, and avoids reflection-based process discovery in
the public API. Trimming and Native AOT are goals and are validated where the .NET
and hosting dependencies permit them; they are not a claim that every consumer
dependency is AOT-compatible.

See the [SDK source](https://github.com/basamento/synapsys-dotnet-sdk) and
[publication setup](/reference/client-libraries#publication-matrix). Next:
[configure direct or hosted usage](./configuration).
