---
title: Connect your first worker
description: Choose an official client, set two connection values, and appear in Core.
---

# Connect your first worker

A worker needs a stable name, the Core URL, and a worker token. Choose the library
that matches your application. Spring Boot, Node.js, Python, and Go are published;
the .NET packages are implemented but awaiting their first NuGet.org release. See
the [verified compatibility and availability table](/reference/client-libraries).

## Spring Boot

Add the Maven Central dependency:

```xml title="pom.xml"
<dependency>
  <groupId>org.basamento.synapsys</groupId>
  <artifactId>synapsys-spring-boot-starter</artifactId>
  <version>0.2.0</version>
</dependency>
```

Then bind the connection values:

```yaml title="application.yaml"
spring:
  application:
    name: billing-api

synapsys:
  core-url: ${SYNAPSYS_CORE_URL}
  core-token: ${SYNAPSYS_CORE_TOKEN}
```

The starter begins heartbeating automatically when the application starts.

## Node.js

Install the public npm package:

```bash
npm install @synapsys-io/sdk@0.2.0
```

Register and start the worker in your entry point:

```js title="app.js"
const { Synapsys } = require('@synapsys-io/sdk');

const synapsys = new Synapsys({ workerName: 'billing-api' });
synapsys.start();
```

`coreUrl` and `coreToken` are read from the environment. ESM users can import the
same API with `import { Synapsys } from '@synapsys-io/sdk'`.

## Python, Go, and .NET

- [Python manual](/manuals/python/install) — `basamento-synapsys==0.2.0`.
- [Go manual](/manuals/go/install) — `github.com/basamento/synapsys-go-sdk@v0.1.0`.
- [.NET manual](/manuals/dotnet/install) — two `net8.0` packages; installation is
  unavailable until the first NuGet.org release.

## Set the environment

Point the worker at the local Core and use the worker credential from
`synapsys.env`:

```dotenv
SYNAPSYS_CORE_URL=http://localhost:8080
SYNAPSYS_CORE_TOKEN=replace-with-your-worker-token
```

Use your runtime, service manager, or secret store to inject these values. Do not
commit a real token to `application.yaml`, `.env`, a container image, or an example.

Start the application, sign in to Core, and open **Workers**. The worker should
appear within one heartbeat interval (five seconds by default). No inbound port on
the worker is required.

Next: [register, start, and stop a process](/docs/start/start-and-stop).
