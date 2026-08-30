---
title: Client libraries and distribution
description: Compatibility, package identifiers, registry status, and immutable release workflows for every Synapsys SDK and starter.
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

The [.NET example](https://github.com/JMarzoli/synapsys-dotnet-sdk-example) is a real
NuGet consumer: its project has a `PackageReference` and `NuGet.Config` points only
to NuGet.org. It does not clone or reference the SDK source. Consequently, restore
is expected to fail until those package IDs are published.

## Repositories and examples

| Library | Source | Runnable consumer example |
| --- | --- | --- |
| Node.js | [`basamento/synapsys-node-sdk`](https://github.com/basamento/synapsys-node-sdk) | [`JMarzoli/synapsys-node-sdk-example`](https://github.com/JMarzoli/synapsys-node-sdk-example) |
| Spring Boot | [`basamento/synapsys-spring-boot-starter`](https://github.com/basamento/synapsys-spring-boot-starter) | [Maven](https://github.com/JMarzoli/synapsys-spring-boot-starter-maven-example), [Gradle](https://github.com/JMarzoli/synapsys-spring-boot-starter-gradle-example) |
| Python | [`basamento/synapsys-python-sdk`](https://github.com/basamento/synapsys-python-sdk) | [`JMarzoli/synapsys-python-sdk-example`](https://github.com/JMarzoli/synapsys-python-sdk-example) |
| Go | [`basamento/synapsys-go-sdk`](https://github.com/basamento/synapsys-go-sdk) | [`JMarzoli/synapsys-go-sdk-example`](https://github.com/JMarzoli/synapsys-go-sdk-example) |
| .NET | [`basamento/synapsys-dotnet-sdk`](https://github.com/basamento/synapsys-dotnet-sdk) | [`JMarzoli/synapsys-dotnet-sdk-example`](https://github.com/JMarzoli/synapsys-dotnet-sdk-example) |

## Publication matrix

Versions are immutable in every registry. A bad published artifact is corrected with
a newer semantic version, never by moving a tag or replacing an existing package.

| Library | Publication workflow | Maintainer setup | Tag format |
| --- | --- | --- | --- |
| Node.js | Tag on `main` must match `package.json`; CI tests Node 16 and 22, stages with npm trusted publishing, then a maintainer reviews and approves the stage with 2FA. | Own the `@synapsys-io` npm scope/package; configure GitHub Actions as trusted publisher for `basamento/synapsys-node-sdk` and allow staged publishing. No stored `NPM_TOKEN`. | `vX.Y.Z` or SemVer prerelease matching `package.json` |
| Spring Boot | Tag must match `pom.xml`; CI builds, signs, and uploads a Central bundle. A maintainer reviews and publishes the staged deployment. | Verified `org.basamento` namespace; Central user token (`CENTRAL_USERNAME`, `CENTRAL_PASSWORD`) and repository GPG key/passphrase secrets. Never publish those values. | `vX.Y.Z` matching the POM |
| Python | Tag, `pyproject.toml`, and `__version__` must agree; CI tests, lints, type-checks, builds, validates, and publishes through PyPI trusted publishing. | Own/create `basamento-synapsys`; configure the PyPI trusted publisher for owner `basamento`, repository `synapsys-python-sdk`, workflow `release.yml`, environment `pypi`. No long-lived token. | `vX.Y.Z` or valid SemVer-compatible prerelease |
| Go | Tag is the distribution. CI validates ancestry/module path, runs formatting, vet, race tests, asks `proxy.golang.org` to fetch the tag, then creates a GitHub release. | Public repository only; no registry account or token. Starting at v2, add `/v2` to module and import paths. | `vX.Y.Z[-prerelease]` |
| .NET | Tag-derived version builds, tests, packs both packages, obtains a one-use NuGet credential through OIDC, pushes immutable packages, then creates a GitHub release. | **Still required:** NuGet.org owner/organization, both ID claims and desired `Basamento` prefix reservation, trusted-publishing policy for repository/workflow/environment `nuget`, and GitHub environment secret `NUGET_USER` containing the profile name. | `vX.Y.Z` or `vX.Y.Z-prerelease`; both packages share the version |

Release tags belong on the release commit on the default branch. Do not create a
tag merely to test publication. Use each repository's `RELEASING.md` and CI workflow
as the operational source of truth.
