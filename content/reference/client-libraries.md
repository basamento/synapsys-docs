---
title: Client libraries and distribution
description: Compatibility, package identifiers, and registry status for every Synapsys SDK and starter.
sidebar_position: 1
---

# Client libraries and distribution

Choose the integration native to the application. All official libraries implement
the same [lifecycle contract](./client-lifecycle); their public APIs and logging
integrations remain idiomatic to each runtime.

## Compatibility and availability

Registry state was verified directly against npm, Maven Central, PyPI, the Go module
proxy, and NuGet.org on **30 August 2026**.

| Platform | Runtime | Package or module | Registry | Current version | Status |
| --- | --- | --- | --- | --- | --- |
| Node.js | Node 16+; CommonJS and ESM | [`@synapsys-io/sdk`](https://www.npmjs.com/package/@synapsys-io/sdk) | npm | `0.2.0` | Available; early `0.x`, not a prerelease build |
| Spring Boot | Java 17+; Spring Boot 3.x | [`org.basamento.synapsys:synapsys-spring-boot-starter`](https://central.sonatype.com/artifact/org.basamento.synapsys/synapsys-spring-boot-starter) | Maven Central | `0.2.0` | Available; early `0.x`, not a prerelease build |
| Python | Python 3.9+ | [`basamento-synapsys`](https://pypi.org/project/basamento-synapsys/) / import `basamento_synapsys` | PyPI | `0.2.0` | Available; classifier is Alpha, version has no prerelease suffix |
| Go | Go 1.22+ | [`github.com/basamento/synapsys-go-sdk`](https://pkg.go.dev/github.com/basamento/synapsys-go-sdk) | Git tag, Go proxy, pkg.go.dev | `v0.1.0` | Available; early `v0` module |
| .NET core | .NET 8+ | `Basamento.Synapsys` | NuGet.org | intended `0.1.0-alpha.1` | **Not published**; NuGet.org currently returns no package |
| .NET hosting | .NET 8+ | `Basamento.Synapsys.Extensions.Hosting` | NuGet.org | intended `0.1.0-alpha.1` | **Not published**; NuGet.org currently returns no package |

There are no other official SDK or starter repositories in the current ecosystem.
The [raw heartbeat API](/manuals/raw-api/overview) remains available to any runtime.

## Consumer commands

```bash
# Node.js
npm install @synapsys-io/sdk@0.2.0

# Python
python -m pip install basamento-synapsys==0.2.0

# Go
go get github.com/basamento/synapsys-go-sdk@v0.1.0
```

```xml
<!-- Spring Boot / Maven -->
<dependency>
  <groupId>org.basamento.synapsys</groupId>
  <artifactId>synapsys-spring-boot-starter</artifactId>
  <version>0.2.0</version>
</dependency>
```

The intended .NET commands are shown for identification only. They do **not** work
until the first NuGet.org release:

```bash
# UNAVAILABLE until first publication
dotnet add package Basamento.Synapsys --version 0.1.0-alpha.1
dotnet add package Basamento.Synapsys.Extensions.Hosting --version 0.1.0-alpha.1
```

The .NET consumer example is not yet public and depends on the first NuGet release.

## Repositories and examples

| Library | Source | Runnable consumer example |
| --- | --- | --- |
| Node.js | [`basamento/synapsys-node-sdk`](https://github.com/basamento/synapsys-node-sdk) | [`basamento/synapsys-node-sdk-example`](https://github.com/basamento/synapsys-node-sdk-example) |
| Spring Boot | [`basamento/synapsys-spring-boot-starter`](https://github.com/basamento/synapsys-spring-boot-starter) | [Maven](https://github.com/basamento/synapsys-spring-boot-starter-maven-example), [Gradle](https://github.com/basamento/synapsys-spring-boot-starter-gradle-example) |
| Python | [`basamento/synapsys-python-sdk`](https://github.com/basamento/synapsys-python-sdk) | [`basamento/synapsys-python-sdk-example`](https://github.com/basamento/synapsys-python-sdk-example) |
| Go | [`basamento/synapsys-go-sdk`](https://github.com/basamento/synapsys-go-sdk) | [`basamento/synapsys-go-sdk-example`](https://github.com/basamento/synapsys-go-sdk-example) |
| .NET | [`basamento/synapsys-dotnet-sdk`](https://github.com/basamento/synapsys-dotnet-sdk) | Not yet public; packages await their first NuGet release |
